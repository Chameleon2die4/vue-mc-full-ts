# vue-mc-ts

A TypeScript port of [vue-mc](https://www.npmjs.com/package/vue-mc), bringing type safety to Models and Collections for Vue.js.

## Overview

This library is a TypeScript implementation of the popular vue-mc library, providing strongly-typed models and collections for Vue.js applications. It maintains compatibility with the original library's API while adding full TypeScript support and Vue 3 compatibility.

## Features

- Full TypeScript support with proper type definitions
- Vue 3 compatibility with Composition API support
- Models with validation, computed properties, and API integration
- Collections for managing groups of models
- HTTP request/response handling with axios
- Maintains API compatibility with the original vue-mc library

## Installation

```bash
npm install vue-mc-full-ts
```

## Requirements

- Vue.js 3.x
- TypeScript 4.x or higher

## Basic Usage

```typescript
import { Model, Collection } from 'vue-mc-ts';

// Define a model with TypeScript types
class User extends Model {
    defaults(): Record<string, any> {
        return {
            name: '',
            email: '',
            active: false
        };
    }

    validation(): Record<string, any> {
        return {
            name: (value: string) => Boolean(value) || 'Name is required',
            email: (value: string) => /\S+@\S+\.\S+/.test(value) || 'Invalid email'
        };
    }

    // Route configuration for API requests
    routes(): Record<string, string> {
        return {
            fetch: 'users/{id}',
            save: 'users'
        };
    }
}

// Define a collection with TypeScript types
class UserCollection extends Collection {
    model(): typeof Model {
        return User;
    }

    // Route configuration for the collection
    routes(): Record<string, string> {
        return {
            fetch: 'users'
        };
    }
}

// Usage in Vue component
const user = new User({ name: 'John' });
const users = new UserCollection();

// Validate
await user.validate(); // Returns Promise<boolean>

// Save to API
await user.save();

// Fetch from API
await users.fetch();
```

## Differences from vue-mc

1. TypeScript Support:
   - Full type definitions for all classes and methods
   - Improved type safety for validation rules and API responses
   - Better IDE support with TypeScript intellisense

2. Vue 3 Integration:
   - Uses Vue 3's reactivity system
   - Compatible with Composition API
   - Modern Vue.js best practices

3. Enhanced Features:
   - Improved error handling with TypeScript types
   - Better type inference for model attributes
   - Type-safe validation rules

## Documentation

For detailed documentation about the original library features, visit:
- [Original vue-mc Documentation](https://vuemc.io/)
- [vue-mc GitHub Repository](https://github.com/FiguredLimited/vue-mc)

For TypeScript-specific features and improvements, check the following sections:

### Type-Safe Models

```typescript
interface UserData {
    id: number;
    name: string;
    email: string;
}

class User extends Model {
    declare attributes: UserData;

    defaults(): Partial<UserData> {
        return {
            name: '',
            email: ''
        };
    }
}
```

### Type-Safe Collections

```typescript
class UserCollection extends Collection<User> {
    model(): typeof Model {
        return User;
    }
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Credits

This library is a TypeScript implementation of [vue-mc](https://www.npmjs.com/package/vue-mc) by Figured Limited.
