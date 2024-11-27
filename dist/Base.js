"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Base = void 0;
const lodash_1 = require("lodash");
const axios_1 = __importDefault(require("axios"));
const Request_1 = require("./Request");
const vue_1 = require("vue");
class Base {
    constructor(options = {}) {
        this._options = {};
        this._errors = (0, vue_1.ref)({});
        this._uid = this.generateUid();
        // Create a new axios instance for this instance
        this._http = this.createHTTPClient();
        // Set all options on this instance
        this.setOptions((0, lodash_1.merge)({}, this.getDefaultOptions(), options));
    }
    // Creates a new HTTP client
    createHTTPClient() {
        return axios_1.default.create(this.getHTTPConfig());
    }
    // Returns the default options for this instance
    getDefaultOptions() {
        return {
            // The HTTP client instance
            http: null,
            // Whether this instance should automatically handle errors
            autoCatch: true,
            // Whether this instance should automatically save after a successful validation
            autoSave: false,
            // Whether this instance should automatically validate before saving
            autoValidate: true,
            // Whether this instance should validate on every change
            validateOnChange: false,
            // Whether this instance should save on every change
            saveOnChange: false,
            // Whether this instance should use the default error message
            useFirstErrorMessage: true,
            // Whether this instance should use the default error message
            useResponseErrorMessage: true,
        };
    }
    // Returns the default HTTP config for this instance
    getHTTPConfig() {
        return {
            // Default headers to be sent with every request
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            // Whether to send credentials with every request
            withCredentials: false,
        };
    }
    // Sets an option value
    setOption(key, value) {
        this._options[key] = value;
        // If we're setting a new HTTP instance, update the internal reference
        if (key === 'http' && value) {
            this._http = value;
        }
    }
    // Sets multiple option values
    setOptions(options) {
        for (const key in options) {
            this.setOption(key, options[key]);
        }
    }
    // Gets an option value
    getOption(key) {
        return (0, lodash_1.get)(this._options, key);
    }
    // Gets all options
    getOptions() {
        return this._options;
    }
    // Returns route configuration
    routes() {
        return {};
    }
    // Gets a route configuration by action
    getRoute(action) {
        return (0, lodash_1.get)(this.routes(), action, null);
    }
    // Returns route parameters that will be used to replace placeholders
    getRouteParameters() {
        return {};
    }
    // Generates a route URL by replacing parameter placeholders
    getURL(action) {
        const route = this.getRoute(action);
        if (!route) {
            return '';
        }
        let url = route;
        const parameters = this.getRouteParameters();
        // Replace all route parameters with their values
        for (const key in parameters) {
            const value = parameters[key];
            url = url.replace(`:${key}`, encodeURIComponent(value));
        }
        return url;
    }
    // Creates a new request
    request(config) {
        return new Request_1.Request({
            ...config,
            ...(this._http.defaults || {}),
        });
    }
    // Determines if a response is valid
    isValidResponse(response) {
        return response && response.getData() !== undefined;
    }
    // Gets all errors
    getErrors() {
        return this._errors.value;
    }
    // Gets an error message for a specific key
    getError(key) {
        return (0, lodash_1.get)(this.getErrors(), key);
    }
    // Sets an error message for a specific key
    setError(key, message) {
        this._errors.value[key] = message;
    }
    // Sets multiple error messages
    setErrors(errors) {
        this._errors.value = errors;
    }
    // Clears all error messages
    clearErrors() {
        this._errors.value = {};
    }
    // Determines if there are any errors
    hasErrors() {
        return Object.keys(this.getErrors()).length > 0;
    }
    // Determines if there is an error for a specific key
    hasError(key) {
        return this.getError(key) !== undefined;
    }
    // Handles errors from a response
    handleResponseError(error) {
        if (this.getOption('autoCatch')) {
            this.onResponseError(error);
        }
    }
    // Called when a response error occurs
    onResponseError(error) {
        // Implementation specific to your needs
    }
    // Gets the error message from a response error
    getResponseErrorMessage(error) {
        var _a, _b;
        if (this.getOption('useResponseErrorMessage') && ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message)) {
            return error.response.data.message;
        }
        return 'An error occurred';
    }
    // Returns a native representation for JSON stringification
    toJSON() {
        return {};
    }
    // Generates a unique identifier
    generateUid() {
        return `${this.constructor.name}-${Math.random().toString(36).substr(2, 9)}`;
    }
}
exports.Base = Base;
