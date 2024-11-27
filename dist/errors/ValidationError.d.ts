export declare class ValidationError extends Error {
    messages: Record<string, string>;
    constructor(messages: Record<string, string>);
}
