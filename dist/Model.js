"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Model = void 0;
const vue_1 = require("vue");
const lodash_1 = require("lodash");
const Base_1 = require("./Base");
const ValidationError_1 = require("./errors/ValidationError");
const Collection_1 = require("./Collection");
const Request_1 = require("./Request");
class Model extends Base_1.Base {
    constructor(attributes = {}, collection = null, options = {}) {
        super(options);
        // Set options on the base class
        this.setOptions((0, lodash_1.merge)({}, this.getDefaultOptions(), this.options(), options));
        // Initialize all refs first
        this._collections = (0, vue_1.ref)({}); // Collections that contain this model
        this._mutations = (0, vue_1.ref)({}); // Mutator cache
        this._errors = (0, vue_1.ref)({}); // Validation errors
        this._loading = (0, vue_1.ref)(false);
        this._saving = (0, vue_1.ref)(false);
        this._deleting = (0, vue_1.ref)(false);
        this._fatal = (0, vue_1.ref)(false);
        // Handle attribute initialization with proper type casting
        const defaultAttrs = {};
        const inputAttrs = (0, vue_1.isRef)(attributes)
            ? (attributes.value || defaultAttrs)
            : (attributes || defaultAttrs);
        // Create refs with explicit type annotations
        const attrRef = (0, vue_1.ref)(inputAttrs);
        this.attributes = attrRef;
        this._reference = (0, vue_1.ref)(inputAttrs);
        // Store the collection reference
        if (collection) {
            this._collections.value[collection.uniqueId()] = collection;
        }
        this.clearState();
        // Cache mutator pipelines so they can run as a single function
        this.compileMutators();
        // Create a proxy to allow direct property access
        return new Proxy(this, {
            get(target, prop) {
                if (prop in target) {
                    return target[prop];
                }
                if (prop in target.attributes.value) {
                    return target.get(prop);
                }
                return undefined;
            },
            set(target, prop, value) {
                if (prop in target) {
                    target[prop] = value;
                    return true;
                }
                if (prop in target.attributes.value || !(prop in target)) {
                    target.set(prop, value);
                    return true;
                }
                return false;
            }
        });
    }
    // Getters and setters for reactive properties
    get loading() {
        return this._loading.value;
    }
    set loading(value) {
        this._loading.value = value;
    }
    get saving() {
        return this._saving.value;
    }
    set saving(value) {
        this._saving.value = value;
    }
    get deleting() {
        return this._deleting.value;
    }
    set deleting(value) {
        this._deleting.value = value;
    }
    get fatal() {
        return this._fatal.value;
    }
    set fatal(value) {
        this._fatal.value = value;
    }
    // Returns default attributes
    defaults() {
        return {};
    }
    // Returns validation rules
    validation() {
        return {};
    }
    // Returns attribute mutations
    mutations() {
        return {};
    }
    // Compiles all mutations into pipelines that can be executed quickly
    compileMutators() {
        const mutations = this.mutations();
        this._mutations.value = {};
        (0, lodash_1.each)(mutations, (mutation, key) => {
            if (Array.isArray(mutation)) {
                this._mutations.value[key] = (value) => {
                    return mutation.reduce((value, mutation) => mutation(value), value);
                };
            }
            else {
                this._mutations.value[key] = mutation;
            }
        });
    }
    // Creates a copy of this model
    clone() {
        const attributes = this.getAttributes();
        return new this.constructor(attributes, null);
    }
    // Validates a specific attribute
    validateAttribute(attribute) {
        const rules = this.getValidateRules(attribute);
        const value = this.get(attribute);
        let errors = [];
        // No validation rules = valid
        if (!rules || (0, lodash_1.isEmpty)(rules)) {
            return true;
        }
        // Run through all rules (can be multiple)
        (0, lodash_1.each)(rules, (rule) => {
            const error = rule(value, attribute);
            if (error !== true) {
                errors.push(error);
            }
        });
        // Set errors if any
        this.setAttributeErrors(attribute, errors);
        return errors.length === 0;
    }
    // Validates all attributes
    async validate(attributes) {
        let valid = true;
        // Validate all attributes if none provided
        if (!attributes) {
            attributes = this.getAttributes();
        }
        // Run validation on each attribute
        (0, lodash_1.each)(attributes, (value, attribute) => {
            if (!this.validateAttribute(attribute)) {
                valid = false;
            }
        });
        return valid;
    }
    // Gets validation rules for an attribute
    getValidateRules(attribute) {
        return (0, lodash_1.get)(this.validation(), attribute, []);
    }
    // Sets errors for a specific attribute
    setAttributeErrors(attribute, errors) {
        if (errors && errors.length) {
            (0, lodash_1.set)(this._errors.value, attribute, errors);
        }
        else {
            (0, lodash_1.unset)(this._errors.value, attribute);
        }
    }
    // Gets all errors
    getErrors() {
        const errors = {};
        (0, lodash_1.each)(this._errors.value, (messages, attribute) => {
            errors[attribute] = messages[0] || ''; // Take the first error message
        });
        return errors;
    }
    // Clears all errors
    clearErrors() {
        this._errors.value = {};
    }
    // Gets an attribute value
    get(attribute, fallback) {
        return (0, lodash_1.get)(this.attributes.value, attribute, fallback);
    }
    // Sets an attribute value
    set(attribute, value) {
        if ((0, lodash_1.isPlainObject)(attribute)) {
            (0, lodash_1.each)(attribute, (value, key) => {
                this.set(key, value);
            });
            return;
        }
        // Handle string attribute
        if (typeof attribute === 'string') {
            (0, lodash_1.set)(this.attributes.value, attribute, this.mutated(attribute, value));
        }
    }
    // Gets all attributes
    getAttributes() {
        return this.attributes.value;
    }
    // Resets attributes to their original state
    reset(attribute) {
        if (attribute) {
            // If it's a record, reset all its keys
            if (typeof attribute === 'object' && !Array.isArray(attribute)) {
                (0, lodash_1.each)(Object.keys(attribute), (attr) => {
                    this.set(attr, this.saved(attr));
                });
            }
            else {
                const attributes = Array.isArray(attribute) ? attribute : [attribute];
                (0, lodash_1.each)(attributes, (attr) => {
                    this.set(attr, this.saved(attr));
                });
            }
        }
        else {
            this.attributes.value = { ...this._reference.value };
        }
    }
    // Gets a saved attribute value
    saved(attribute, fallback) {
        return (0, lodash_1.get)(this._reference.value, attribute, fallback);
    }
    // Saves the current state of the model
    save() {
        if (this.saving || this.deleting) {
            return Promise.reject(new Error('Already saving or deleting'));
        }
        // Validate before saving
        return this.validate().then((valid) => {
            if (!valid) {
                return Promise.reject(new ValidationError_1.ValidationError(this.getErrors()));
            }
            this.saving = true;
            this.fatal = false;
            const method = this.isNew() ? 'create' : 'update';
            const routeUrl = this.getOption(`routes.${method}`);
            const url = typeof routeUrl === 'string' ? routeUrl : null;
            if (url === null) {
                throw new Error(`Route URL for ${method} is not a string`);
            }
            const data = this.getSaveData();
            const request = new Request_1.Request({
                method: this.getSaveMethod(),
                url,
                data
            });
            return request.send()
                .then((response) => this.onSaveSuccess(response))
                .catch((error) => this.onSaveFailure(error))
                .finally(() => {
                this.saving = false;
            });
        });
    }
    // Gets data for saving
    getSaveData() {
        return this.getAttributes();
    }
    // Determines if model is new
    isNew() {
        return !this.get(this.getOption('identifier'));
    }
    // Gets the save method
    getSaveMethod() {
        return this.isNew() ? 'post' : this.getUpdateMethod();
    }
    // Gets the update method
    getUpdateMethod() {
        return this.shouldPatch() ? 'patch' : 'put';
    }
    // Whether to use PATCH for updates
    shouldPatch() {
        return Boolean(this.getOption('patch'));
    }
    // Success handler for save
    onSaveSuccess(response) {
        this.clearErrors();
        this.sync();
        return response;
    }
    // Failure handler for save
    onSaveFailure(error) {
        var _a;
        if (((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === this.getOption('validationErrorStatus')) {
            return this.onSaveValidationFailure(error);
        }
        return this.onFatalSaveFailure(error);
    }
    // Validation failure handler
    onSaveValidationFailure(error) {
        this.setErrors(error.response.data.errors || {});
        return Promise.reject(new ValidationError_1.ValidationError(this.getErrors()));
    }
    // Fatal failure handler
    onFatalSaveFailure(error) {
        this.fatal = true;
        return Promise.reject(error);
    }
    // Sets errors
    setErrors(errors) {
        this._errors.value = errors;
    }
    // Syncs the current state
    sync() {
        this._reference.value = { ...this.attributes.value };
    }
    // Registers a collection
    registerCollection(collection) {
        if (!this.hasCollection(collection)) {
            this._collections.value[collection.uniqueId()] = collection;
        }
    }
    // Checks if collection is registered
    hasCollection(collection) {
        const uid = typeof collection === 'string'
            ? collection
            : (collection instanceof Collection_1.Collection
                ? collection.uniqueId()
                : (collection.uniqueId || ''));
        return Object.prototype.hasOwnProperty.call(this._collections.value, uid);
    }
    // Clears the model state
    clearState() {
        this.loading = false;
        this.saving = false;
        this.deleting = false;
        this.fatal = false;
    }
    // Assigns attributes
    assign(attributes) {
        // Fill in the defaults
        attributes = (0, lodash_1.defaultsDeep)({}, attributes, this.defaults());
        // Set the attributes
        this.attributes.value = attributes;
        this._reference.value = { ...attributes };
        return attributes;
    }
    // Gets a mutated value
    mutated(attribute, value) {
        const mutator = this._mutations.value[attribute];
        return mutator ? mutator(value) : value;
    }
    // Returns route parameters
    getRouteParameters() {
        return {
            ...super.getRouteParameters(),
            [this.getOption('identifier')]: this.get(this.getOption('identifier'))
        };
    }
    // Returns default options
    getDefaultOptions() {
        return (0, lodash_1.merge)(super.getDefaultOptions(), {
            methods: {
                fetch: 'get', // HTTP method for fetch requests
                save: 'post', // HTTP method for save requests
                update: 'put', // HTTP method for update requests
                create: 'post', // HTTP method for create requests
                delete: 'delete', // HTTP method for delete requests
                patch: 'patch', // HTTP method for patch requests
            },
            routeParameterName: 'id', // Name of the route parameter
            useFirstErrorOnly: true, // Whether to use only the first error message
            patch: false, // Whether to use PATCH for updates
            validationErrorStatus: 422 // HTTP status code for validation errors
        });
    }
    // Returns a native representation for JSON stringification
    toJSON() {
        return {
            ...this.attributes.value
        };
    }
    // Returns an array of attribute names that have changed, or false if no
    // changes have been made since the last time this model was synced.
    changed() {
        const changed = [];
        (0, lodash_1.each)(this.attributes.value, (value, attribute) => {
            if (!(0, lodash_1.isEqual)(value, this.saved(attribute))) {
                changed.push(attribute);
            }
        });
        return !(0, lodash_1.isEmpty)(changed) ? changed : false;
    }
}
exports.Model = Model;
