import { ref, Ref } from 'vue'
import { get, set, defaultsDeep, defaultTo, values, isEmpty, isPlainObject, each, unset, has } from 'lodash'
import { Base } from './Base'
import { ValidationError } from './errors/ValidationError'
import { Collection } from './Collection'
import { Request } from './Request'
import { Response } from './Response'

export class Model extends Base {
    protected _collections: Ref<Record<string, any>>
    protected _reference: Ref<Record<string, any>>
    protected _attributes: Ref<Record<string, any>>
    protected _mutations: Ref<Record<string, any>>
    protected _errors: Ref<Record<string, any>>
    protected _loading: Ref<boolean>
    protected _saving: Ref<boolean>
    protected _deleting: Ref<boolean>
    protected _fatal: Ref<boolean>

    constructor(attributes: Record<string, any> = {}, collection: Collection | null = null, options: Record<string, any> = {}) {
        super(options)

        this._collections = ref({}) // Collections that contain this model
        this._reference = ref({})   // Saved attribute state
        this._attributes = ref({})  // Active attribute state
        this._mutations = ref({})   // Mutator cache
        this._errors = ref({})      // Validation errors
        this._loading = ref(false)
        this._saving = ref(false)
        this._deleting = ref(false)
        this._fatal = ref(false)

        this.clearState()

        // Cache mutator pipelines so they can run as a single function
        this.compileMutators()

        // Assign all given model data to the model's attributes and reference
        this.assign(attributes)

        // Register the given collection (if any) to the model
        if (collection) {
            this.registerCollection(collection)
        }
    }

    // Getters and setters for reactive properties
    get loading(): boolean {
        return this._loading.value
    }

    set loading(value: boolean) {
        this._loading.value = value
    }

    get saving(): boolean {
        return this._saving.value
    }

    set saving(value: boolean) {
        this._saving.value = value
    }

    get deleting(): boolean {
        return this._deleting.value
    }

    set deleting(value: boolean) {
        this._deleting.value = value
    }

    get fatal(): boolean {
        return this._fatal.value
    }

    set fatal(value: boolean) {
        this._fatal.value = value
    }

    // Returns default attributes
    defaults(): Record<string, any> {
        return {}
    }

    // Returns validation rules
    validation(): Record<string, any> {
        return {}
    }

    // Returns attribute mutations
    mutations(): Record<string, any> {
        return {}
    }

    // Compiles all mutations into pipelines that can be executed quickly
    compileMutators(): void {
        const mutations = this.mutations()
        this._mutations.value = {}

        each(mutations, (mutation: any[], key: string | number) => {
            if (Array.isArray(mutation)) {
                this._mutations.value[key] = (value: any) => {
                    return mutation.reduce((value, mutation) => mutation(value), value)
                }
            } else {
                this._mutations.value[key] = mutation
            }
        })
    }

    // Creates a copy of this model
    clone(): Model {
        const attributes = this.getAttributes()
        const options = this.getOptions()
        return new (this.constructor as any)(attributes, null, options)
    }

    // Validates a specific attribute
    validateAttribute(attribute: string): boolean {
        const rules = this.getValidateRules(attribute)
        const value = this.get(attribute)
        let errors: string[] = []

        // No validation rules = valid
        if (!rules || isEmpty(rules)) {
            return true
        }

        // Run through all rules (can be multiple)
        each(rules, (rule: (arg0: any, arg1: string) => any) => {
            const error = rule(value, attribute)
            if (error !== true) {
                errors.push(error as string)
            }
        })

        // Set errors if any
        this.setAttributeErrors(attribute, errors)

        return errors.length === 0
    }

    // Validates all attributes
    async validate(attributes?: Record<string, any>): Promise<boolean> {
        let valid = true

        // Validate all attributes if none provided
        if (!attributes) {
            attributes = this.getAttributes()
        }

        // Run validation on each attribute
        each(attributes, (value: any, attribute: string) => {
            if (!this.validateAttribute(attribute)) {
                valid = false
            }
        })

        return valid
    }

    // Gets validation rules for an attribute
    getValidateRules(attribute: string): any[] {
        return get(this.validation(), attribute, [])
    }

    // Sets errors for a specific attribute
    setAttributeErrors(attribute: string, errors: string[]): void {
        if (errors && errors.length) {
            set(this._errors.value, attribute, errors)
        } else {
            unset(this._errors.value, attribute)
        }
    }

    // Gets all errors
    getErrors(): Record<string, string> {
        const errors: Record<string, string> = {};
        each(this._errors.value, (messages: string[], attribute: string) => {
            errors[attribute] = messages[0] || '';  // Take the first error message
        });
        return errors;
    }

    // Clears all errors
    clearErrors(): void {
        this._errors.value = {}
    }

    // Gets an attribute value
    get(attribute: string, fallback?: any): any {
        return get(this._attributes.value, attribute, fallback)
    }

    // Sets an attribute value
    set(attribute: string | Record<string, any>, value?: any): void {
        if (isPlainObject(attribute)) {
            each(attribute as Record<string, any>, (value: any, key: string) => {
                this.set(key, value)
            })
            return
        }

        // Handle string attribute
        if (typeof attribute === 'string') {
            set(this._attributes.value, attribute, this.mutated(attribute as string, value))
        }
    }

    // Gets all attributes
    getAttributes(): Record<string, any> {
        return this._attributes.value
    }

