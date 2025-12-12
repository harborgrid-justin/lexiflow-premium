# LexiFlow Premium - Enterprise React Frontend Architecture

## Overview
This document outlines the comprehensive React frontend architecture created for LexiFlow Premium, an AI-powered legal practice management suite.

## Architecture Summary

### Technology Stack
- **React 18.2.0** - Modern React with concurrent features
- **TypeScript 5.8.2** - Type-safe development
- **Vite 6.2.0** - Fast build tool and dev server
- **React Router 7.10.1** - Client-side routing
- **Framer Motion 12.23.25** - Animations
- **Lucide React** - Icon library

---

## Directory Structure

```
/home/user/lexiflow-premium/
├── services/api/              # API Service Layer
│   ├── apiClient.ts          # Axios instance with interceptors
│   ├── restApi.ts            # REST API wrapper
│   ├── graphqlClient.ts      # GraphQL client
│   └── websocketClient.ts    # WebSocket client
│
├── context/                   # React Context Providers
│   ├── AppProvider.tsx       # Combined provider wrapper
│   ├── ThemeContext.tsx      # Light/dark mode (existing)
│   ├── ToastContext.tsx      # Toast notifications (existing)
│   ├── NotificationContext.tsx # High-level notifications
│   ├── CacheContext.tsx      # Client-side caching
│   ├── SyncContext.tsx       # Data synchronization (existing)
│   └── WindowContext.tsx     # Window management (existing)
│
├── hooks/                     # Custom React Hooks
│   ├── useApi.ts             # API fetching with cache
│   ├── useDebounce.ts        # Debounce hook (existing)
│   ├── usePagination.ts      # Pagination logic
│   ├── useWebSocket.ts       # WebSocket hook
│   ├── useLocalStorage.ts    # Synced localStorage
│   ├── useForm.ts            # Form management
│   └── [30+ other hooks]     # Domain-specific hooks
│
├── components/
│   ├── common/               # Reusable UI Components
│   │   ├── Button.tsx        # Button variants (existing)
│   │   ├── Input.tsx         # Enhanced input component
│   │   ├── LoadingSpinner.tsx # Loading states
│   │   ├── Toast.tsx         # Toast notification component
│   │   ├── Modal.tsx         # Modal dialog (existing)
│   │   ├── Table.tsx         # Data table (existing)
│   │   ├── Pagination.tsx    # Pagination component (existing)
│   │   ├── ErrorBoundary.tsx # Error boundary (existing)
│   │   └── [60+ other components]
│   │
│   └── layout/               # Layout Components
│       ├── MainLayout.tsx    # Main app shell
│       ├── Header.tsx        # Simple header
│       ├── Footer.tsx        # Footer
│       ├── Sidebar.tsx       # Navigation sidebar (existing)
│       ├── AppShell.tsx      # App container (existing)
│       └── AppHeader.tsx     # Complex header (existing)
│
├── pages/                     # Page Components (Route-level)
│   ├── Dashboard.tsx         # Dashboard page
│   ├── Cases.tsx             # Cases list
│   ├── CaseDetail.tsx        # Case detail
│   ├── Documents.tsx         # Documents
│   ├── Clients.tsx           # Clients
│   ├── Billing.tsx           # Billing
│   ├── Settings.tsx          # Settings
│   ├── Login.tsx             # Login page
│   ├── Unauthorized.tsx      # 403 page
│   └── NotFound.tsx          # 404 page
│
├── router/                    # Routing Configuration
│   └── routes.tsx            # Route definitions with lazy loading
│
├── App.tsx                    # Main app component (existing)
└── App-enhanced.tsx          # Enhanced app with new architecture
```

---

## Core Features

### 1. API Service Layer (`services/api/`)

#### **apiClient.ts**
- Axios instance with request/response interceptors
- Automatic token management and refresh
- Request correlation IDs for distributed tracing
- Performance monitoring
- Error handling (401, 403, 429, 500+)
- Network error detection
- File upload/download helpers

#### **restApi.ts**
- High-level REST API wrapper
- Organized by domain (auth, users, cases, documents, etc.)
- Type-safe API calls
- Pagination support
- Search functionality

#### **graphqlClient.ts**
- Lightweight GraphQL client (fetch-based)
- Query and mutation support
- Client-side caching with TTL
- Common queries and mutations included
- Subscription placeholders

#### **websocketClient.ts**
- WebSocket client with Socket.io-like API
- Auto-reconnect with exponential backoff
- Heartbeat/ping-pong
- Message queuing when disconnected
- Event-based architecture
- Strongly-typed event names

---

### 2. Context Providers (`context/`)

