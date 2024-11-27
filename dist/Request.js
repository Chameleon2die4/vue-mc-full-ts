"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Request = void 0;
const axios_1 = __importDefault(require("axios"));
const Response_1 = require("./Response");
const RequestError_1 = require("./errors/RequestError");
class Request {
    constructor(config = {}) {
        this.config = config;
    }
    createResponse(axiosResponse) {
        return new Response_1.Response(axiosResponse);
    }
    createError(axiosError) {
        return new RequestError_1.RequestError(axiosError, axiosError.response ? this.createResponse(axiosError.response) : undefined);
    }
    send() {
        return axios_1.default
            .request(this.config)
            .then(response => this.createResponse(response))
            .catch(error => {
            throw this.createError(error);
        });
    }
}
exports.Request = Request;