    // Resets attributes to their original state
    reset(attribute?: string | string[] | Record<string, any>): void {
        if (attribute) {
            // If it's a record, reset all its keys
            if (typeof attribute === 'object' && !Array.isArray(attribute)) {
                each(Object.keys(attribute), (attr: string) => {
                    this.set(attr, this.saved(attr))
                })
            } else {
                const attributes = Array.isArray(attribute) ? attribute : [attribute as string]
                each(attributes, (attr: string) => {
                    this.set(attr, this.saved(attr))
                })
            }
        } else {
            this._attributes.value = {...this._reference.value}
        }
    }

    // Gets a saved attribute value
    saved(attribute: string, fallback?: any): any {
        return get(this._reference.value, attribute, fallback)
    }

    // Saves the current state of the model
    save(): Promise<Response> {
        if (this.saving || this.deleting) {
            return Promise.reject(new Error('Already saving or deleting'))
        }

        // Validate before saving
        return this.validate().then((valid) => {
            if (!valid) {
                return Promise.reject(new ValidationError(this.getErrors()))
            }

            this.saving = true
            this.fatal = false

            const method = this.isNew() ? 'create' : 'update'
            const routeUrl = this.getOption(`routes.${method}`)
            const url = typeof routeUrl === 'string' ? routeUrl : null

            if (url === null) {
                throw new Error(`Route URL for ${method} is not a string`)
            }

            const data = this.getSaveData()

            const request = new Request({
                method: this.getSaveMethod(),
                url,
                data
            })

            return request.send()
                .then((response) => this.onSaveSuccess(response))
                .catch((error) => this.onSaveFailure(error))
                .finally(() => {
                    this.saving = false
                })
        })
    }

    // Gets data for saving
    getSaveData(): Record<string, any> {
        return this.getAttributes()
    }

    // Determines if model is new
    isNew(): boolean {
        return !this.get(this.getOption('identifier'))
    }

    // Gets the save method
    getSaveMethod(): string {
        return this.isNew() ? 'post' : this.getUpdateMethod()
    }

    // Gets the update method
    getUpdateMethod(): string {
        return this.shouldPatch() ? 'patch' : 'put'
    }

    // Whether to use PATCH for updates
    shouldPatch(): boolean {
        return Boolean(this.getOption('patch'))
    }

    // Success handler for save
    protected onSaveSuccess(response: Response): Response {
        this.clearErrors()
        this.sync()
        return response
    }

    // Failure handler for save
    protected onSaveFailure(error: any): Promise<any> {
        if (error.response?.status === this.getOption('validationErrorStatus')) {
            return this.onSaveValidationFailure(error)
        }
        return this.onFatalSaveFailure(error)
    }

    // Validation failure handler
    protected onSaveValidationFailure(error: any): Promise<any> {
        this.setErrors(error.response.data.errors || {})
        return Promise.reject(new ValidationError(this.getErrors()))
    }

    // Fatal failure handler
    protected onFatalSaveFailure(error: any): Promise<any> {
        this.fatal = true
        return Promise.reject(error)
    }

    // Sets errors
    setErrors(errors: Record<string, any>): void {
        this._errors.value = errors
    }

    // Syncs the current state
    sync(): void {
        this._reference.value = {...this._attributes.value}
    }

    // Registers a collection
    registerCollection(collection: Collection): void {
        if (!this.hasCollection(collection)) {
            this._collections.value[collection._uid] = collection
        }
    }

    // Checks if collection is registered
    hasCollection(collection: Collection | string | Record<string, any>): boolean {
        const uid = typeof collection === 'string'
            ? collection
            : (collection instanceof Collection
                ? collection._uid
                : (collection._uid || ''))
        return Object.prototype.hasOwnProperty.call(this._collections.value, uid)
    }

    // Clears the model state
    clearState(): void {
        this.loading = false
        this.saving = false
        this.deleting = false
        this.fatal = false
    }

    // Assigns attributes
    assign(attributes: Record<string, any>): Record<string, any> {
        // Fill in the defaults
        attributes = defaultsDeep({}, attributes, this.defaults())

        // Set the attributes
        this._attributes.value = attributes
        this._reference.value = {...attributes}

        return attributes
    }

    // Gets a mutated value
    mutated(attribute: string, value: any): any {
        const mutator = this._mutations.value[attribute]
        return mutator ? mutator(value) : value
    }

    // Returns route parameters
    getRouteParameters(): Record<string, any> {
        return {
            ...super.getRouteParameters(),
            [this.getOption('identifier')]: this.get(this.getOption('identifier'))
        }
    }

    // Returns default options
    getDefaultOptions(): Record<string, any> {
        return {
            ...super.getDefaultOptions(),
            identifier: 'id',        // The attribute that uniquely identifies this model
            methods: {
                fetch: 'get',        // HTTP method for fetch requests
                save: 'post',        // HTTP method for save requests
                update: 'put',       // HTTP method for update requests
                create: 'post',      // HTTP method for create requests
                patch: 'patch',      // HTTP method for patch requests
                delete: 'delete',    // HTTP method for delete requests
            },
            patch: false,           // Whether to use PATCH for updates
            routes: {
                fetch: '',          // Route for fetch requests
                save: '',           // Route for save requests
                update: '',         // Route for update requests
                create: '',         // Route for create requests
                delete: '',         // Route for delete requests
            },
            validationErrorStatus: 422  // HTTP status code for validation errors
        }
    }

    // Returns a native representation for JSON stringification
    toJSON(): Record<string, any> {
        return {
            ...this._attributes.value
        }
    }
}
