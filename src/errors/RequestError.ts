import { ICustomResponse, IRequestError } from '../types';

export class RequestError extends Error implements IRequestError {
    constructor(
        public error: Error,
        public response?: ICustomResponse
    ) {
        super(error.message);
        this.stack = (new Error()).stack;
    }

    getError(): Error {
        return this.error;
    }

    getResponse(): ICustomResponse | undefined {
        return this.response;
    }

    toString(): string {
        return this.message;
    }
}
