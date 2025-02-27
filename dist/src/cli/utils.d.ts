import { ValidatorResult } from 'jsonschema';
import Restapify, { RestapifyParams, HttpVerb, RestapifyErrorCallbackParam } from '../index';
export declare const getMethodOutput: (method: HttpVerb) => string;
export declare const consoleError: (message: string) => void;
export declare const getInstanceOverviewOutput: (port: number, publicPath: string, proxyBaseUrl: string) => string;
export declare const onRestapifyInstanceError: (errorObject: RestapifyErrorCallbackParam, instanceData: Pick<Restapify, "publicPath" | "port" | "rootDir">) => void;
export declare const getRoutesListOutput: (routesList: {
    route: string;
    method: HttpVerb;
}[], publicPath: string) => string;
export declare const runServer: (config: RestapifyParams) => void;
export declare const validateConfig: (config: object) => ValidatorResult;
