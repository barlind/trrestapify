import { HttpVerb, JsonRouteFileContent } from './types';
export interface Route {
    directoryPath: string;
    route: string;
    normalizedRoute: string;
    routeVars: string[];
    filename: string;
    fileContent: string;
    method: HttpVerb;
    statusCode: number;
    stateVariable?: string;
    isExtended: boolean;
    header?: {
        [key: string]: string | number;
    };
    body?: JsonRouteFileContent;
    getBody: (vars: {
        [key: string]: string;
    }, queryStringVars?: {
        [key: string]: string;
    }) => JsonRouteFileContent | undefined;
    states?: {
        [state: string]: Pick<Route, 'fileContent' | 'statusCode' | 'header' | 'body' | 'isExtended' | 'getBody'>;
    };
}
export interface QueryStringVarData {
    variable: string;
    defaultValue?: string;
}
export declare const getQueryStringVarSyntax: (data: QueryStringVarData) => string;
export declare const getFilenameFromFilePath: (filePath: string) => string;
export declare const getRouteFromFilePath: (filePath: string) => string;
export declare const getNormalizedRoute: (route: string, vars?: string[]) => string;
export declare const getResponseStatusCodeInFilename: (filename: string) => number;
export declare const getStateVariableInFilename: (filename: string) => string | undefined;
export declare const getHttpMethodInFilename: (filename: string) => HttpVerb;
export declare const getQueryStringVarData: (queryStringSyntax: string) => QueryStringVarData;
export declare const getQueryStringVarsInContent: (content: string) => QueryStringVarData[];
export declare const getContentWithReplacedVars: (content: string, vars: {
    [key: string]: string;
}, queryStringVars?: {
    [key: string]: string;
}) => string;
export declare const isStructureExtended: (jsonContent: {
    [key: string]: any;
}) => boolean;
export declare const isBodyEmpty: (body: JsonRouteFileContent) => boolean;
export declare const getRoute: (filePath: string, entryFolderPath: string, fileContent: string) => Route;
