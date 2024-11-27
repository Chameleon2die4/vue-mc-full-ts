import { AxiosResponse } from 'axios';
export interface IResponseData {
    [key: string]: any;
}
export interface ICustomResponse {
    response: AxiosResponse;
    getData(): IResponseData;
    getStatus(): number;
    getHeaders(): any;
    getValidationErrors(): any[];
}
export interface IRequestConfig {
    method?: string;
    url?: string;
    data?: any;
    headers?: any;
    params?: any;
    [key: string]: any;
}
export interface IRequestOptions {
    /**
     * HTTP method for the request
     */
    method?: string;
    /**
     * URL for the request
     */
    url?: string;
    /**
     * Data to be sent as the request body
     */
    data?: Record<string, any>;
    /**
     * Query parameters to be added to the URL
     */
    params?: Record<string, any>;
    /**
     * Request headers
     */
    headers?: Record<string, any>;
}
export interface IRequestError extends Error {
    error: Error;
    response?: ICustomResponse;
    getError(): Error;
    getResponse(): ICustomResponse | undefined;
}
export interface IResponseError extends Error {
    response: ICustomResponse;
    getResponse(): ICustomResponse;
}
export type Routes = Record<'fetch' | 'save' | 'delete' | string, string>;
