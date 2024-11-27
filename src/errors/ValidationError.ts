export class ValidationError extends Error {
    messages: Record<string, string>;

    constructor(messages: Record<string, string>) {
        super('Validation failed');
        this.name = 'ValidationError';
        this.messages = messages;
    }
}
