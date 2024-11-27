import { merge, get, defaultTo, isFunction } from 'lodash'
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { Request } from './Request'
import { Response } from './Response'
import { ref, Ref } from 'vue'

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

        // Set all options on this instance
        this.setOptions(merge({}, this.getDefaultOptions(), options))
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
    getOption(key: string): any {
        return get(this._options, key)
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
    getURL(action: string): string {
        const route = this.getRoute(action)
        if (!route) {
            return ''
        }

        let url = route
        const parameters = this.getRouteParameters()

        // Replace all route parameters with their values
        for (const key in parameters) {
            const value = parameters[key]
            url = url.replace(`:${key}`, encodeURIComponent(value))
        }

        return url
    }

    // Creates a new request
    request(config: AxiosRequestConfig): Request {
        return new Request({
            ...config,
            ...(this._http.defaults || {}),
        })
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
}
