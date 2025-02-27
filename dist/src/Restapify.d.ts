import { HttpVerb, RestapifyErrorCallbackParam, RestapifyEventCallback, RestapifyEventName } from './types';
import { Route as RouteData } from './getRoute';
declare class Restapify {
    private eventCallbacksStore;
    private app;
    private server;
    private chokidarWatcher;
    private listedRouteFiles;
    routes: Routes;
    rootDir: string;
    port: number;
    publicPath: string;
    states: IPrivateRouteState[];
    hotWatch: boolean;
    constructor({ rootDir, port, baseUrl, states, hotWatch }: IRestapifyParams);
    private readonly listRouteFiles;
    private readonly configHotWatch;
    private readonly configServer;
    private readonly configInternalApi;
    private readonly handleHttpServerErrors;
    private readonly restartServer;
    private readonly checkpublicPath;
    private readonly checkRootDirectory;
    private readonly checkJsonFiles;
    private readonly configRoutesFromListedFiles;
    private readonly getRouteData;
    private readonly serveRoutes;
    private readonly getUserId;
    private readonly serveRoute;
    private readonly listenRoute;
    private readonly startServer;
    private readonly customRun;
    private readonly configEventsCallbacks;
    private readonly removeState;
    private readonly createSingleEventStoreIfMissing;
    private readonly addSingleEventCallbackToStore;
    private readonly addEventCallbackToStore;
    private readonly executeCallbacksForSingleEvent;
    private readonly executeCallbacks;
    private readonly closeServer;
    private readonly closeChokidarWatcher;
    setState: (newState: IRouteState) => void;
    getServedRoutes: () => {
        route: string;
        method: HttpVerb;
    }[];
    close: () => void;
    on: (event: RestapifyEventName | RestapifyEventName[], callback: RestapifyEventCallback) => void;
    onError: (callback: (params: RestapifyErrorCallbackParam) => void) => void;
    run: () => void;
}
export default Restapify;
export type Routes = {
    [method in HttpVerb]: {
        [url: string]: RouteData;
    };
};
export interface IRouteState {
    route: string;
    state?: string;
    method?: HttpVerb;
}
export interface IRunOptions {
    hard?: boolean;
    startServer?: boolean;
    hotWatch?: boolean;
}
export interface IRestapifyParams {
    rootDir: string;
    port?: number;
    baseUrl?: string;
    states?: IRouteState[];
    hotWatch?: boolean;
}
export interface IPrivateRouteState extends Omit<IRouteState, 'state'> {
    state: string;
}
