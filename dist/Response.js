"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Response = void 0;
class Response {
    constructor(response) {
        this.response = response;
    }
    getData() {
        return this.response.data;
    }
    getStatus() {
        return this.response.status;
    }
    getHeaders() {
        return this.response.headers;
    }
    getValidationErrors() {
        return [];
    }
}
exports.Response = Response;
