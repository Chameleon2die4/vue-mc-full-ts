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
        // Set all options on this instance, merging defaults with passed options
        this.setOptions((0, lodash_1.merge)({}, this.getDefaultOptions(), this.options(), options));
    }
    // Returns this instance's default options
    options() {
        return {};
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
    getOption(key, fallback = null) {
        return (0, lodash_1.get)(this._options, key, fallback);
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
    getURL(action, parameters) {
        const route = this.getRoute(action);
        if (!route) {
            return '';
        }
        let url = route;
        const routeParams = parameters || this.getRouteParameters();
        // Replace all route parameters with their values
        for (const key in routeParams) {
            const value = routeParams[key];
            url = url.replace(`:${key}`, encodeURIComponent(value));
        }
        return url;
    }
    // Creates a new request
    request(config, onRequest, onSuccess, onFailure) {
        // Create request with merged config
        const request = new Request_1.Request({
            ...config,
            ...(this._http.defaults || {}),
        });
        // If additional callbacks are provided, handle more complex request flow
        if (onRequest || onSuccess || onFailure) {
            return this.executeRequest(request, onRequest, onSuccess, onFailure);
        }
        // For simple requests, just execute and return Promise<Response>
        return this.executeRequest(request);
    }
    // Helper method to execute a more complex request with callbacks
    async executeRequest(request, onRequest, onSuccess, onFailure) {
        try {
            // Optional pre-request hook
            if (onRequest) {
                await onRequest();
            }
            // Perform the request and ensure we always return a Response
            const response = await request.send();
            // Optional success callback
            if (onSuccess) {
                onSuccess(response);
            }
            return response;
        }
        catch (error) {
            // Optional failure callback
            if (onFailure) {
                onFailure(error, undefined);
            }
            throw error;
        }
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
    /**
     * Fetches data from the database/API.
     *
     * @param {IRequestOptions} options Fetch options
     * @returns {Promise<Response>} Promise that resolves with the response
     */
    fetch(options = {}) {
        const config = {
            method: (0, lodash_1.defaultTo)(options.method, this.getFetchMethod()),
            url: (0, lodash_1.defaultTo)(options.url, this.getFetchURL()),
            params: (0, lodash_1.defaultTo)(options.params, this.getFetchQuery()),
            headers: (0, lodash_1.defaultTo)(options.headers, this.getFetchHeaders()),
        };
        return this.request(config, this.onFetch, this.onFetchSuccess, this.onFetchFailure);
    }
    /**
     * Called before a fetch request is made.
     * @returns {Promise<void>} Promise that resolves with the request operation
     */
    onFetch() {
        return Promise.resolve();
    }
    /**
     * Called when a fetch request was successful.
     * @param {Response} response The response from the server
     */
    onFetchSuccess(response) {
        // Override in subclass if needed
    }
    /**
     * Called when a fetch request failed.
     * @param {Error} error The error that occurred
     * @param {Response} [response] The response from the server if available
     */
    onFetchFailure(error, response) {
        // Override in subclass if needed
    }
    getFetchURL() {
        const fetchRoute = this.getRoute('fetch');
        return fetchRoute ? this.getURL(fetchRoute, this.getRouteParameters()) : '';
    }
    getFetchMethod() {
        return this.getOption('methods.fetch', 'GET');
    }
    getFetchQuery() {
        return {};
    }
    getFetchHeaders() {
        return {
            ...this.getDefaultHeaders(),
            ...this.getOption('headers.fetch', {})
        };
    }
    /**
     * Persists data to the database/API.
     *
     * @param {IRequestOptions} options Save options
     * @returns {Promise<Response>} Promise that resolves with the response
     */
    save(options = {}) {
        // Create a complete config object with defaults
        const config = {
            url: (0, lodash_1.defaultTo)(options.url, this.getSaveURL()),
            method: (0, lodash_1.defaultTo)(options.method, this.getSaveMethod()),
            data: (0, lodash_1.defaultTo)(options.data, this.getSaveData()),
            params: (0, lodash_1.defaults)(options.params, this.getSaveQuery()),
            headers: (0, lodash_1.defaults)(options.headers, this.getSaveHeaders()),
        };
        // Use the request method which now guarantees Promise<Response>
        return this.request(config, this.onSave, this.onSaveSuccess, this.onSaveFailure);
    }
    /**
     * Called before a save request is made.
     * @returns {Promise<void>} Promise that resolves with the request operation
     */
    onSave() {
        return Promise.resolve();
    }
    /**
     * Called when a save request was successful.
     * @param {Response} response The response from the server
     */
    onSaveSuccess(response) {
        // Override in subclass if needed
    }
    /**
     * Called when a save request failed.
     * @param {Error} error The error that occurred
     * @param {Response} [response] The response from the server if available
     */
    onSaveFailure(error, response) {
        // Override in subclass if needed
    }
    /**
     * Removes data from the database/API.
     *
     * @param {IRequestOptions} options Delete options
     * @returns {Promise<Response>} Promise that resolves with the response
     */
    delete(options = {}) {
        // Create a complete config object with defaults
        const config = {
            url: (0, lodash_1.defaultTo)(options.url, this.getDeleteURL()),
            method: (0, lodash_1.defaultTo)(options.method, this.getDeleteMethod()),
            data: (0, lodash_1.defaultTo)(options.data, this.getDeleteBody()),
            params: (0, lodash_1.defaults)(options.params, this.getDeleteQuery()),
            headers: (0, lodash_1.defaults)(options.headers, this.getDeleteHeaders()),
        };
        // Use the request method which now guarantees Promise<Response>
        return this.request(config, this.onDelete, this.onDeleteSuccess, this.onDeleteFailure);
    }
    /**
     * Called before a delete request is made.
     * @returns {Promise<void>} Promise that resolves with the request operation
     */
    onDelete() {
        return Promise.resolve();
    }
    /**
     * Called when a delete request was successful.
     * @param {Response} response The response from the server
     */
    onDeleteSuccess(response) {
        // Override in subclass if needed
    }
    /**
     * Called when a delete request failed.
     * @param {Error} error The error that occurred
     * @param {Response} [response] The response from the server if available
     */
    onDeleteFailure(error, response) {
        // Override in subclass if needed
    }
    /**
     * Converts given data to FormData for uploading.
     * @param {Record<string, any>} data The data to convert
     * @returns {FormData} The converted form data
     */
    convertObjectToFormData(data) {
        const form = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            form.append(key, value);
        });
        return form;
    }
    /**
     * Persists data to the database/API using FormData.
     *
     * @param {IRequestOptions} options Upload options
     * @returns {Promise<Response>} Promise that resolves with the response
     */
    upload(options = {}) {
        const data = (0, lodash_1.defaultTo)(options.data, this.getSaveData());
        const config = {
            ...options,
            data: this.convertObjectToFormData(data),
        };
        return this.save(config);
    }
    /**
     * Returns the full URL to use when making a save request.
     * @returns {string} The URL for saving this instance
     */
    getSaveURL() {
        const saveRoute = this.getSaveRoute();
        return saveRoute ? this.getURL(saveRoute, this.getRouteParameters()) : '';
    }
    /**
     * Returns the key to use when generating the `save` URL.
     * @returns {string | null} The route key for saving this instance
     */
    getSaveRoute() {
        return this.getRoute('save');
    }
    getSaveMethod() {
        return this.getOption('methods.save', 'POST');
    }
    getSaveData() {
        return {};
    }
    getSaveQuery() {
        return {};
    }
    getSaveHeaders() {
        return {
            ...this.getDefaultHeaders(),
            ...this.getOption('headers.save', {})
        };
    }
    getDefaultHeaders() {
        return this.getOption('headers', {});
    }
    getDeleteURL() {
        const deleteRoute = this.getRoute('delete');
        return deleteRoute ? this.getURL(deleteRoute, this.getRouteParameters()) : '';
    }
    getDeleteMethod() {
        return this.getOption('methods.delete', 'DELETE');
    }
    getDeleteBody() {
        return {};
    }
    getDeleteQuery() {
        return {};
    }
    getDeleteHeaders() {
        return {
            ...this.getDefaultHeaders(),
            ...this.getOption('headers.delete', {})
        };
    }
    /**
     * Creates a new Request using the given configuration.
     * @param {AxiosRequestConfig} config The request configuration
     * @returns {Request} A new Request using the given configuration.
     */
    createRequest(config) {
        return new Request_1.Request({
            ...config,
            ...(this._http.defaults || {})
        });
    }
}
exports.Base = Base;
