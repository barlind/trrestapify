// Archived legacy index.ts re-export hub (2025-10-20)
import type { IPrivateRouteState, IRestapifyParams, IRouteState } from './Restapify'
import Restapify from './Restapify'
import Routes from './Restapify'
import { cli } from './cli/cli'
export * from './types/index'
export * from './Restapify'
export { cli, IRestapifyParams as RestapifyParams, IRouteState as RouteState, Routes, IPrivateRouteState as PrivateRouteState }
export default Restapify
