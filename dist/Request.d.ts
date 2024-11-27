import { AxiosRequestConfig } from 'axios';
import { IRequestConfig, ICustomResponse } from './types';
export declare class Request {
    protected config: AxiosRequestConfig;
    constructor(config?: IRequestConfig);
    send(): Promise<ICustomResponse>;
}
