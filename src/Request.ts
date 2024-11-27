import axios, { AxiosRequestConfig } from 'axios';
import { IRequestConfig, ICustomResponse } from './types';
import { Response } from './Response';

export class Request {
    protected config: AxiosRequestConfig;

    constructor(config: IRequestConfig = {}) {
        this.config = config as AxiosRequestConfig;
    }

    send(): Promise<ICustomResponse> {
        return axios.request(this.config).then(response => new Response(response));
    }
}