#### **AppProvider.tsx**
Combined provider that wraps all contexts in correct order:
```tsx
ErrorBoundary → Theme → Toast → Notification → Cache → Sync → Window
```

#### **NotificationContext.tsx**
- Persistent notifications
- Unread count tracking
- localStorage persistence
- Integration with ToastContext
- Action buttons support

#### **CacheContext.tsx**
- Client-side caching with TTL
- Tag-based invalidation
- LRU eviction policy
- Prefix-based invalidation
- Optional localStorage persistence
- Cache statistics

---

### 3. Custom Hooks (`hooks/`)

#### **useApi.ts**
- Comprehensive API request hook
- Loading, error, and data state
- Built-in caching
- Success/error callbacks
- Toast notifications
- Auto-fetch option
- Refresh functionality

#### **usePagination.ts**
- Complete pagination state management
- Navigation methods (next, prev, first, last, goToPage)
- Derived values (totalPages, hasNext, etc.)
- Page number generation with ellipsis

#### **useWebSocket.ts**
- React hook for WebSocket communication
- Auto-connect option
- Automatic listener cleanup
- Connection status tracking
- Type-safe event handling

#### **useLocalStorage.ts**
- Synced state with localStorage
- Cross-tab synchronization
- Type-safe serialization
- Custom serializers support

#### **useForm.ts**
- Complete form management
- Built-in validation rules
- Field-level validation
- Touch tracking
- Dirty state detection
- Submit handling with async support

---

### 4. UI Components (`components/common/`)

#### **Input.tsx** (Enhanced)
- Multiple variants (text, password, search)
- Label and error support
- Left/right icons
- Password visibility toggle
- Clear button
- Validation icons
- Character count for textarea
- Fully accessible (ARIA)

#### **LoadingSpinner.tsx**
- Multiple variants (spinner, dots, pulse, bars)
- Multiple sizes (xs, sm, md, lg, xl)
- Color variants
- Full-screen option
- Custom messages
- Convenience components (FullScreenLoader, InlineLoader)

#### **Toast.tsx**
- Standalone toast component
- Multiple variants (success, error, warning, info)
- Auto-dismiss with configurable duration
- Action buttons
- Close button
- Toast container for manual management

#### Other Components (existing)
- Button, Modal, Table, Pagination, ErrorBoundary, Badge, Card, Tabs, and 60+ more

---

### 5. Layout Components (`components/layout/`)

#### **MainLayout.tsx**
- Main application shell
- Responsive sidebar (desktop/mobile)
- Header and footer slots
- Fluid or container mode
- Mobile overlay

#### **Header.tsx**
- Simple header implementation
- Brand logo/name
- Global search
- Theme toggle
- Notifications dropdown
- User menu dropdown

#### **Footer.tsx**
- Copyright information
- Footer links
- Social media links
- Additional info section

---

### 6. Routing (`router/`)

#### **routes.tsx**
- Centralized route configuration
- Lazy loading for all routes
- Protected route wrapper
- Role-based access control
- Loading fallbacks
- Route definitions with TypeScript types

#### **ProtectedRoute.tsx**
- Authentication guard
- Role-based authorization
- Loading state handling
- Redirect configuration
- Custom fallback component

---

## Component Hierarchy

```
AppProvider
  └── ErrorBoundary
      └── ThemeProvider
          └── ToastProvider
              └── NotificationProvider
                  └── CacheProvider
                      └── SyncProvider
                          └── WindowProvider
                              └── BrowserRouter
                                  └── MainLayout
                                      ├── Header
                                      ├── Sidebar
                                      ├── Routes (lazy loaded)
                                      └── Footer
```

---

## API Integration Approach

### REST API
```typescript
import { restApi } from './services/api/restApi';

// Get all cases
const cases = await restApi.cases.getAll({ page: 1, limit: 20 });

// Get case by ID
const case = await restApi.cases.getById('123');

// Create new case
const newCase = await restApi.cases.create(caseData);
```

### GraphQL
```typescript
import { graphqlClient, queries } from './services/api/graphqlClient';

// Execute query
const data = await graphqlClient.query(
  queries.GET_CASES,
  { page: 1, limit: 20 },
  true // use cache
);
```

### WebSocket
```typescript
import { websocketClient, WS_EVENTS } from './services/api/websocketClient';

// Connect
await websocketClient.connect();

// Listen for events
websocketClient.on(WS_EVENTS.CASE_UPDATED, (data) => {
  console.log('Case updated:', data);
});

// Emit events
websocketClient.emit(WS_EVENTS.CASE_CREATED, caseData);
```

---

## Usage Examples

### Using Hooks Together

