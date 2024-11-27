import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Response } from './Response';
import { Ref } from 'vue';
export declare abstract class Base {
    protected _options: Record<string, any>;
    protected _http: AxiosInstance;
    protected _errors: Ref<Record<string, any>>;
    _uid: string;
    constructor(options?: Record<string, any>);
    protected options(): Record<string, any>;
    protected createHTTPClient(): AxiosInstance;
    protected getDefaultOptions(): Record<string, any>;
    protected getHTTPConfig(): AxiosRequestConfig;
    setOption(key: string, value: any): void;
    setOptions(options: Record<string, any>): void;
    getOption(key: string, fallback?: any): any;
    getOptions(): Record<string, any>;
    routes(): Record<string, any>;
    getRoute(action: string): string | null;
    getRouteParameters(): Record<string, any>;
    getURL(action: string, parameters?: Record<string, any>): string;
    request(config: AxiosRequestConfig, onRequest?: () => Promise<void>, onSuccess?: (response: Response) => void, onFailure?: (error: Error, response?: Response) => void): Promise<Response>;
    private executeRequest;
    isValidResponse(response: Response): boolean;
    getErrors(): Record<string, any>;
    getError(key: string): any;
    setError(key: string, message: any): void;
    setErrors(errors: Record<string, any>): void;
    clearErrors(): void;
    hasErrors(): boolean;
    hasError(key: string): boolean;
    handleResponseError(error: any): void;
    protected onResponseError(error: any): void;
    protected getResponseErrorMessage(error: any): string;
    toJSON(): Record<string, any>;
    protected generateUid(): string;
    /**
     * Fetches data from the database/API.
     *
     * @param {Object} options Fetch options
     * @param {string} [options.method] HTTP method
     * @param {string} [options.url] URL to fetch from
     * @param {Object} [options.params] Query parameters
     * @param {Object} [options.headers] Request headers
     * @returns {Promise<Response>} Promise that resolves with the response
     */
    fetch(options?: {
        method?: string;
        url?: string;
        params?: Record<string, any>;
        headers?: Record<string, any>;
    }): Promise<Response>;
    /**
     * Called before a fetch request is made.
     * @returns {Promise<void>} Promise that resolves with the request operation
     */
    protected onFetch(): Promise<void>;
    /**
     * Called when a fetch request was successful.
     * @param {Response} response The response from the server
     */
    protected onFetchSuccess(response: Response): void;
    /**
     * Called when a fetch request failed.
     * @param {Error} error The error that occurred
     * @param {Response} [response] The response from the server if available
     */
    protected onFetchFailure(error: Error, response?: Response): void;
    protected getFetchURL(): string;
    protected getFetchMethod(): string;
    protected getFetchQuery(): Record<string, any>;
    protected getFetchHeaders(): Record<string, any>;
    /**
     * Persists data to the database/API.
     *
     * @param {Object} options Save options
     * @param {string} [options.method] HTTP method
     * @param {string} [options.url] URL to save to
     * @param {Object} [options.data] Data to save
     * @param {Object} [options.params] Query parameters
     * @param {Object} [options.headers] Request headers
     * @returns {Promise<Response>} Promise that resolves with the response
     */
    save(options?: {
        method?: string;
        url?: string;
        data?: Record<string, any>;
        params?: Record<string, any>;
        headers?: Record<string, any>;
    }): Promise<Response>;
    /**
     * Called before a save request is made.
     * @returns {Promise<void>} Promise that resolves with the request operation
     */
    protected onSave(): Promise<void>;
    /**
     * Called when a save request was successful.
     * @param {Response} response The response from the server
     */
    protected onSaveSuccess(response: Response): void;
    /**
     * Called when a save request failed.
     * @param {Error} error The error that occurred
     * @param {Response} [response] The response from the server if available
     */
    protected onSaveFailure(error: Error, response?: Response): void;
    /**
     * Removes data from the database/API.
     *
     * @param {Object} options Delete options
     * @param {string} [options.method] HTTP method
     * @param {string} [options.url] URL for deletion
     * @param {Object} [options.data] Data to send with delete request
     * @param {Object} [options.params] Query parameters
     * @param {Object} [options.headers] Request headers
     * @returns {Promise<Response>} Promise that resolves with the response
     */
    delete(options?: {
        method?: string;
        url?: string;
        data?: Record<string, any>;
        params?: Record<string, any>;
        headers?: Record<string, any>;
    }): Promise<Response>;
    /**
     * Called before a delete request is made.
     * @returns {Promise<void>} Promise that resolves with the request operation
     */
    protected onDelete(): Promise<void>;
    /**
     * Called when a delete request was successful.
     * @param {Response} response The response from the server
     */
    protected onDeleteSuccess(response: Response): void;
    /**
     * Called when a delete request failed.
     * @param {Error} error The error that occurred
     * @param {Response} [response] The response from the server if available
     */
    protected onDeleteFailure(error: Error, response?: Response): void;
    /**
     * Converts given data to FormData for uploading.
     * @param {Record<string, any>} data The data to convert
     * @returns {FormData} The converted form data
     */
    protected convertObjectToFormData(data: Record<string, any>): FormData;
    /**
     * Persists data to the database/API using FormData.
     *
     * @param {Object} options Upload options
     * @param {string} [options.method] HTTP method
     * @param {string} [options.url] URL to upload to
     * @param {Object} [options.data] Data to upload
     * @param {Object} [options.params] Query parameters
     * @param {Object} [options.headers] Request headers
     * @returns {Promise<Response>} Promise that resolves with the response
     */
    upload(options?: {
        method?: string;
        url?: string;
        data?: Record<string, any>;
        params?: Record<string, any>;
        headers?: Record<string, any>;
    }): Promise<Response>;
    /**
     * Returns the full URL to use when making a save request.
     * @returns {string} The URL for saving this instance
     */
    protected getSaveURL(): string;
    /**
     * Returns the key to use when generating the `save` URL.
     * @returns {string | null} The route key for saving this instance
     */
    protected getSaveRoute(): string | null;
    protected getSaveMethod(): string;
    protected getSaveData(): Record<string, any>;
    protected getSaveQuery(): Record<string, any>;
    protected getSaveHeaders(): Record<string, any>;
    protected getDefaultHeaders(): Record<string, any>;
    protected getDeleteURL(): string;
    protected getDeleteMethod(): string;
    protected getDeleteBody(): Record<string, any>;
    protected getDeleteQuery(): Record<string, any>;
    protected getDeleteHeaders(): Record<string, any>;
}
