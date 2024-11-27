"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseError = void 0;
class ResponseError extends Error {
    constructor(response) {
        super('Response Error');
        this.response = response;
        this.stack = (new Error()).stack;
    }
    getResponse() {
        return this.response;
    }
}
exports.ResponseError = ResponseError;
