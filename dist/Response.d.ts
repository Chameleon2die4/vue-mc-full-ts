import { AxiosResponse } from 'axios';
import { ICustomResponse, IResponseData } from './types';
export declare class Response<T = IResponseData> implements ICustomResponse<T> {
    response: AxiosResponse;
    constructor(response: AxiosResponse);
    getData(): T;
    getStatus(): number;
    getHeaders(): any;
    getValidationErrors(): any[];
}
