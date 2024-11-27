import { AxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';
import { IRequestConfig, ICustomResponse } from './types';
import { Response } from './Response';
import { RequestError } from './errors/RequestError';
export declare class Request {
    protected config: AxiosRequestConfig;
    constructor(config?: IRequestConfig);
    protected createResponse(axiosResponse: AxiosResponse): Response;
    protected createError(axiosError: AxiosError): RequestError;
    send(): Promise<ICustomResponse>;
}
