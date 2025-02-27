import * as fs from 'fs'
import * as path from 'path'
// @ts-ignore
import express, { Application, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import * as http from 'http'
import * as chokidar from 'chokidar'
import nocache from 'nocache'

import {
  HttpVerb,
  RestapifyErrorCallbackParam,
  RestapifyErrorName,
  RestapifyEventCallback,
  RestapifyEventCallbackParam,
  RestapifyEventName
} from './types'
import {
  INTERNAL_BASEURL,
} from './const'

import {
  getRouteFiles,
  getRoutesByFileOrder as getRoutesByFileOrderHelper,
  getSortedRoutesSlug,
  isJsonString,
  routeResolve,
  withoutUndefinedFromObject
} from './utils'
import { getRoute, Route as RouteData } from './getRoute'
import { getInitialisedInternalApi } from './internalApi'
import chalk from 'chalk'

const DEFAULT_PORT = 4001

type EventCallbackStore = {
  [event in RestapifyEventName]?: RestapifyEventCallback[]
}
type ListedFiles = {
  [filename: string]: string
}

class Restapify {
  private eventCallbacksStore: EventCallbackStore = {}
  private app: Application
  private server: http.Server
  private chokidarWatcher: chokidar.FSWatcher
  private listedRouteFiles: ListedFiles = {}
  public routes: Routes = {
    GET: {}, POST: {}, DELETE: {}, PUT: {}, PATCH: {}
  }
  public rootDir: string
  public port: number
  public publicPath: string
  public states: IPrivateRouteState[] = []
  public hotWatch: boolean
  public proxyBaseUrl: string

  constructor({
    rootDir,
    port = DEFAULT_PORT,
    baseUrl = '/',
    states = [],
    hotWatch = true,
    proxyBaseUrl = ''
  }: IRestapifyParams) {
    this.rootDir = rootDir
    this.port = port
    this.publicPath = baseUrl
    this.hotWatch = hotWatch
    this.proxyBaseUrl = proxyBaseUrl
    this.states = states.filter(state => {
      return state.state !== undefined
    }) as IPrivateRouteState[]
  }

  private readonly listRouteFiles = (): void => {
    this.listedRouteFiles = getRouteFiles(this.rootDir)
  }

  private readonly configHotWatch = (): void => {
    if (this.hotWatch) {
      this.chokidarWatcher = chokidar.watch(this.rootDir, {
        ignoreInitial: true
      })

      const events: Array<'change' | 'unlink'> = ['change', 'unlink']

      events.forEach(event => {
        this.chokidarWatcher.on(event, () => {
          this.restartServer({ hard: true })
        })
      })
    }
  }

  private readonly configServer = (): void => {
    this.app = express()
    this.server = http.createServer(this.app)

    // Add middleware to parse request's body
    this.app.use(express.json())
    this.app.use(nocache())
    this.app.set('etag', false)

    // Handle CORS
    this.app.use(cors())
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      res.set('Cache-Control', 'no-store')
      next()
    })

    this.handleHttpServerErrors()
    this.configRoutesFromListedFiles()
    this.serveRoutes()

    this.app.use((req: Request, res: Response, next: NextFunction): void => {
      (async () => {
        if (req.originalUrl === "/" || req.originalUrl === "/favicon.ico") {
          return next();
        }

        try {
          if (this.proxyBaseUrl != '') {
            console.log(
              `No matching local route for ${req.method} ${chalk.blue(
                req.originalUrl
              )}, forwarding...`
            );
            const proxyUrl = `${this.proxyBaseUrl}${req.originalUrl}`;
            const forwardedHeaders: Record<string, string> = Object.entries(req.headers).reduce(
              (acc, [key, value]) => {
                if (typeof value === "string") {
                  acc[key] = value;
                } else if (Array.isArray(value)) {
                  acc[key] = value.join(", ");
                }
                return acc;
              },
              {} as Record<string, string>
            );

            const proxyResponse = await fetch(proxyUrl, {
              method: req.method,
              headers: forwardedHeaders,
              body: ["GET", "HEAD"].includes(req.method) ? undefined : req.body,
            });

            res.appendHeader("response-was-proxied", "true");

            const proxyText = await proxyResponse.text();
            let proxyData;
            try {
              proxyData = JSON.parse(proxyText);
            } catch (jsonError) {
              console.error(
                `Failed to parse JSON from proxy ${this.proxyBaseUrl} for ${req.originalUrl}:`,
                jsonError
              );
              return res
                .status(500)
                .send(
                  `Invalid JSON received from proxy ${this.proxyBaseUrl} request to ${req.originalUrl}. Response was: '${proxyText}'`
                );
            }

            res.status(proxyResponse.status).json(proxyData);
            console.log(
              `Served ${chalk.italic("forwarded content")} for ${chalk.blue(
                req.originalUrl
              )} with status ${proxyResponse.status} from ${this.proxyBaseUrl}.`
            );
          }
        } catch (err) {
          console.error("Proxy request failed:", err);
          res
            .status(500)
            .send(
              `Failed to get result from proxy request to ${req.originalUrl}. Error was ${err}`
            );
        }
      })().catch(next);
    });

  }


  private readonly configInternalApi = (): void => {
    const {
      routes,
      states,
      port,
      publicPath: baseUrl
    } = this
    this.app = getInitialisedInternalApi(this.app, {
      port,
      baseUrl,
      routes,
      states,
      setState: this.setState
    })
  }

  private readonly handleHttpServerErrors = (): void => {
    this.server.on('error', (e: NodeJS.ErrnoException) => {
      if (e.code === 'EADDRINUSE') {
        const error: RestapifyErrorName = 'MISS:PORT'
        this.executeCallbacksForSingleEvent('error', { error })
      } else {
        console.log(`Unknown error ${e.code}`)
      }
    })
  }

  private readonly restartServer = (options?: IRunOptions): void => {
    this.executeCallbacks('server:restart')
    this.closeServer()
    this.customRun({ ...options, hard: false })
  }

  private readonly checkpublicPath = (): void => {
    if (this.publicPath.startsWith(INTERNAL_BASEURL)) {
      const error: RestapifyErrorName = 'INV:API_BASEURL'
      const errorObject = { error }
      throw new Error(JSON.stringify(errorObject))
    }
  }

  private readonly checkRootDirectory = (): void => {
    const folderExists = fs.existsSync(this.rootDir)
    if (!folderExists) {
      const error: RestapifyErrorName = 'MISS:ROOT_DIR'
      const errorObject = { error }
      throw new Error(JSON.stringify(errorObject))
    }
  }

  private readonly checkJsonFiles = (): void => {
    Object.keys(this.listedRouteFiles).forEach(routeFilePath => {
      const routeFileContent = this.listedRouteFiles[routeFilePath]
      const isJsonValidResponse = isJsonString(routeFileContent)
      // eslint-disable-next-line max-len
      if (isJsonValidResponse !== true) {
        const error: RestapifyErrorName = 'INV:JSON_FILE'
        const errorObject = {
          error,
          message: `Invalid json file ${routeFilePath}: ${isJsonValidResponse}`
        }
        throw new Error(JSON.stringify(errorObject))
      }
    })
  }

  private readonly configRoutesFromListedFiles = (): void => {
    Object.keys(this.listedRouteFiles).forEach(routeFilePath => {
      const routeData = getRoute(
        routeFilePath,
        this.rootDir,
        this.listedRouteFiles[routeFilePath]
      )
      const {
        route,
        method,
        stateVariable,
        body,
        getBody,
        header,
        isExtended,
        statusCode,
        fileContent
      } = routeData

      routeData.directoryPath = path.dirname(routeFilePath)

      const routeExist = this.routes[method][route] !== undefined

      if (!routeExist) {
        this.routes[method][route] = {} as RouteData
      }


      if (stateVariable) {
        if (this.routes[method][route] === undefined) {
          this.routes[method][route] = {} as RouteData
        }

        if (this.routes[method][route].states === undefined) {
          this.routes[method][route].states = {}
        }

        // @ts-ignore
        this.routes[method][route].states[stateVariable] = withoutUndefinedFromObject({
          body,
          fileContent,
          header,
          isExtended,
          statusCode,
          getBody
        })
      } else {
        this.routes[method][route] = { ...this.routes[method][route], ...routeData }
      }
    })
  }

  private readonly getRouteData = (
    method: HttpVerb,
    route: string
  ): RouteData | null => {
    if (!this.routes[method][route]) {
      return null
    }

    const routeData = this.routes[method][route]
    const matchingState = this.states.find(state => {
      return state.route === route
        && (state.method === method
          || (state.method === undefined && method === 'GET'))
    })

    if (matchingState && routeData.states) {
      const { state } = matchingState

      return { ...routeData, ...routeData.states[state] }
    }

    return routeData
  }

  private readonly serveRoutes = (): void => {
    (Object.keys(this.routes) as HttpVerb[]).forEach(method => {
      const routesSlug = Object.keys(this.routes[method])
      const sortedRoutesSlug = getSortedRoutesSlug(routesSlug)

      sortedRoutesSlug.forEach(route => {
        const routeData = this.getRouteData(method, route)

        if (routeData) {
          this.serveRoute(routeData)
        }
      })
    })
  }

  private readonly getUserId = (authzValue: string): string => {
    try {
      authzValue = authzValue.replace("Bearer ", "")
      const base64Url = authzValue.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
          })
          .join('')
      )

      return JSON.parse(jsonPayload).sub;
    } catch (error) {
      return "";
    }
  }

  private readonly serveRoute = (routeData: RouteData): void => {
    let {
      normalizedRoute,
      routeVars,
      statusCode,
      header
    } = routeData

    normalizedRoute = routeResolve(this.publicPath, normalizedRoute)

    const responseCallback = async (req: Request, res: Response): Promise<void> => {
      res.status(statusCode)
      res.header('Content-Type', 'application/json; charset=utf-8')

      if (header) {
        res.header(header)
      }

      // 1. Check for custom header
      const userId = this.getUserId(req.headers['authorization'] ?? '') // or whatever header key
      if (userId && routeData.directoryPath) {
        // 2. See if a file like "user-id-guid.json" exists
        const customJsonFilename = `${userId}.json`
        const customFilePath = path.join(routeData.directoryPath, customJsonFilename)
        if (fs.existsSync(customFilePath)) {
          // 3. Serve that file’s content
          const customFileContent = JSON.parse(fs.readFileSync(customFilePath, 'utf8'))
          res.send(JSON.stringify(customFileContent))
          return
        }
      }

      let vars: { [key: string]: string } = {}
      routeVars.forEach(variable => {
        vars[variable] = req.params[variable]
      })

      const queryStringVarsToReplace = Object.fromEntries(
        Object.entries(req.query).map(([key, value]) => [key, String(value)])
      );
      const responseBody = routeData.getBody(vars, queryStringVarsToReplace)

      if (responseBody) {
        res.send(JSON.stringify(responseBody))
      } else {
        res.end()
      }

      console.log(`Served content for ${chalk.blue(normalizedRoute)} ${userId ? ('for user ' + userId) : ''}`);
    }

    this.listenRoute(routeData.method, normalizedRoute, responseCallback)
  }

  private readonly listenRoute = (
    method: HttpVerb,
    route: string,
    callback: (req: Request, res: Response) => void
  ): void => {
    switch (method) {
      case 'POST':
        this.app.post(route, callback)
        break

      case 'DELETE':
        this.app.delete(route, callback)
        break

      case 'PUT':
        this.app.put(route, callback)
        break

      case 'PATCH':
        this.app.patch(route, callback)
        break

      case 'GET': default:
        this.app.get(route, callback)
        break
    }
  }

  private readonly startServer = (): void => {
    this.server.listen(this.port)
  }

  private readonly customRun = (options: IRunOptions = {}): void => {
    const {
      hard = true,
      startServer = true,
      hotWatch = true
    } = options

    try {
      if (hard) {
        this.configEventsCallbacks()
        this.checkpublicPath()
        this.checkRootDirectory()
      }

      this.listRouteFiles()
      this.checkJsonFiles()
      this.configRoutesFromListedFiles()

      if (startServer) {
        this.configServer()
        this.configInternalApi()
      }

      if (hard && hotWatch) this.configHotWatch()
      if (hard && startServer) this.executeCallbacks('server:start')

      if (startServer) this.startServer()

      if (hard) this.executeCallbacks('start')
    } catch (error) {
      if (isJsonString(error.message)) {
        const { error: errorId, message } = JSON.parse(error.message)
        this.executeCallbacks('error', { error: errorId, message })
      } else {
        this.executeCallbacks('error', { error: 'ERR', message: error.message })
      }
    }
  }

  private readonly configEventsCallbacks = (): void => {
    this.onError(({ error }) => {
      if (error === 'MISS:PORT') {
        this.port += 1
        this.restartServer({ hard: true })
      }
    })
  }

  private readonly removeState = (route: string, method?: HttpVerb): void => {
    this.states = this.states.filter(state => {
      return state.route !== route && state.method !== method
    })
  }

  private readonly createSingleEventStoreIfMissing = (eventName: RestapifyEventName): void => {
    if (this.eventCallbacksStore[eventName] === undefined) {
      this.eventCallbacksStore[eventName] = []
    }
  }

  private readonly addSingleEventCallbackToStore = (
    event: RestapifyEventName,
    callback: RestapifyEventCallback
  ): void => {
    this.createSingleEventStoreIfMissing(event)

    // @ts-ignore
    this.eventCallbacksStore[event].push(callback)
  }

  private readonly addEventCallbackToStore = (
    event: RestapifyEventName | RestapifyEventName[],
    callback: RestapifyEventCallback
  ): void => {
    if (Array.isArray(event)) {
      event.forEach(eventName => {
        this.addSingleEventCallbackToStore(eventName, callback)
      })
    } else {
      this.addSingleEventCallbackToStore(event, callback)
    }
  }

  private readonly executeCallbacksForSingleEvent = (
    event: RestapifyEventName,
    params?: RestapifyEventCallbackParam
  ): void => {
    const callbacks = this.eventCallbacksStore[event]
    if (callbacks) {
      callbacks.forEach(callback => {
        if (params) {
          callback(params)
        } else {
          callback()
        }
      })
    }
  }

  private readonly executeCallbacks = (
    event: RestapifyEventName | RestapifyEventName[],
    params?: RestapifyEventCallbackParam
  ): void => {
    if (Array.isArray(event)) {
      event.forEach(eventName => {
        this.executeCallbacksForSingleEvent(eventName, params)
      })
    } else {
      this.executeCallbacksForSingleEvent(event, params)
    }
  }

  private readonly closeServer = (): void => {
    this.server.close()
  }

  private readonly closeChokidarWatcher = (): void => {
    this.chokidarWatcher.close()
  }

  public setState = (newState: IRouteState): void => {
    if (newState.state) {
      const actualStateIndex = this.states.findIndex(state => {
        return state.route === newState.route && state.method === newState.method
      })
      const stateExist = actualStateIndex !== -1

      if (stateExist) {
        this.states[actualStateIndex] = newState as IPrivateRouteState
      } else {
        this.states.push(newState as IPrivateRouteState)
      }
    } else {
      this.removeState(newState.route, newState.method)
    }

    this.restartServer()
  }

  public getServedRoutes = (): {
    route: string,
    method: HttpVerb
  }[] => {
    this.customRun({
      startServer: false,
      hotWatch: false,
      hard: false
    })
    return getRoutesByFileOrderHelper(this.routes)
  }

  public close = (): void => {
    if (this.server) this.closeServer()
    if (this.hotWatch && this.chokidarWatcher) this.closeChokidarWatcher()
  }

  public on = (
    event: RestapifyEventName | RestapifyEventName[],
    callback: RestapifyEventCallback
  ): void => {
    this.addEventCallbackToStore(event, callback)
  }

  public onError = (callback: (params: RestapifyErrorCallbackParam) => void): void => {
    this.addSingleEventCallbackToStore('error', callback)
  }

  public run = (): void => {
    this.customRun()
  }
}

export default Restapify;

export type Routes = {
  [method in HttpVerb]: { [url: string]: RouteData; };
};

// I N T E R F A C E S
export interface IRouteState {
  route: string;
  state?: string;
  method?: HttpVerb;
}
export interface IRunOptions {
  hard?: boolean;
  startServer?: boolean;
  hotWatch?: boolean;
}
export interface IRestapifyParams {
  rootDir: string;
  port?: number;
  baseUrl?: string;
  states?: IRouteState[];
  hotWatch?: boolean;
  proxyBaseUrl?: string
}

export interface IPrivateRouteState extends Omit<IRouteState, 'state'> {
  state: string
}
