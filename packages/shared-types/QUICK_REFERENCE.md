# LexiFlow Shared Types - Quick Reference Guide

## Installation

```bash
npm install @lexiflow/shared-types
```

## Import Examples

### Result/Either Pattern

```typescript
import { Result, ok, err, isOk, isErr } from '@lexiflow/shared-types';

// Create results
const success = ok<string, Error>('Hello');
const failure = err<string, Error>(new Error('Failed'));

// Type guards
if (isOk(success)) {
  console.log(success.value); // TypeScript knows value exists
}

// Utility methods
Result.map(success, (val) => val.toUpperCase());
Result.flatMap(success, (val) => ok(val.length));
Result.getOrElse(failure, 'default value');

// Match pattern
Result.match(
  success,
  (value) => `Success: ${value}`,
  (error) => `Error: ${error.message}`
);
```

### Option Pattern

```typescript
import { Option, some, none, isSome } from '@lexiflow/shared-types';

const maybeValue = some(42);
const nothing = none();

// Map and chain
Option.map(maybeValue, (n) => n * 2);
Option.flatMap(maybeValue, (n) => some(n.toString()));
Option.getOrElse(nothing, 0);

// From nullable
Option.fromNullable(null); // none()
Option.fromNullable(42);   // some(42)
```

### Utility Types

```typescript
import type {
  DeepPartial,
  DeepReadonly,
  NonEmptyArray,
  Prettify,
  Get,
  PickByValue
} from '@lexiflow/shared-types';

// Deep transformations
type User = { name: string; address: { city: string } };
type PartialUser = DeepPartial<User>;
// { name?: string; address?: { city?: string } }

// Non-empty array
type Colors = NonEmptyArray<string>;
const colors: Colors = ['red']; // ✅
const empty: Colors = [];       // ❌ Type error

// Get nested property type
type City = Get<User, 'address.city'>; // string

// Pick by value type
type StringProps = PickByValue<User, string>; // { name: string }
```

### Type Guards

```typescript
import {
  isString,
  isEmail,
  isUUID,
  isNonEmptyArray,
  hasKeys,
  isArrayOf
} from '@lexiflow/shared-types';

function processData(data: unknown) {
  if (isString(data)) {
    // data is string
  }

  if (isEmail(data)) {
    // data is valid email string
  }

  if (hasKeys(data, 'id', 'name')) {
    // data is { id: unknown; name: unknown; ... }
    console.log(data.id, data.name);
  }

  if (isArrayOf(data, isString)) {
    // data is string[]
    data.forEach(s => s.toUpperCase());
  }
}
```

### Validation Types

```typescript
import type {
  ValidationResult,
  ValidatorFn,
  Schema,
  FieldValidator
} from '@lexiflow/shared-types';

// Simple validator
const emailValidator: ValidatorFn<string> = (value) => {
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return { isValid: true, errors: [] as never };
  }
  return {
    isValid: false,
    errors: [{ field: 'email', message: 'Invalid email', code: 'INVALID_EMAIL' }]
  };
};

// Field validator
const required: FieldValidator = {
  validate: (value) => {
    if (value != null && value !== '') {
      return { isValid: true, errors: [] as never };
    }
    return {
      isValid: false,
      errors: [{ field: '', message: 'Required', code: 'REQUIRED' }]
    };
  }
};
```

### State Management

```typescript
import type {
  FormState,
  AuthState,
  NetworkState,
  isAuthenticated
} from '@lexiflow/shared-types';

// Auth state with discriminated union
function handleAuth(state: AuthState<User>) {
  switch (state.type) {
    case 'unauthenticated':
      return <Login />;
    case 'authenticating':
      return <Spinner />;
    case 'authenticated':
      return <Dashboard user={state.user} token={state.token} />;
    case 'error':
      return <Error error={state.error} />;
  }
}

// Type guard
if (isAuthenticated(authState)) {
  // TypeScript knows: state.user, state.token, state.expiresAt exist
  console.log(authState.user);
}
```

### API Enhancements

