import { HttpVerb } from './types';
export declare const getDirs: (p: string) => string[];
export declare const getFiles: (p: string) => string[];
export declare const replaceAll: (str: string, find: string, replace: string) => string;
export declare const getVarsInPath: (pathParam: string) => string[];
export declare const isHttpVerb: (str: string) => boolean;
export declare const isStateVariable: (str: string) => boolean;
export declare const isNumeric: (str: string) => boolean;
export declare const routeResolve: (...routes: string[]) => string;
interface OrderedRoutes {
    route: string;
    method: HttpVerb;
}
export declare const getRoutesByFileOrder: (routes: Record<HttpVerb, Record<string, any>>) => OrderedRoutes[];
export declare const getRouteFiles: (rootDir: string, files?: {
    [filename: string]: string;
}) => {
    [filename: string]: string;
};
export declare const getVarCastSyntax: (variable: string, type: "number" | "boolean") => string;
export declare const replaceAllCastedVar: (content: string, variable: string, value: string) => string;
export {};
//# sourceMappingURL=utils.d.ts.map