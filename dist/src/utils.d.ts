import { HttpVerb } from './types';
import { Routes } from './Restapify';
export declare const getDirs: (p: string) => string[];
export declare const getFiles: (p: string) => string[];
export declare const replaceAll: (str: string, find: string, replace: string) => string;
export declare const getVarsInPath: (pathParam: string) => string[];
export declare const isHttpVerb: (str: string) => boolean;
export declare const isStateVariable: (str: string) => boolean;
export declare const isNumeric: (str: string) => boolean;
export declare const routeResolve: (...routes: string[]) => string;
export declare const withoutUndefinedFromObject: (obj: Object) => Object;
interface OrderedRoutes {
    route: string;
    method: HttpVerb;
}
export declare const getRoutesByFileOrder: (routes: Routes) => OrderedRoutes[];
export declare const getRouteFiles: (rootDir: string, files?: {
    [filename: string]: string;
}) => {
    [filename: string]: string;
};
export declare const isJsonString: (str: string) => true | string;
export declare const getVarCastSyntax: (variable: string, type: "number" | "boolean") => string;
export declare const replaceAllCastedVar: (content: string, variable: string, value: string) => string;
export declare const getSortedRoutesSlug: (routesSlug: string[]) => string[];
export {};
