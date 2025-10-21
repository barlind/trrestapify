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
}
export declare const getRoute: (filePath: string, entryFolderPath: string, fileContent: string) => Route;
//# sourceMappingURL=getRoute.d.ts.map