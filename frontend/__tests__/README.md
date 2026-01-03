# LexiFlow Premium - Frontend Test Suite

## Overview

This directory contains the comprehensive test suite for the LexiFlow Premium frontend application. The tests are organized by feature area and include unit tests, integration tests, and component tests.

## Test Structure

```
__tests__/
├── __mocks__/                 # Mock implementations
│   ├── contexts.tsx          # Mock React contexts (Theme, Auth, Notification)
│   ├── hooks.ts              # Mock custom hooks
│   ├── recharts.tsx          # Mock Recharts components
│   └── services.ts           # Mock API and data services
├── components/               # Component tests
│   ├── billing/             # Billing component tests
│   ├── case-list/           # Case list component tests
│   ├── common/              # Common/shared component tests
│   ├── compliance/          # Compliance component tests
│   ├── crm/                 # CRM component tests
│   ├── dashboard/           # Dashboard component tests
│   ├── discovery/           # Discovery component tests
│   ├── documents/           # Document component tests
│   ├── enterprise/          # Enterprise-level components
│   │   ├── auth/           # Authentication components
│   │   ├── billing/        # Enterprise billing
│   │   ├── cases/          # Enterprise case management
│   │   ├── crm/            # Enterprise CRM
│   │   ├── dashboard/      # Enterprise dashboards
│   │   ├── discovery/      # E-discovery tools
│   │   ├── documents/      # Document management
│   │   ├── research/       # Legal research tools
│   │   └── ui/             # Enterprise UI components
│   ├── evidence/            # Evidence component tests
│   ├── layout/              # Layout component tests
│   ├── pleading/            # Pleading component tests
│   └── workflow/            # Workflow component tests
├── hooks/                   # Custom hook tests
├── services/                # Service layer tests
│   ├── core/               # Core service tests
│   └── repositories/       # Repository pattern tests
├── utils/                   # Utility function tests
├── setup.cjs               # Jest setup and global mocks
├── test-utils.tsx          # Custom render utilities
└── README.md               # This file

```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

### Run Specific Test File
```bash
npm test path/to/test-file.test.tsx
```

### Run Tests for Specific Component
```bash
npm test -- ComponentName
```

### Run Tests in a Specific Directory
```bash
npm test -- __tests__/components/enterprise
```

## Writing Tests

### Basic Component Test

```typescript
import { render, screen } from '@/__tests__/test-utils';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const { user } = render(<MyComponent />);
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Clicked')).toBeInTheDocument();
  });
});
```

### Using Mock Services

```typescript
import { render, screen } from '@/__tests__/test-utils';
import { mockApiService } from '@/__tests__/__mocks__/services';
import MyComponent from '@/components/MyComponent';

describe('MyComponent with API', () => {
  beforeEach(() => {
    mockApiService.get.mockResolvedValue({ data: { id: 1, name: 'Test' } });
  });

  it('fetches and displays data', async () => {
    render(<MyComponent />);
    expect(await screen.findByText('Test')).toBeInTheDocument();
    expect(mockApiService.get).toHaveBeenCalledWith('/api/data');
  });
});
```

### Using Mock Contexts

```typescript
import { render, screen } from '@/__tests__/test-utils';
import { MockAuthProvider, mockAuth } from '@/__tests__/__mocks__/contexts';
import MyComponent from '@/components/MyComponent';

describe('MyComponent with Auth', () => {
  it('displays user info when authenticated', () => {
    render(
      <MockAuthProvider>
        <MyComponent />
      </MockAuthProvider>
    );
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });
});
```

### Testing Hooks

```typescript
import { renderHook, act } from '@testing-library/react';
import { useMyHook } from '@/hooks/useMyHook';

describe('useMyHook', () => {
  it('returns initial state', () => {
    const { result } = renderHook(() => useMyHook());
    expect(result.current.value).toBe(null);
  });

  it('updates state correctly', () => {
    const { result } = renderHook(() => useMyHook());
    act(() => {
      result.current.setValue('new value');
    });
    expect(result.current.value).toBe('new value');
  });
});
```

### Testing Async Operations

```typescript
import { render, screen, waitFor } from '@/__tests__/test-utils';
import MyAsyncComponent from '@/components/MyAsyncComponent';

describe('MyAsyncComponent', () => {
  it('shows loading state then data', async () => {
    render(<MyAsyncComponent />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Data loaded')).toBeInTheDocument();
    });
  });
});
```

## Test Utilities

### Custom Render
The `test-utils.tsx` file provides a custom render function that wraps components with necessary providers:

```typescript
import { render } from '@/__tests__/test-utils';
```

This automatically wraps your component with:
- `BrowserRouter` for routing
- Any other global providers (can be extended)

### Mock Utilities

#### Contexts (`__mocks__/contexts.tsx`)
- `MockThemeProvider` - Mock theme context
- `MockAuthProvider` - Mock authentication context
- `MockNotificationProvider` - Mock notification context
- `resetContextMocks()` - Reset all context mocks

