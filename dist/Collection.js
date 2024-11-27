"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Collection = exports.LAST_PAGE = exports.NO_PAGE = void 0;
const vue_1 = require("vue");
const lodash_1 = require("lodash");
const Base_1 = require("./Base");
const Model_1 = require("./Model");
// Used as a marker to indicate that pagination is not enabled
exports.NO_PAGE = null;
// Used as a marker to indicate that a collection has paged through all results
exports.LAST_PAGE = 0;
class Collection extends Base_1.Base {
    constructor(models = [], attributes = {}, options = {}) {
        super(options);
        this._loading = (0, vue_1.ref)(false);
        this._saving = (0, vue_1.ref)(false);
        this._deleting = (0, vue_1.ref)(false);
        this._fatal = (0, vue_1.ref)(false);
        this._models = (0, vue_1.ref)([]);
        this._attributes = (0, vue_1.ref)({});
        this._registry = (0, vue_1.ref)({});
        this._page = (0, vue_1.ref)(exports.NO_PAGE);
        // Set the initial attributes
        this._attributes.value = attributes;
        // Add all given models
        if (models && models.length) {
            this.add(models);
        }
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
    get models() {
        return this._models.value;
    }
    set models(value) {
        this._models.value = value;
    }
    get attributes() {
        return this._attributes.value;
    }
    // Returns the model class for this collection
    model() {
        return this.getOption('model');
    }
    // Returns default attributes
    defaults() {
        return {};
    }
    // Creates a new model instance
    createModel(attributes) {
        return new (this.model())(attributes, this);
    }
    // Adds one or more models to the collection
    add(models) {
        if (!Array.isArray(models)) {
            models = [models];
        }
        models.forEach(model => {
            if (!this.hasModelInRegistry(model)) {
                this.models.push(model);
                this.addModelToRegistry(model);
                this.onAdd(model);
            }
        });
    }
    // Removes one or more models from the collection
    remove(models) {
        if (!Array.isArray(models)) {
            models = [models];
        }
        models.forEach(model => {
            const index = this.indexOf(model);
            if (index !== -1) {
                this._removeModelAtIndex(index);
            }
        });
    }
    // Removes a model at a specific index
    _removeModelAtIndex(index) {
        const model = this.models[index];
        if (!model) {
            throw new Error(`No model found at index ${index}`);
        }
        this.models.splice(index, 1);
        this.removeModelFromRegistry(model);
        this.onRemove(model);
        return model;
    }
    // Adds a model to the registry
    addModelToRegistry(model) {
        this._registry.value[model._uid] = 1;
    }
    // Removes a model from the registry
    removeModelFromRegistry(model) {
        delete this._registry.value[model._uid];
    }
    // Checks if a model is in the registry
    hasModelInRegistry(model) {
        return Boolean(this._registry.value[model._uid]);
    }
    // Called when a model is added
    onAdd(model) {
        model.registerCollection(this);
    }
    // Called when a model is removed
    onRemove(model) {
        // Implementation specific to your needs
    }
    // Gets the index of a model
    indexOf(model) {
        return this.models.indexOf(model);
    }
    // Clears all models
    clear() {
        this.clearModels();
        this.clearState();
    }
    // Clears all models
    clearModels() {
        const models = this.models;
        this.models = [];
        models.forEach(model => this.onRemove(model));
    }
    // Clears the collection state
    clearState() {
        this.loading = false;
        this.saving = false;
        this.deleting = false;
        this.fatal = false;
    }
    // Gets an attribute value
    get(attribute, fallback) {
        return (0, lodash_1.get)(this.attributes, attribute, fallback);
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
            (0, lodash_1.set)(this._attributes.value, attribute, value);
        }
    }
    // Gets all models
    getModels() {
        return this.models;
    }
    // Gets all attributes
    getAttributes() {
        return this.attributes;
    }
    // Returns the number of models
    size() {
        return this.models.length;
    }
    // Checks if the collection is empty
    isEmpty() {
        return this.size() === 0;
    }
    // Creates a copy of this collection
    clone() {
        return new this.constructor(this.getModels(), this.getOptions(), this.getAttributes());
    }
    // Validates all models
    async validate() {
        const validations = this.models.map(model => model.validate());
        const results = await Promise.all(validations);
        return (0, lodash_1.every)(results);
    }
    // Sets the current page
    page(page) {
        this._page.value = page;
        return this;
    }
    // Gets the current page
    getPage() {
        return this._page.value;
    }
    // Checks if the collection is paginated
    isPaginated() {
        return this._page.value !== exports.NO_PAGE;
    }
    // Checks if this is the last page
    isLastPage() {
        return this._page.value === exports.LAST_PAGE;
    }
    // Returns default options
    getDefaultOptions() {
        return (0, lodash_1.merge)(super.getDefaultOptions(), {
            // The class/constructor for this collection's model type
            model: Model_1.Model,
            methods: {
                fetch: 'get',
            },
            // Query parameters
            queryParameter: 'q',
            pageParameter: 'page',
            perPageParameter: 'per_page',
            sortParameter: 'sort',
            sortDirectionParameter: 'direction',
            filterParameter: 'filter',
            searchParameter: 'search',
            delimiter: ',',
            // Whether this collection should send model identifiers as JSON
            // in the body of a delete request, instead of a query parameter
            useDeleteBody: true,
        });
    }
    // Returns route parameters
    getRouteParameters() {
        return (0, lodash_1.merge)({}, super.getRouteParameters(), this.attributes, {
            page: this._page.value,
        });
    }
    // Returns a native representation for JSON stringification
    toJSON() {
        return this.models;
    }
    // Converts collection to array
    toArray() {
        return this.models.map(model => model.toJSON ? model.toJSON() : model);
    }
    // Generates a unique identifier for this collection instance
    uniqueId() {
        return `collection_${Math.random().toString(36).substr(2, 9)}`;
    }
}
exports.Collection = Collection;
