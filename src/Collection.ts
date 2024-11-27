import { ref, Ref } from 'vue'
import { get, set, defaultsDeep, defaultTo, values, isEmpty, isPlainObject, each, merge, every } from 'lodash'
import { Base } from './Base'
import { Model } from './Model'
import { ICollectionOptions } from './types'

// Used as a marker to indicate that pagination is not enabled
export const NO_PAGE = null

// Used as a marker to indicate that a collection has paged through all results
export const LAST_PAGE = 0

export class Collection extends Base {
    protected _loading: Ref<boolean>
    protected _saving: Ref<boolean>
    protected _deleting: Ref<boolean>
    protected _fatal: Ref<boolean>
    protected _models: Ref<Model[]>
    protected _attributes: Ref<Record<string, unknown>>
    protected _registry: Ref<Record<string, unknown>>
    protected _page: Ref<number | null>

    constructor(models: Model[] = [], attributes: Record<string, unknown> = {}, options: Record<string, any> = {}) {
        super(options)
        
        this._loading = ref(false)
        this._saving = ref(false)
        this._deleting = ref(false)
        this._fatal = ref(false)
        this._models = ref([])
        this._attributes = ref({})
        this._registry = ref({})
        this._page = ref(NO_PAGE)

        // Set the initial attributes
        this._attributes.value = attributes

        // Add all given models
        if (models && models.length) {
            this.add(models)
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

    get models(): Model[] {
        return this._models.value
    }

    set models(value: Model[]) {
        this._models.value = value
    }

    get attributes(): Record<string, unknown> {
        return this._attributes.value
    }

    // Returns the model class for this collection
    model(): typeof Model {
        return this.getOption('model')
    }

    // Returns default attributes
    defaults(): Record<string, unknown> {
        return {}
    }

    // Creates a new model instance
    createModel(attributes: Record<string, unknown>): Model {
        return new (this.model())(attributes, this)
    }

    // Adds one or more models to the collection
    add(models: Model | Model[]): void {
        if (!Array.isArray(models)) {
            models = [models]
        }

        models.forEach(model => {
            if (!this.hasModelInRegistry(model)) {
                this.models.push(model)
                this.addModelToRegistry(model)
                this.onAdd(model)
            }
        })
    }

    // Removes one or more models from the collection
    remove(models: Model | Model[]): void {
        if (!Array.isArray(models)) {
            models = [models]
        }

        models.forEach(model => {
            const index = this.indexOf(model)
            if (index !== -1) {
                this._removeModelAtIndex(index)
            }
        })
    }

    // Removes a model at a specific index
    protected _removeModelAtIndex(index: number): Model {
        const model = this.models[index]
        if (!model) {
            throw new Error(`No model found at index ${index}`)
        }

        this.models.splice(index, 1)
        this.removeModelFromRegistry(model)
        this.onRemove(model)

        return model
    }

    // Adds a model to the registry
    protected addModelToRegistry(model: Model): void {
        this._registry.value[model._uid] = 1
    }

    // Removes a model from the registry
    protected removeModelFromRegistry(model: Model): void {
        delete this._registry.value[model._uid]
    }

    // Checks if a model is in the registry
    protected hasModelInRegistry(model: Model): boolean {
        return Boolean(this._registry.value[model._uid])
    }

    // Called when a model is added
    protected onAdd(model: Model): void {
        model.registerCollection(this)
    }

    // Called when a model is removed
    protected onRemove(model: Model): void {
        // Implementation specific to your needs
    }

    // Gets the index of a model
    indexOf(model: Model): number {
        return this.models.indexOf(model)
    }

    // Clears all models
    clear(): void {
        this.clearModels()
        this.clearState()
    }

    // Clears all models
    clearModels(): void {
        const models = this.models
        this.models = []
        models.forEach(model => this.onRemove(model))
    }

    // Clears the collection state
    clearState(): void {
        this.loading = false
        this.saving = false
        this.deleting = false
        this.fatal = false
    }

    // Gets an attribute value
    get(attribute: string, fallback?: unknown): unknown {
        return get(this.attributes, attribute, fallback)
    }

    // Sets an attribute value
    set(attribute: string | Record<string, unknown>, value?: unknown): void {
        if (isPlainObject(attribute)) {
            each(attribute as Record<string, unknown>, (value: unknown, key: string) => {
                this.set(key, value)
            })
            return
        }

        // Handle string attribute
        if (typeof attribute === 'string') {
            set(this._attributes.value, attribute, value)
        }
    }

    // Gets all models
    getModels(): Model[] {
        return this.models
    }

    // Gets all attributes
    getAttributes(): Record<string, unknown> {
        return this.attributes
    }

    // Returns the number of models
    size(): number {
        return this.models.length
    }

    // Checks if the collection is empty
    isEmpty(): boolean {
        return this.size() === 0
    }

    // Creates a copy of this collection
    clone(): Collection {
        return new (this.constructor as any)(
            this.getModels(),
            this.getOptions(),
            this.getAttributes()
        )
    }

    // Validates all models
    async validate(): Promise<boolean> {
        const validations = this.models.map(model => model.validate())
        const results = await Promise.all(validations)
        return every(results)
    }

    // Sets the current page
    page(page: number | null): Collection {
        this._page.value = page
        return this
    }

    // Gets the current page
    getPage(): number | null {
        return this._page.value
    }

    // Checks if the collection is paginated
    isPaginated(): boolean {
        return this._page.value !== NO_PAGE
    }

    // Checks if this is the last page
    isLastPage(): boolean {
        return this._page.value === LAST_PAGE
    }

    // Returns default options
    getDefaultOptions(): ICollectionOptions {
        return merge(super.getDefaultOptions(), {
            // The class/constructor for this collection's model type
            model: Model,

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
        })
    }

    // Returns route parameters
    getRouteParameters(): Record<string, unknown> {
        return merge({}, super.getRouteParameters(), this.attributes, {
            page: this._page.value,
        })
    }

    // Returns a native representation for JSON stringification
    toJSON(): Model[] {
        return this.models
    }

    // Converts collection to array
    toArray(): unknown[] {
        return this.models.map(model => 
            (model as any).toJSON ? (model as any).toJSON() : model
        )
    }

    // Generates a unique identifier for this collection instance
    uniqueId(): string {
        return `collection_${Math.random().toString(36).substr(2, 9)}`
    }
}
