import { Json, JsonCompatible } from './json';
export type CastingOperator = 'number' | 'boolean';
export type HttpVerb = 'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH';
export type RestapifyEventName = 'error' | 'warning' | 'start' | 'server:start' | 'server:restart';
export type RestapifyErrorName = 'INV:JSON_FILE' | 'MISS:ROOT_DIR' | 'MISS:PORT' | 'INV:API_BASEURL' | 'INV:SYNTAX' | 'ERR';
export type RestapifyErrorCallbackParam = {
    error: RestapifyErrorName;
    message?: string;
};
export type RestapifyEventCallbackParam = RestapifyErrorCallbackParam;
export type RestapifyEventCallback = (params?: RestapifyEventCallbackParam) => void;
export type JsonRouteFileContent = JsonCompatible<{
    '#body'?: Json;
    '#header'?: Json;
}>;
