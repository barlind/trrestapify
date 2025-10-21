export type CastingOperator = 'number' | 'boolean'
export type HttpVerb = 'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH'
export type RestapifyErrorName = 'INV:JSON_FILE'
  | 'MISS:ROOT_DIR'
  | 'MISS:PORT'
  | 'INV:API_BASEURL'
  | 'INV:SYNTAX'
  | 'ERR'
export type Json = null | boolean | number | string | Json[] | { [prop: string]: Json }
export type JsonRouteFileContent = { [key: string]: Json }
