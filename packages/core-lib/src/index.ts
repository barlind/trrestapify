import { getRouteFiles } from './utils'
import { getRoute, Route } from './getRoute'
import { HttpVerb } from './types'

export interface LoadedRoutes {
  byMethod: Record<HttpVerb, Record<string, Route>>
  all: Route[]
}

export const loadRoutes = (rootDir: string): LoadedRoutes => {
  const files = getRouteFiles(rootDir)
  const byMethod: Record<HttpVerb, Record<string, Route>> = {
    GET: {}, POST: {}, PUT: {}, PATCH: {}, DELETE: {}
  }
  const all: Route[] = []
  Object.keys(files).forEach(fp => {
    try {
      const r = getRoute(fp, rootDir, files[fp])
      all.push(r)
      // key by original route slug
      if (!byMethod[r.method][r.route]) byMethod[r.method][r.route] = r
    } catch (e) {
      // ignore broken json for now
    }
  })
  return { byMethod, all }
}

function routeToRegex(normalizedRoute: string): RegExp {
  // Convert :var segments to a capturing group
  const pattern = '^' + normalizedRoute.replace(/:[^/]+/g, '([^/]+)') + '$'
  return new RegExp(pattern)
}

export function createCoreLib(rootDir: string) {
  const loaded = loadRoutes(rootDir)
  // Precompute normalized regex per route
  const methodRegexIndex: Record<HttpVerb, { route: Route; regex: RegExp }[]> = {
    GET: [], POST: [], PUT: [], PATCH: [], DELETE: []
  }
  loaded.all.forEach(r => {
    methodRegexIndex[r.method].push({ route: r, regex: routeToRegex(r.normalizedRoute) })
  })
  function getMatchedRoute(method: HttpVerb, requestPath: string): Route | undefined {
    const entries = methodRegexIndex[method]
    for (const entry of entries) {
      if (entry.regex.test(requestPath)) return entry.route
    }
    return undefined
  }
  return {
    listRoutes(): Route[] { return loaded.all },
    getRouteByPath(method: HttpVerb, route: string): Route | undefined { return loaded.byMethod[method][route] },
    getMatchedRoute
  }
}

export * from './types'
export * from './getRoute'
export * from './utils'
export * from './git/BranchWorktreeManager'
