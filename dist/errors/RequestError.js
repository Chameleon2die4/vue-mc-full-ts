"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestError = void 0;
class RequestError extends Error {
    constructor(error, response) {
        super(error.message);
        this.error = error;
        this.response = response;
        this.stack = (new Error()).stack;
    }
    getError() {
        return this.error;
    }
    getResponse() {
        return this.response;
    }
    toString() {
        return this.message;
    }
}
exports.RequestError = RequestError;
