import { merge, get, defaultTo, defaults } from 'lodash'
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { Request } from './Request'
import { Response } from './Response'
import { ref, Ref } from 'vue'
import { IRequestOptions } from './types'

export abstract class Base {
    protected _options: Record<string, any>
    protected _http: AxiosInstance
    protected _errors: Ref<Record<string, any>>
    public _uid: string

    constructor(options: Record<string, any> = {}) {
        this._options = {}
        this._errors = ref({})
        this._uid = this.generateUid()

        // Create a new axios instance for this instance
        this._http = this.createHTTPClient()

        // Set all options on this instance, merging defaults with passed options
        this.setOptions(merge({}, this.getDefaultOptions(), this.options(), options))
    }

    // Returns this instance's default options
    protected options(): Record<string, any> {
        return {}
    }

    // Creates a new HTTP client
    protected createHTTPClient(): AxiosInstance {
        return axios.create(this.getHTTPConfig())
    }

    // Returns the default options for this instance
    protected getDefaultOptions(): Record<string, any> {
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
        }
    }

    // Returns the default HTTP config for this instance
    protected getHTTPConfig(): AxiosRequestConfig {
        return {
            // Default headers to be sent with every request
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },

            // Whether to send credentials with every request
            withCredentials: false,
        }
    }

    // Sets an option value
    setOption(key: string, value: any): void {
        this._options[key] = value

        // If we're setting a new HTTP instance, update the internal reference
        if (key === 'http' && value) {
            this._http = value
        }
    }

    // Sets multiple option values
    setOptions(options: Record<string, any>): void {
        for (const key in options) {
            this.setOption(key, options[key])
        }
    }

    // Gets an option value
    getOption(key: string, fallback: any = null): any {
        return get(this._options, key, fallback)
    }

    // Gets all options
    getOptions(): Record<string, any> {
        return this._options
    }

    // Returns route configuration
    routes(): Record<string, any> {
        return {}
    }

    // Gets a route configuration by action
    getRoute(action: string): string | null {
        return get(this.routes(), action, null)
    }

    // Returns route parameters that will be used to replace placeholders
    getRouteParameters(): Record<string, any> {
        return {}
    }

    // Generates a route URL by replacing parameter placeholders
    getURL(action: string, parameters?: Record<string, any>): string {
        const route = this.getRoute(action)
        if (!route) {
            return ''
        }

        let url = route
        const routeParams = parameters || this.getRouteParameters()

        // Replace all route parameters with their values
        for (const key in routeParams) {
            const value = routeParams[key]
            url = url.replace(`:${key}`, encodeURIComponent(value))
        }

        return url
    }

    // Creates a new request
    request(
        config: AxiosRequestConfig,
        onRequest?: () => Promise<void>,
        onSuccess?: (response: Response) => void,
        onFailure?: (error: Error, response?: Response) => void
    ): Promise<Response> {
        // Create request with merged config
        const request = new Request({
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
    private async executeRequest(
        request: Request,
        onRequest?: () => Promise<void>,
        onSuccess?: (response: Response) => void,
        onFailure?: (error: Error, response?: Response) => void
    ): Promise<Response> {
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
        } catch (error) {
            // Optional failure callback
            if (onFailure) {
                onFailure(error as Error, undefined);
            }
            throw error;
        }
    }

    // Determines if a response is valid
    isValidResponse(response: Response): boolean {
        return response && response.getData() !== undefined
    }

    // Gets all errors
    getErrors(): Record<string, any> {
        return this._errors.value
    }

    // Gets an error message for a specific key
    getError(key: string): any {
        return get(this.getErrors(), key)
    }

    // Sets an error message for a specific key
    setError(key: string, message: any): void {
        this._errors.value[key] = message
    }

    // Sets multiple error messages
    setErrors(errors: Record<string, any>): void {
        this._errors.value = errors
    }

    // Clears all error messages
    clearErrors(): void {
        this._errors.value = {}
    }

    // Determines if there are any errors
    hasErrors(): boolean {
        return Object.keys(this.getErrors()).length > 0
    }

    // Determines if there is an error for a specific key
    hasError(key: string): boolean {
        return this.getError(key) !== undefined
    }

    // Handles errors from a response
    handleResponseError(error: any): void {
        if (this.getOption('autoCatch')) {
            this.onResponseError(error)
        }
    }

    // Called when a response error occurs
    protected onResponseError(error: any): void {
        // Implementation specific to your needs
    }

    // Gets the error message from a response error
    protected getResponseErrorMessage(error: any): string {
        if (this.getOption('useResponseErrorMessage') && error.response?.data?.message) {
            return error.response.data.message
        }
        return 'An error occurred'
    }

    // Returns a native representation for JSON stringification
    toJSON(): Record<string, any> {
        return {}
    }

    // Generates a unique identifier
    protected generateUid(): string {
        return `${this.constructor.name}-${Math.random().toString(36).substr(2, 9)}`
    }

    /**
     * Fetches data from the database/API.
     *
     * @param {IRequestOptions} options Fetch options
     * @returns {Promise<Response>} Promise that resolves with the response
     */
    fetch(options: IRequestOptions = {}): Promise<Response> {
        const config = {
            method: defaultTo(options.method, this.getFetchMethod()),
            url: defaultTo(options.url, this.getFetchURL()),
            params: defaultTo(options.params, this.getFetchQuery()),
            headers: defaultTo(options.headers, this.getFetchHeaders()),
        };

        return this.request(config, this.onFetch, this.onFetchSuccess, this.onFetchFailure);
    }

    /**
     * Called before a fetch request is made.
     * @returns {Promise<void>} Promise that resolves with the request operation
     */
    protected onFetch(): Promise<void> {
        return Promise.resolve();
    }

    /**
     * Called when a fetch request was successful.
     * @param {Response} response The response from the server
     */
    protected onFetchSuccess(response: Response): void {
        // Override in subclass if needed
    }

    /**
     * Called when a fetch request failed.
     * @param {Error} error The error that occurred
     * @param {Response} [response] The response from the server if available
     */
    protected onFetchFailure(error: Error, response?: Response): void {
        // Override in subclass if needed
    }

    protected getFetchURL(): string {
        const fetchRoute = this.getRoute('fetch');
        return fetchRoute ? this.getURL(fetchRoute, this.getRouteParameters()) : '';
    }

    protected getFetchMethod(): string {
        return this.getOption('methods.fetch', 'GET');
    }

    protected getFetchQuery(): Record<string, any> {
        return {};
    }

    protected getFetchHeaders(): Record<string, any> {
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
    save(options: IRequestOptions = {}): Promise<Response> {
        // Create a complete config object with defaults
        const config: AxiosRequestConfig = {
            url: defaultTo(options.url, this.getSaveURL()),
            method: defaultTo(options.method, this.getSaveMethod()),
            data: defaultTo(options.data, this.getSaveData()),
            params: defaults(options.params, this.getSaveQuery()),
            headers: defaults(options.headers, this.getSaveHeaders()),
        };

        // Use the request method which now guarantees Promise<Response>
        return this.request(config, this.onSave, this.onSaveSuccess, this.onSaveFailure);
    }

    /**
     * Called before a save request is made.
     * @returns {Promise<void>} Promise that resolves with the request operation
     */
    protected onSave(): Promise<void> {
        return Promise.resolve();
    }

    /**
     * Called when a save request was successful.
     * @param {Response} response The response from the server
     */
    protected onSaveSuccess(response: Response): void {
        // Override in subclass if needed
    }

    /**
     * Called when a save request failed.
     * @param {Error} error The error that occurred
     * @param {Response} [response] The response from the server if available
     */
    protected onSaveFailure(error: Error, response?: Response): void {
        // Override in subclass if needed
    }

    /**
     * Removes data from the database/API.
     *
     * @param {IRequestOptions} options Delete options
     * @returns {Promise<Response>} Promise that resolves with the response
     */
    delete(options: IRequestOptions = {}): Promise<Response> {
        // Create a complete config object with defaults
        const config: AxiosRequestConfig = {
            url: defaultTo(options.url, this.getDeleteURL()),
            method: defaultTo(options.method, this.getDeleteMethod()),
            data: defaultTo(options.data, this.getDeleteBody()),
            params: defaults(options.params, this.getDeleteQuery()),
            headers: defaults(options.headers, this.getDeleteHeaders()),
        };

        // Use the request method which now guarantees Promise<Response>
        return this.request(config, this.onDelete, this.onDeleteSuccess, this.onDeleteFailure);
    }

    /**
     * Called before a delete request is made.
     * @returns {Promise<void>} Promise that resolves with the request operation
     */
    protected onDelete(): Promise<void> {
        return Promise.resolve();
    }

    /**
     * Called when a delete request was successful.
     * @param {Response} response The response from the server
     */
    protected onDeleteSuccess(response: Response): void {
        // Override in subclass if needed
    }

    /**
     * Called when a delete request failed.
     * @param {Error} error The error that occurred
     * @param {Response} [response] The response from the server if available
     */
    protected onDeleteFailure(error: Error, response?: Response): void {
        // Override in subclass if needed
    }

    /**
     * Converts given data to FormData for uploading.
     * @param {Record<string, any>} data The data to convert
     * @returns {FormData} The converted form data
     */
    protected convertObjectToFormData(data: Record<string, any>): FormData {
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
    upload(options: IRequestOptions = {}): Promise<Response> {
        const data = defaultTo(options.data, this.getSaveData());
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
    protected getSaveURL(): string {
        const saveRoute = this.getSaveRoute();
        return saveRoute ? this.getURL(saveRoute, this.getRouteParameters()) : '';
    }

    /**
     * Returns the key to use when generating the `save` URL.
     * @returns {string | null} The route key for saving this instance
     */
    protected getSaveRoute(): string | null {
        return this.getRoute('save');
    }

    protected getSaveMethod(): string {
        return this.getOption('methods.save', 'POST');
    }

    protected getSaveData(): Record<string, any> {
        return {};
    }

    protected getSaveQuery(): Record<string, any> {
        return {};
    }

    protected getSaveHeaders(): Record<string, any> {
        return {
            ...this.getDefaultHeaders(),
            ...this.getOption('headers.save', {})
        };
    }

    protected getDefaultHeaders(): Record<string, any> {
        return this.getOption('headers', {});
    }

    protected getDeleteURL(): string {
        const deleteRoute = this.getRoute('delete');
        return deleteRoute ? this.getURL(deleteRoute, this.getRouteParameters()) : '';
    }

    protected getDeleteMethod(): string {
        return this.getOption('methods.delete', 'DELETE');
    }

    protected getDeleteBody(): Record<string, any> {
        return {};
    }

    protected getDeleteQuery(): Record<string, any> {
        return {};
    }

    protected getDeleteHeaders(): Record<string, any> {
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
    protected createRequest(config: AxiosRequestConfig): Request {
        return new Request({
            ...config,
            ...(this._http.defaults || {})
        });
    }
}
