import { ICustomResponse, IResponseError } from '../types';
export declare class ResponseError extends Error implements IResponseError {
    response: ICustomResponse;
    constructor(response: ICustomResponse);
    getResponse(): ICustomResponse;
}
