import { Route } from './getRoute';
import { HttpVerb } from './types';
export interface LoadedRoutes {
    byMethod: Record<HttpVerb, Record<string, Route>>;
    all: Route[];
}
export declare const loadRoutes: (rootDir: string) => LoadedRoutes;
export declare function createCoreLib(rootDir: string): {
    listRoutes(): Route[];
    getRouteByPath(method: HttpVerb, route: string): Route | undefined;
    getMatchedRoute: (method: HttpVerb, requestPath: string) => Route | undefined;
};
export * from './types';
export * from './getRoute';
export * from './utils';
export * from './git/BranchWorktreeManager';
//# sourceMappingURL=index.d.ts.map