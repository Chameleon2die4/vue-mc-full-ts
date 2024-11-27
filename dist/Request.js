"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Request = void 0;
const axios_1 = __importDefault(require("axios"));
const Response_1 = require("./Response");
class Request {
    constructor(config = {}) {
        this.config = config;
    }
    send() {
        return axios_1.default.request(this.config).then(response => new Response_1.Response(response));
    }
}
exports.Request = Request;