#### Services (`__mocks__/services.ts`)
- `mockApiService` - Mock API calls
- `mockAuthService` - Mock authentication
- `mockDataService` - Mock data operations
- `mockCacheService` - Mock caching
- `mockNotificationService` - Mock notifications
- `mockEventBus` - Mock event system
- `mockSearchService` - Mock search
- `mockSyncEngine` - Mock synchronization
- `resetServiceMocks()` - Reset all service mocks

#### Hooks (`__mocks__/hooks.ts`)
- `mockUseAsync` - Mock async operations
- `mockUseDebounce` - Mock debounced values
- `mockUseLocalStorage` - Mock localStorage hook
- `mockUseMediaQuery` - Mock media queries
- `mockUseTheme` - Mock theme hook
- `mockUsePagination` - Mock pagination
- `mockUseForm` - Mock form handling
- `mockUseAuth` - Mock authentication hook
- `mockUseNotification` - Mock notifications
- `mockUseQuery` - Mock React Query queries
- `mockUseMutation` - Mock React Query mutations
- `resetHookMocks()` - Reset all hook mocks

#### Recharts (`__mocks__/recharts.tsx`)
Mock implementations of all Recharts components for easier testing of charts and visualizations.

## Global Setup

The `setup.cjs` file configures:

1. **jest-dom matchers** - Enhanced DOM assertions
2. **window.matchMedia** - Mock media query matching
3. **IntersectionObserver** - Mock intersection observations
4. **ResizeObserver** - Mock resize observations
5. **localStorage/sessionStorage** - Mock storage APIs
6. **crypto.randomUUID** - Mock UUID generation
7. **Console suppression** - Suppress noisy React warnings in tests

## Coverage Requirements

### Minimum Coverage Targets
- **Statements**: 80%
- **Branches**: 75%
- **Functions**: 80%
- **Lines**: 80%

### Priority Areas for 90%+ Coverage
- Critical business logic
- Authentication and security
- Data validation and processing
- Billing and financial calculations
- Compliance and audit features

### Acceptable Lower Coverage (60%+)
- UI components with complex styling
- Third-party integrations
- Experimental features

## Best Practices

### DO:
- ✅ Write descriptive test names that explain the behavior
- ✅ Test user interactions, not implementation details
- ✅ Use `screen.getByRole()` for better accessibility testing
- ✅ Test error states and edge cases
- ✅ Mock external dependencies (APIs, services)
- ✅ Clean up after tests (clear mocks, timers, etc.)
- ✅ Use `waitFor` for async assertions
- ✅ Test accessibility with jest-dom matchers

### DON'T:
- ❌ Test implementation details
- ❌ Write tests that depend on each other
- ❌ Use brittle selectors (test IDs only when necessary)
- ❌ Mock everything (test real behavior when possible)
- ❌ Write tests just for coverage numbers
- ❌ Ignore warnings and errors
- ❌ Use `act()` warnings as indicators of problems

## Common Patterns

### Testing Forms
```typescript
it('submits form with valid data', async () => {
  const onSubmit = jest.fn();
  const { user } = render(<MyForm onSubmit={onSubmit} />);

  await user.type(screen.getByLabelText('Email'), 'test@example.com');
  await user.type(screen.getByLabelText('Password'), 'password123');
  await user.click(screen.getByRole('button', { name: /submit/i }));

  await waitFor(() => {
    expect(onSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });
});
```

### Testing Error States
```typescript
it('displays error message on API failure', async () => {
  mockApiService.get.mockRejectedValue(new Error('API Error'));

  render(<MyComponent />);

  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});
```

### Testing Loading States
```typescript
it('shows loading spinner while fetching', async () => {
  render(<MyComponent />);

  expect(screen.getByRole('progressbar')).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
});
```

## Debugging Tests

### Run Tests in Debug Mode
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

### View Test Output
```bash
npm test -- --verbose
```

### Debug Specific Test
```bash
npm test -- --testNamePattern="test name pattern"
```

### Check What's Being Rendered
```typescript
import { screen, debug } from '@testing-library/react';

// Debug entire document
debug();

// Debug specific element
debug(screen.getByRole('button'));
```

## Adding New Tests

When adding a new test:

1. **Choose the right location**:
   - Component tests → `components/[feature]/`
   - Hook tests → `hooks/`
   - Service tests → `services/`
   - Utility tests → `utils/`

2. **Name the file**: `[ComponentName].test.tsx` or `[functionName].test.ts`

3. **Structure the test**:
   ```typescript
   describe('ComponentName', () => {
     describe('feature or method', () => {
       it('does something specific', () => {
         // Test implementation
       });
     });
   });
   ```

4. **Add appropriate mocks** from `__mocks__/` directory

5. **Run the test** to ensure it passes

6. **Check coverage** to ensure adequate testing

## Continuous Integration

Tests run automatically on:
- Every commit (pre-commit hook)
- Every pull request
- Before deployment

CI will fail if:
- Any test fails
- Coverage drops below threshold
- Linting errors exist

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [jest-dom Matchers](https://github.com/testing-library/jest-dom)

## Support

For questions or issues with tests:
1. Check this README
2. Review existing tests for patterns
3. Consult the team
4. Update documentation if you find gaps

---

**Last Updated**: 2026-01-03
**Test Count**: 89+ tests across all modules
**Maintained By**: LexiFlow Development Team
