"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = void 0;
class ValidationError extends Error {
    constructor(messages) {
        super('Validation failed');
        this.name = 'ValidationError';
        this.messages = messages;
    }
}
exports.ValidationError = ValidationError;
