# Advanced TypeScript Types Reference

This document provides a comprehensive guide to the advanced type definitions in `@lexiflow/shared-types`.

## Table of Contents

1. [API Enhancements](#api-enhancements)
2. [State Management](#state-management)
3. [Utility Types](#utility-types)
4. [Type Guards](#type-guards)
5. [Result/Either Pattern](#resulteither-pattern)
6. [Events & Messaging](#events--messaging)
7. [Builder Patterns](#builder-patterns)
8. [Mapper Patterns](#mapper-patterns)
9. [Validation Types](#validation-types)

---

## API Enhancements

### HttpStatus Enum
Standard HTTP status codes for type-safe API responses.

```typescript
import { HttpStatus } from '@lexiflow/shared-types';

const response = {
  status: HttpStatus.OK, // 200
  data: { ... }
};
```

### ErrorCode Enum
Comprehensive application error codes.

```typescript
import { ErrorCode } from '@lexiflow/shared-types';

const error = {
  code: ErrorCode.UNAUTHORIZED,
  message: 'Invalid credentials'
};
```

### AsyncState
Discriminated union for async operations with exhaustive checking.

```typescript
import { AsyncState, isAsyncSuccess } from '@lexiflow/shared-types';

type UserData = { name: string; email: string };
const state: AsyncState<UserData> =
  { status: 'loading', progress: 50 };

// Exhaustive checking
switch (state.status) {
  case 'idle':
    return <div>Not started</div>;
  case 'loading':
    return <div>Loading... {state.progress}%</div>;
  case 'success':
    return <div>{state.data.name}</div>;
  case 'error':
    return <div>{state.error.message}</div>;
}

// Type guards
if (isAsyncSuccess(state)) {
  console.log(state.data.name); // Type-safe access
}
```

### MutationState
For create/update/delete operations.

```typescript
import { MutationState } from '@lexiflow/shared-types';

const mutation: MutationState<User> = {
  status: 'pending',
  variables: { name: 'John' }
};
```

### WebSocket Types
Type-safe WebSocket messaging.

```typescript
import { WebSocketMessage, WebSocketMessageType } from '@lexiflow/shared-types';

const message: WebSocketMessage<{ userId: string }> = {
  type: WebSocketMessageType.EVENT,
  payload: { userId: '123' },
  timestamp: new Date().toISOString()
};
```

---

## State Management

### FormState
Comprehensive form state with field-level validation.

```typescript
import { FormState, FieldValidationState } from '@lexiflow/shared-types';

interface LoginForm {
  email: string;
  password: string;
}

const formState: FormState<LoginForm> = {
  values: { email: '', password: '' },
  fields: {
    email: { status: 'invalid', errors: ['Invalid email'] },
    password: { status: 'valid' }
  },
  isDirty: true,
  isSubmitting: false,
  isValid: false,
  submitCount: 0
};
```

### AuthState
Authentication state machine.

```typescript
import { AuthState, isAuthenticated } from '@lexiflow/shared-types';

const auth: AuthState<User> = {
  type: 'authenticated',
  user: { id: '1', name: 'John' },
  token: 'jwt-token',
  expiresAt: '2025-12-31'
};

if (isAuthenticated(auth)) {
  console.log(auth.user.name); // Type-safe
}
```

### ConnectionState
Real-time connection status.

```typescript
import { ConnectionState } from '@lexiflow/shared-types';

const connection: ConnectionState = {
  status: 'connected',
  connectedAt: '2025-01-01T00:00:00Z'
};
```

### ModalState
Modal/Dialog state management.

```typescript
import { ModalState } from '@lexiflow/shared-types';

const modal: ModalState<User> = {
  isOpen: true,
  mode: 'edit',
  data: { id: '1', name: 'John' }
};
```

---

## Utility Types

### Deep Utilities

```typescript
import { DeepPartial, DeepRequired, DeepReadonly } from '@lexiflow/shared-types';

interface Config {
  api: {
    url: string;
    timeout: number;
  };
}

// All nested properties optional
type PartialConfig = DeepPartial<Config>;

// All nested properties required
type RequiredConfig = DeepRequired<Partial<Config>>;

// All nested properties readonly
type ReadonlyConfig = DeepReadonly<Config>;
```

### NonEmptyArray
Array that must have at least one element.

```typescript
import { NonEmptyArray } from '@lexiflow/shared-types';

function processItems(items: NonEmptyArray<string>) {
  const first = items[0]; // Always defined
  // ...
}
```

### Strict Pick/Omit
Type-safe property selection.

```typescript
import { StrictPick, StrictOmit } from '@lexiflow/shared-types';

interface User {
  id: string;
  name: string;
  email: string;
}

// Only allows valid keys
type UserBasic = StrictPick<User, 'id' | 'name'>;
type UserWithoutId = StrictOmit<User, 'id'>;
```

### KeysOfType
Get keys of specific value type.

```typescript
import { KeysOfType } from '@lexiflow/shared-types';

interface Data {
  id: string;
  count: number;
  name: string;
}

type StringKeys = KeysOfType<Data, string>; // 'id' | 'name'
```

### Path Types
Type-safe nested property paths.

```typescript
import { Path, PathValue } from '@lexiflow/shared-types';

interface User {
  profile: {
    address: {
      city: string;
    };
  };
}

type UserPath = Path<User>; // 'profile' | 'profile.address' | 'profile.address.city'
type CityType = PathValue<User, 'profile.address.city'>; // string
```

---

## Type Guards

### Basic Type Guards

```typescript
import {
  isString,
  isNumber,
  isObject,
  isArray,
  isDefined
} from '@lexiflow/shared-types';

function process(value: unknown) {
  if (isString(value)) {
    console.log(value.toUpperCase()); // string methods available
  }

  if (isDefined(value)) {
    // value is not null or undefined
  }
}
```

### Advanced Type Guards

```typescript
import {
  isUUID,
  isEmail,
  isUrl,
  isISODateString
} from '@lexiflow/shared-types';

function validateInput(value: unknown) {
  if (isEmail(value)) {
    // Send email
  }

  if (isUUID(value)) {
    // Valid UUID v4
  }
}
```

### Assertion Functions

```typescript
import {
  assert,
  assertDefined,
  assertString,
  assertNever
} from '@lexiflow/shared-types';

function processValue(value: string | undefined) {
  assertDefined(value, 'Value must be defined');
  // value is now string (not undefined)

  console.log(value.toUpperCase());
}

// Exhaustive checking
function handleStatus(status: 'idle' | 'loading') {
  switch (status) {
    case 'idle':
      return 'Not started';
    case 'loading':
      return 'Loading...';
    default:
      return assertNever(status); // Compile error if not exhaustive
  }
}
```

---

## Result/Either Pattern

Functional error handling without exceptions.

### Result Type

```typescript
import { Result, ok, err, isOk } from '@lexiflow/shared-types';

function divide(a: number, b: number): Result<number, string> {
  if (b === 0) {
    return err('Division by zero');
  }
  return ok(a / b);
}

const result = divide(10, 2);

if (isOk(result)) {
  console.log(result.value); // 5
} else {
  console.error(result.error);
}
```

### Result Utilities

```typescript
import { Result } from '@lexiflow/shared-types';

const result = divide(10, 2);

// Map over success value
const doubled = Result.map(result, x => x * 2);

// Chain operations
const chained = Result.flatMap(result, x => divide(x, 2));

// Match pattern
const message = Result.match(
  result,
  value => `Success: ${value}`,
  error => `Error: ${error}`
);

// Get with default
const value = Result.getOrElse(result, 0);

// Try/catch wrapper
const safeResult = Result.tryCatch(
  () => JSON.parse(input),
  error => 'Invalid JSON'
);

// Async version
const asyncResult = await Result.tryCatchAsync(
  () => fetch('/api/data').then(r => r.json())
);
```

### Option Type

```typescript
import { Option, some, none, isSome } from '@lexiflow/shared-types';

function findUser(id: string): Option<User> {
  const user = users.find(u => u.id === id);
  return user ? some(user) : none();
}

const user = findUser('123');

if (isSome(user)) {
  console.log(user.value.name);
}

// Utilities
const name = Option.map(user, u => u.name);
const userName = Option.getOrElse(user, { name: 'Unknown' });
```

### Either Type

```typescript
import { Either, left, right, isRight } from '@lexiflow/shared-types';

function parseAge(input: string): Either<string, number> {
  const age = parseInt(input, 10);
  if (isNaN(age)) {
    return left('Invalid number');
  }
  if (age < 0 || age > 150) {
    return left('Age out of range');
  }
  return right(age);
}

const result = parseAge('25');

if (isRight(result)) {
  console.log(result.right); // 25
}
```

---

## Events & Messaging

### Domain Events

```typescript
import { DomainEvent, DomainEventType } from '@lexiflow/shared-types';

const event: DomainEvent = {
  type: DomainEventType.USER_CREATED,
  payload: {
    userId: '123',
    email: 'user@example.com',
    role: 'admin'
  },
  timestamp: new Date().toISOString(),
  metadata: {
    source: 'user-service',
    correlationId: 'abc-123'
  }
};
```

### Event Emitter

```typescript
import { EventEmitter, EventHandler } from '@lexiflow/shared-types';

const emitter: EventEmitter = {
  on(eventType, handler) { /* ... */ },
  off(eventType, handler) { /* ... */ },
  once(eventType, handler) { /* ... */ },
  emit(event) { /* ... */ },
  removeAllListeners() { /* ... */ }
};

emitter.on('USER_CREATED', async (event) => {
  console.log('User created:', event.payload);
});
```

### Real-time Presence

```typescript
import { PresenceState, PresenceEvent } from '@lexiflow/shared-types';

const presence: PresenceState = {
  userId: '123',
  userName: 'John Doe',
  status: 'online',
  location: 'case:456',
  cursor: { x: 100, y: 200 },
  lastActiveAt: new Date().toISOString()
};
```

---

## Builder Patterns

### Fluent Builder

```typescript
import { FluentBuilder } from '@lexiflow/shared-types';

interface User {
  id: string;
  name: string;
  email: string;
}

const builder: FluentBuilder<User> = createBuilder();

const user = builder
  .id('123')
  .name('John')
  .email('john@example.com')
  .build();
```

### Query Builder

```typescript
import { QueryBuilder } from '@lexiflow/shared-types';

const query = queryBuilder<User>()
  .where('role', 'eq', 'admin')
  .and()
  .where('status', 'eq', 'active')
  .orderBy('createdAt', 'desc')
  .limit(10)
  .build();
```

---

## Mapper Patterns

### Generic Mapper

```typescript
import { Mapper } from '@lexiflow/shared-types';

class UserDtoMapper implements Mapper<UserEntity, UserDto> {
  map(entity: UserEntity): UserDto {
    return {
      id: entity.id,
      fullName: `${entity.firstName} ${entity.lastName}`,
      email: entity.email
    };
  }

  mapArray(entities: UserEntity[]): UserDto[] {
    return entities.map(e => this.map(e));
  }
}
```

### Bidirectional Mapper

```typescript
import { BidirectionalMapper } from '@lexiflow/shared-types';

class UserMapper implements BidirectionalMapper<UserEntity, UserDto> {
  map(entity: UserEntity): UserDto { /* ... */ }
  reverse(dto: UserDto): UserEntity { /* ... */ }
  mapArray(entities: UserEntity[]): UserDto[] { /* ... */ }
  reverseArray(dtos: UserDto[]): UserEntity[] { /* ... */ }
}
```

---

## Validation Types

### Schema Validation

```typescript
import { Schema, StringSchema, ObjectSchema } from '@lexiflow/shared-types';

const userSchema: ObjectSchema<User> = {
  shape: {
    email: stringSchema().email().min(5).max(100),
    age: numberSchema().min(18).max(120),
    role: enumSchema(['admin', 'user', 'guest'])
  }
};

const result = userSchema.validate(input);

if (result.isValid) {
  // Process valid data
} else {
  // Handle errors
  console.error(result.errors);
}
```

### Field Validators

```typescript
import { FieldValidator, ValidationResult } from '@lexiflow/shared-types';

const emailValidator: FieldValidator<string> = {
  validate(value: string): ValidationResult {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    return isValid
      ? { isValid: true, errors: [] }
      : {
          isValid: false,
          errors: [{
            field: 'email',
            message: 'Invalid email format',
            code: 'INVALID_EMAIL',
            value
          }]
        };
  }
};
```

---

## Best Practices

### 1. Use Discriminated Unions

Always use discriminated unions for state machines:

```typescript
// ✅ Good
type State =
  | { status: 'idle' }
  | { status: 'loading'; progress: number }
  | { status: 'success'; data: Data };

// ❌ Bad
type State = {
  status: 'idle' | 'loading' | 'success';
  progress?: number;
  data?: Data;
};
```

### 2. Prefer Result Over Exceptions

```typescript
// ✅ Good
function parseUser(input: string): Result<User, string> {
  return Result.tryCatch(
    () => JSON.parse(input),
    error => 'Invalid JSON'
  );
}

// ❌ Bad
function parseUser(input: string): User {
  return JSON.parse(input); // May throw
}
```

### 3. Use Type Guards

```typescript
// ✅ Good
if (isAsyncSuccess(state)) {
  console.log(state.data); // Type-safe
}

// ❌ Bad
if (state.status === 'success') {
  console.log(state.data); // Requires type assertion
}
```

### 4. Leverage Utility Types

```typescript
// ✅ Good
type PartialUser = DeepPartial<User>;

// ❌ Bad
type PartialUser = {
  profile?: {
    address?: {
      city?: string;
    };
  };
};
```

---

## Migration Guide

### From Basic Types to Enhanced Types

```typescript
// Before
interface ApiResponse {
  data?: any;
  error?: any;
}

// After
import { AsyncState } from '@lexiflow/shared-types';

type State = AsyncState<UserData, ApiError>;
```

### From Try/Catch to Result

```typescript
// Before
try {
  const data = await fetchUser(id);
  return data;
} catch (error) {
  console.error(error);
  return null;
}

// After
const result = await Result.fromPromise(fetchUser(id));
return Result.getOrElse(result, null);
```

---

## Performance Considerations

1. **Type Guards**: Minimal runtime overhead
2. **Discriminated Unions**: Zero runtime cost, pure compile-time checking
3. **Result Type**: Small object allocation, but prevents exception overhead
4. **Builders**: Method chaining may allocate intermediate objects

---

## TypeScript Configuration

Ensure your `tsconfig.json` has strict mode enabled:

```json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitAny": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

---

## Additional Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Type Challenges](https://github.com/type-challenges/type-challenges)
- [Effective TypeScript](https://effectivetypescript.com/)

---

**Version**: 2.0.0
**Last Updated**: 2025-12-29
