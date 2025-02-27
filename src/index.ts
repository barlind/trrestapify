import type { IPrivateRouteState, IRestapifyParams, IRouteState } from './Restapify'

import Restapify from './Restapify'
import Routes from './Restapify'
import { cli } from './cli/cli'

export * from './types/index'
export * from './Restapify'
export {
  cli,
  IRestapifyParams as RestapifyParams,
  IRouteState as RouteState,
  Routes,
  IPrivateRouteState as PrivateRouteState
}

export default Restapify

const restapify = new Restapify({
  rootDir: './routes',
  port: 4001,
  baseUrl: '/',
  states: [],
  hotWatch: true
})

restapify.run()
