import locale from './locale'

export type ValidatorResult = {
    valid: boolean;
    message?: string;
}

export type Validator = (value: any) => ValidatorResult;

export type ValidationRuleConfig = {
    name: string;
    test: (value: any, ...args: any[]) => boolean;
    message?: string;
    data?: Record<string, any>;
}

export interface ValidationRule {
    validate: Validator;
    message?: string;
    data?: Record<string, any>;
    and(next: ValidationRule): ValidationRule;
}

// Helper function to create a chainable validation rule
const createChainableRule = (config: ValidationRuleConfig): ValidationRule & Function => {
    const validationRule: ValidationRule = {
        validate: (value: any): ValidatorResult => ({
            valid: config.test(value),
            message: !config.test(value) 
                ? (config.message || locale.getMessage(config.name, config.data || {}))
                : undefined
        }),
        message: config.message,
        data: config.data,
        and(next: ValidationRule): ValidationRule {
            return {
                validate: (value: any): ValidatorResult => {
                    const firstResult = this.validate(value);
                    if (!firstResult.valid) {
                        return firstResult;
                    }
                    return next.validate(value);
                },
                message: next.message,
                data: next.data,
                and: next.and
            };
        }
    };

    // Create a function that returns the validation rule
    const ruleFunction = Object.assign(
        function() { return validationRule; },
        validationRule
    );

    return ruleFunction as ValidationRule & Function;
}

// Helper function to create a validator
const createValidator = (validate: (value: any) => boolean, key: string, params: Record<string, any> = {}): Validator => {
    return (value: any): ValidatorResult => ({
        valid: validate(value),
        message: !validate(value) ? locale.getMessage(key, params) : undefined
    })
}

// Required validation
export const required = createChainableRule({
    name: 'required',
    test: (v: any) => v !== undefined && v !== null && v !== ''
})

// String validations
export const email = createChainableRule({
    name: 'email',
    test: (v: any) => /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(String(v))
})

export const url = createChainableRule({
    name: 'url',
    test: (v: any) => /^https?:\/\/[\w\-]+(\.[\w\-]+)+[/#?]?.*$/.test(v)
})

export const minLength = (min: number) => createChainableRule({
    name: 'minLength',
    test: (v: any) => String(v).length >= min,
    data: { min }
})

export const maxLength = (max: number) => createChainableRule({
    name: 'maxLength',
    test: (v: any) => String(v).length <= max,
    data: { max }
})

export const alpha = createChainableRule({
    name: 'alpha',
    test: (v: any) => /^[a-zA-Z]*$/.test(String(v))
})

export const alphanumeric = createChainableRule({
    name: 'alphanumeric',
    test: (v: any) => /^[a-zA-Z0-9]*$/.test(String(v))
})

export const match = (pattern: string | RegExp) => createChainableRule({
    name: 'match',
    test: (v: any) => new RegExp(pattern).test(String(v)),
    data: { pattern }
})

// Number validations
export const numeric = createChainableRule({
    name: 'numeric',
    test: (v: any) => !isNaN(Number(v)) && isFinite(v)
})

export const integer = createChainableRule({
    name: 'integer',
    test: (v: any) => Number.isInteger(Number(v))
})

export const min = (min: number) => createChainableRule({
    name: 'min',
    test: (v: any) => Number(v) >= min,
    data: { min }
})

export const max = (max: number) => createChainableRule({
    name: 'max',
    test: (v: any) => Number(v) <= max,
    data: { max }
})

export const between = (min: number, max: number) => createChainableRule({
    name: 'between',
    test: (v: any) => {
        const num = Number(v);
        return num >= min && num <= max;
    },
    data: { min, max }
})

// Date validations
export const date = createChainableRule({
    name: 'date',
    test: (v: any) => !isNaN(Date.parse(v))
})

export const before = (date: string | Date) => createChainableRule({
    name: 'before',
    test: (v: any) => new Date(v) < new Date(date),
    data: { date }
})

export const after = (date: string | Date) => createChainableRule({
    name: 'after',
    test: (v: any) => new Date(v) > new Date(date),
    data: { date }
})

// Array validations
export const array = createChainableRule({
    name: 'array',
    test: (v: any) => Array.isArray(v)
})

export const inArray = (values: any[]) => createChainableRule({
    name: 'in',
    test: (v: any) => values.includes(v),
    data: { values: values.join(', ') }
})

export const notInArray = (values: any[]) => createChainableRule({
    name: 'notIn',
    test: (v: any) => !values.includes(v),
    data: { values: values.join(', ') }
})

// Type validations
export const boolean = createChainableRule({
    name: 'boolean',
    test: (v: any) => typeof v === 'boolean'
})

export const object = createChainableRule({
    name: 'object',
    test: (v: any) => typeof v === 'object' && v !== null && !Array.isArray(v)
})

// Export locale for direct access
export { locale }
