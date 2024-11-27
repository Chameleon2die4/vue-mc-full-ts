import { ICustomResponse, IResponseError } from '../types';

export class ResponseError extends Error implements IResponseError {
    constructor(
        public response: ICustomResponse
    ) {
        super('Response Error');
        this.stack = (new Error()).stack;
    }

    getResponse(): ICustomResponse {
        return this.response;
    }
}