```typescript
import type {
  AsyncState,
  ApiResult,
  HttpStatus,
  ErrorCode,
  isAsyncSuccess
} from '@lexiflow/shared-types';

// Async state
type UserState = AsyncState<User, ApiError>;

const state: UserState = {
  status: 'success',
  data: user,
  timestamp: new Date().toISOString()
};

if (isAsyncSuccess(state)) {
  console.log(state.data); // TypeScript knows data exists
}

// API Result with error handling
async function fetchUser(id: string): ApiResult<User> {
  try {
    const user = await api.get(`/users/${id}`);
    return ok(user);
  } catch (error) {
    return err({
      message: 'User not found',
      code: ErrorCode.NOT_FOUND,
      statusCode: HttpStatus.NOT_FOUND
    });
  }
}
```

### Events

```typescript
import type {
  BaseEvent,
  DomainEvent,
  EventHandler,
  EventEmitter
} from '@lexiflow/shared-types';

// Custom event
interface UserCreatedEvent extends BaseEvent<'USER_CREATED'> {
  payload: {
    userId: string;
    email: string;
  };
}

// Event handler
const handler: EventHandler<UserCreatedEvent> = async (event) => {
  console.log('User created:', event.payload.userId);
  await sendWelcomeEmail(event.payload.email);
};

// Type-safe event emitter
const emitter: EventEmitter<DomainEvent> = {
  on: (type, handler) => { /* ... */ },
  off: (type, handler) => { /* ... */ },
  emit: (event) => { /* ... */ },
  once: (type, handler) => { /* ... */ },
  removeAllListeners: (type) => { /* ... */ }
};
```

### Builder Patterns

```typescript
import type { FluentBuilder, QueryBuilder } from '@lexiflow/shared-types';

// Fluent builder type
type UserBuilder = FluentBuilder<User>;

const builder: UserBuilder = {
  name: (val) => builder,
  email: (val) => builder,
  age: (val) => builder,
  build: () => ({
    name: 'John',
    email: 'john@example.com',
    age: 30
  }),
  reset: () => builder,
  clone: () => builder
};

// Usage
const user = builder
  .name('John')
  .email('john@example.com')
  .age(30)
  .build();
```

### Mapper Patterns

```typescript
import type {
  Mapper,
  BidirectionalMapper,
  ViewModelMapper
} from '@lexiflow/shared-types';

// Entity to DTO mapper
const userMapper: Mapper<UserEntity, UserDTO> = {
  map: (entity) => ({
    id: entity.id,
    fullName: `${entity.firstName} ${entity.lastName}`,
    email: entity.email
  }),
  mapArray: (entities) => entities.map(userMapper.map)
};

// Bidirectional mapper
const configMapper: BidirectionalMapper<Config, ConfigDTO> = {
  map: (config) => ({ /* ... */ }),
  mapArray: (configs) => configs.map(configMapper.map),
  reverse: (dto) => ({ /* ... */ }),
  reverseArray: (dtos) => dtos.map(configMapper.reverse)
};
```

### Form Types

```typescript
import type {
  FormSchema,
  FieldSchema,
  WizardConfig,
  FormState
} from '@lexiflow/shared-types';

// Form schema
const loginSchema: FormSchema = {
  id: 'login-form',
  title: 'Login',
  fields: [
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      validationRules: [
        {
          name: 'email',
          validator: (value) => ({
            valid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
            message: 'Invalid email'
          })
        }
      ]
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      required: true,
      minLength: 8
    }
  ]
};
```

### Dashboard Types

```typescript
import type {
  DashboardState,
  DashboardMetric,
  Activity,
  isDashboardSuccess
} from '@lexiflow/shared-types';

// Dashboard state
const state: DashboardState<DashboardData> = {
  status: 'success',
  data: dashboardData,
  lastUpdated: new Date()
};

// Type guard usage
if (isDashboardSuccess(state)) {
  renderDashboard(state.data);
}

// Metrics
const metric: DashboardMetric = {
  id: 'revenue',
  label: 'Total Revenue',
  value: 125000,
  change: 15,
  changeType: 'increase',
  format: 'currency',
  unit: 'USD'
};
```

## Common Patterns

### Error Handling