```typescript
import { useApi } from './hooks/useApi';
import { usePagination } from './hooks/usePagination';
import { restApi } from './services/api/restApi';

function CaseList() {
  const pagination = usePagination({ initialPage: 1, initialPageSize: 20 });

  const { data, loading, error, execute } = useApi(
    () => restApi.cases.getAll({
      page: pagination.currentPage,
      limit: pagination.pageSize
    }),
    {
      cacheKey: `cases-${pagination.currentPage}`,
      showErrorToast: true
    }
  );

  useEffect(() => {
    execute();
  }, [pagination.currentPage, pagination.pageSize]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <Table data={data?.items} />
      <Pagination {...pagination} />
    </div>
  );
}
```

### Form with Validation

```typescript
import { useForm } from './hooks/useForm';
import { Input } from './components/common/Input';
import { Button } from './components/common/Button';

function LoginForm() {
  const { values, errors, touched, handleChange, handleBlur, handleSubmit } = useForm({
    initialValues: { email: '', password: '' },
    validationSchema: {
      email: {
        required: 'Email is required',
        pattern: {
          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          message: 'Invalid email format'
        }
      },
      password: {
        required: 'Password is required',
        minLength: { value: 8, message: 'Password must be at least 8 characters' }
      }
    },
    onSubmit: async (values) => {
      await restApi.auth.login(values);
    }
  });

  return (
    <form onSubmit={handleSubmit}>
      <Input
        name="email"
        value={values.email}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.email ? errors.email : undefined}
        label="Email"
      />
      <Input
        type="password"
        name="password"
        value={values.password}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.password ? errors.password : undefined}
        label="Password"
      />
      <Button type="submit">Login</Button>
    </form>
  );
}
```

---

## Migration Guide

### From Current App.tsx to Enhanced Architecture

1. **Install missing dependencies** (if needed):
   ```bash
   npm install axios
   ```

2. **Use the new App-enhanced.tsx**:
   ```bash
   mv App.tsx App-original.tsx
   mv App-enhanced.tsx App.tsx
   ```

3. **Update imports** to use new API services:
   ```typescript
   // Old
   import { dataService } from './services/dataService';

   // New
   import { restApi } from './services/api/restApi';
   ```

4. **Replace context usage**:
   ```typescript
   // Old
   import { useToast } from './context/ToastContext';

   // New (still works, but prefer):
   import { useNotifications } from './context/NotificationContext';
   ```

---

## Performance Optimizations

1. **Code Splitting** - All routes are lazy loaded
2. **Component Memoization** - Use React.memo where appropriate
3. **Cache Management** - Client-side caching with TTL
4. **Request Deduplication** - Prevent duplicate API calls
5. **Virtual Lists** - For large datasets
6. **Debounced Search** - Reduce API calls
7. **Optimistic Updates** - Better UX for mutations

---

## Security Features

1. **Automatic token refresh** - No session interruption
2. **CSRF protection** - Via correlation IDs
3. **XSS prevention** - React's built-in protection
4. **Input validation** - Client and server-side
5. **Route guards** - Protected routes with auth
6. **Role-based access** - Authorization checks

---

## Accessibility (a11y)

- Semantic HTML elements
- ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader friendly
- Color contrast compliance (WCAG 2.1)

---

## Testing Strategy

### Unit Tests
- Test hooks with @testing-library/react-hooks
- Test utilities and helpers
- Test form validation logic

### Integration Tests
- Test API services with MSW (Mock Service Worker)
- Test context providers
- Test custom hooks with context

### E2E Tests
- Test critical user flows
- Test authentication
- Test form submissions

---

## Future Enhancements

1. **State Management** - Consider Zustand or Redux Toolkit
2. **Data Fetching** - Integrate React Query or SWR
3. **Form Library** - Consider React Hook Form
4. **Animation Library** - More Framer Motion usage
5. **Testing** - Vitest + Testing Library
6. **Storybook** - Component documentation
7. **i18n** - Internationalization support
8. **PWA** - Progressive Web App features

---

## Known Issues / TODO

- [ ] Implement actual authentication backend integration
- [ ] Add more comprehensive error messages
- [ ] Implement retry logic for failed requests
- [ ] Add request cancellation for concurrent requests
- [ ] Implement optimistic updates for mutations
- [ ] Add more unit tests
- [ ] Add Storybook for component documentation
- [ ] Implement comprehensive logging
- [ ] Add performance monitoring (Web Vitals)
- [ ] Implement feature flags

---

## Support & Documentation

For questions or issues:
1. Check this documentation
2. Review component source code
3. Check TypeScript types
4. Create GitHub issue

---

**Created by**: Agent 5 - PhD Frontend Architecture Specialist
**Date**: 2025-12-12
**Version**: 1.0.0
