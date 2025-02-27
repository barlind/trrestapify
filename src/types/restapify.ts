import { Json, JsonCompatible } from './json'

export type CastingOperator = 'number' | 'boolean'
export type HttpVerb = 'GET' | 'POST' | 'DELETE' | 'PUT' |'PATCH'
export type RestapifyEventName = 'error'
  | 'warning'
  | 'start'
  | 'server:start'
  | 'server:restart'
export type RestapifyErrorName = 'INV:JSON_FILE' // json file can't be parsed
  | 'MISS:ROOT_DIR' // given root directory is missing
  | 'MISS:PORT' // given port is not available
  | 'INV:API_BASEURL' // given api base url is needed for internal purposes (ex: `/restapify`)
  | 'INV:SYNTAX' // invalid/unsupported syntax detected
  | 'ERR' // Unhandled error catch
export type RestapifyErrorCallbackParam = {
  error: RestapifyErrorName
  message?: string
}
export type RestapifyEventCallbackParam = RestapifyErrorCallbackParam
export type RestapifyEventCallback = (params?: RestapifyEventCallbackParam) => void
export type JsonRouteFileContent = JsonCompatible<{
  '#body'?: Json
  '#header'?: Json
}>