```typescript
// ❌ Traditional try-catch
try {
  const user = await fetchUser(id);
  return user.email;
} catch (error) {
  console.error(error);
  return null;
}

// ✅ Result pattern
const result = await Result.tryCatchAsync(
  () => fetchUser(id),
  (error) => new ApiError(error)
);

return Result.map(result, (user) => user.email)
  .getOrElse(null);
```

### Null Safety

```typescript
// ❌ Null checking
function getCity(user: User | null): string {
  if (user && user.address && user.address.city) {
    return user.address.city;
  }
  return 'Unknown';
}

// ✅ Option pattern
function getCity(user: User | null): string {
  return Option.fromNullable(user)
    .flatMap(u => Option.fromNullable(u.address))
    .flatMap(a => Option.fromNullable(a.city))
    .getOrElse('Unknown');
}
```

### Type-Safe State

```typescript
// ❌ Boolean flags
interface State {
  loading: boolean;
  error: Error | null;
  data: User | null;
}

// ✅ Discriminated union
type State =
  | { status: 'loading' }
  | { status: 'error'; error: Error }
  | { status: 'success'; data: User };

// Exhaustive checking
function render(state: State) {
  switch (state.status) {
    case 'loading':
      return <Spinner />;
    case 'error':
      return <Error error={state.error} />; // error is guaranteed to exist
    case 'success':
      return <User data={state.data} />; // data is guaranteed to exist
  }
}
```

### Type-Safe IDs

```typescript
import type { UserId, CaseId } from '@lexiflow/shared-types';

// ❌ String IDs can be mixed
function assignCase(userId: string, caseId: string) { }
assignCase(caseId, userId); // Oops! Wrong order, but compiles

// ✅ Branded IDs prevent mixing
function assignCase(userId: UserId, caseId: CaseId) { }
assignCase(caseId, userId); // ❌ Type error!
```

## Advanced Usage

### Type-Level Programming

```typescript
import type { If, And, Or, Equals, Includes } from '@lexiflow/shared-types';

// Conditional types
type IsString<T> = T extends string ? true : false;
type Result = IsString<'hello'>; // true

// Type equality
type Same = Equals<string, string>; // true
type Different = Equals<string, number>; // false

// Boolean logic
type BothTrue = And<true, true>; // true
type OneFalse = And<true, false>; // false
type EitherTrue = Or<false, true>; // true
```

### String Manipulation

```typescript
import type {
  Split,
  Join,
  SnakeToCamel,
  CamelToSnake,
  Replace
} from '@lexiflow/shared-types';

type Path = 'user.address.city';
type Parts = Split<Path, '.'>; // ['user', 'address', 'city']

type SnakeCase = 'user_name_field';
type CamelCase = SnakeToCamel<SnakeCase>; // 'userNameField'

type BackToSnake = CamelToSnake<'userNameField'>; // 'user_name_field'
```

### Deep Transformations

```typescript
import type { Get, Set, DeepPartial } from '@lexiflow/shared-types';

interface User {
  profile: {
    name: string;
    address: {
      city: string;
      zip: number;
    };
  };
}

// Get nested type
type City = Get<User, 'profile.address.city'>; // string

// Set nested type
type WithNewZip = Set<User, 'profile.address.zip', string>; // zip is now string

// Deep partial
type PartialUser = DeepPartial<User>;
// All properties optional recursively
```

## Migration from Old Types

```typescript
// Before
interface ApiResponse {
  data?: User;
  error?: string;
  loading: boolean;
}

// After
import { AsyncState } from '@lexiflow/shared-types';
type ApiResponse = AsyncState<User, ApiError>;

// Migration helper
function migrateState(old: OldApiResponse): AsyncState<User, ApiError> {
  if (old.loading) return { status: 'loading' };
  if (old.error) return { status: 'error', error: new ApiError(old.error), timestamp: new Date().toISOString() };
  if (old.data) return { status: 'success', data: old.data, timestamp: new Date().toISOString() };
  return { status: 'idle' };
}
```

## TypeScript Configuration

Recommended `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true
  }
}
```

## Resources

- [Full Documentation](./ENHANCEMENTS_SUMMARY.md)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Type Challenges](https://github.com/type-challenges/type-challenges)
