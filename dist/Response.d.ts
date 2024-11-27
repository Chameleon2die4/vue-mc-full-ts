import { AxiosResponse } from 'axios';
import { ICustomResponse, IResponseData } from './types';
export declare class Response implements ICustomResponse {
    response: AxiosResponse;
    constructor(response: AxiosResponse);
    getData(): IResponseData;
    getStatus(): number;
    getHeaders(): any;
    getValidationErrors(): any[];
}
