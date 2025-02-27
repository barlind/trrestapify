import * as fs from 'fs'
import * as path from 'path'
import { Command } from 'commander'

import * as packageJson from '../../package.json'

import { listRoutes } from './run/listRoutes'
import { startServer } from './run/startServer'
import { outputInvalidFilePathError, startServerFromConfig } from './run/startServerFromConfig'
import { consoleError } from './utils'

export const cli = (cliArgs: string[]): void => {
  const program = new Command()

  program
    .version(packageJson.version, '-v, --version', 'output the current version')
    .option('-p, --port <number>', 'port to serve Restapify instance')
    .option('-b, --baseUrl <string>', 'base url to serve the API')
    
  program
    .command('serve <rootDir> [proxyBaseUrl]')
    .description('serve a mocked API from folder <rootDir> with an optional [proxyBaseUrl]')
    .action((rootDir, proxyBaseUrl = 'https://public-web-api-dev.trr.se'): void => {
        startServer({
          rootDir: path.resolve(rootDir),
          baseUrl: '/',
          port: 4001,
          proxyBaseUrl
        })
    })

  program
    .command('list <rootDir>')
    .description('list all routes to serve from folder <rootDir>')
    .action((rootDir): void => {
      listRoutes(path.resolve(rootDir))
    })

  program
    .arguments('[pathToConfig]')
    .action((pathToConfig: string = './restapify.config.json'): void => {
    
      const configPath = path.resolve(pathToConfig)
      const configFileExists = fs.existsSync(configPath)

      if (!configFileExists) {
        consoleError(`The given configuration file ${pathToConfig} doesn't exist!`)
        return
      }

      const isConfigJs = pathToConfig.endsWith('.js')
      if (isConfigJs) {
        // eslint-disable-next-line global-require
        const config = require(configPath)
        startServerFromConfig(configPath, config)
        return
      }

      try {
        startServerFromConfig(configPath, JSON.parse(fs.readFileSync(path.resolve(pathToConfig), 'utf-8')))
      } catch (error) {
        outputInvalidFilePathError(configPath)
      }
    })

  program.parse(cliArgs)
}
