import { ICustomResponse, IRequestError } from '../types';
export declare class RequestError extends Error implements IRequestError {
    error: Error;
    response?: ICustomResponse | undefined;
    constructor(error: Error, response?: ICustomResponse | undefined);
    getError(): Error;
    getResponse(): ICustomResponse | undefined;
    toString(): string;
}
