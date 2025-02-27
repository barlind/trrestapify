import { Application } from 'express';
import { IPrivateRouteState } from './Restapify';
import { Routes } from './Restapify';
import { IRouteState } from './Restapify';
export interface InternalApiParams {
    setState: (newState: IRouteState) => void;
    states: IPrivateRouteState[];
    routes: Routes;
    port: number;
    baseUrl: string;
}
export declare const getInitialisedInternalApi: (app: Application, params: InternalApiParams) => Application;
