# LexiFlow State Management Architecture

Complete global state management system for the LexiFlow AI Legal Suite.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Context Providers](#context-providers)
4. [Custom Hooks](#custom-hooks)
5. [Usage Examples](#usage-examples)
6. [Best Practices](#best-practices)

## Overview

The LexiFlow state management system is built on React Context API with a modular, scalable architecture. It provides:

- **Centralized State Management**: Global state accessible throughout the app
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Performance Optimization**: Memoization and selective re-renders
- **Developer Experience**: Simple, intuitive hooks-based API
- **Modularity**: Independent contexts that can be used separately or together

## Architecture

### RootProvider

The `RootProvider` composes all context providers in the correct dependency order:

```tsx
import { RootProvider } from './context';

function App() {
  return (
    <RootProvider>
      <YourApp />
    </RootProvider>
  );
}
```

### Provider Hierarchy

```
ThemeProvider
└── AppProvider
    └── ToastProvider
        └── NotificationProvider
            └── DataProvider
                └── AuthProvider
                    └── PermissionProvider
                        └── LoadingProvider
                            └── SearchProvider
                                └── BreadcrumbProvider
                                    └── ModalProvider
                                        └── SidebarProvider
                                            └── WebSocketProvider
                                                └── CaseProvider
                                                    └── FilterProvider
                                                        └── SelectionProvider
```

## Context Providers

### 1. AppContext

Global application settings and state.

**Features:**
- User preferences (language, date format, timezone)
- Notification settings
- Display preferences (density, animations)
- Feature flags
- Online/offline status
- Performance metrics

**Usage:**
```tsx
import { useApp } from './hooks';

function Component() {
  const {
    settings,
    updateSettings,
    darkMode,
    toggleDarkMode,
    isOnline,
    isFeatureEnabled,
  } = useApp();

  return (
    <div>
      <button onClick={toggleDarkMode}>
        {darkMode ? 'Light Mode' : 'Dark Mode'}
      </button>
      {isFeatureEnabled('advanced_search') && <AdvancedSearch />}
    </div>
  );
}
```

### 2. AuthContext

Authentication and user management.

**Features:**
- User authentication (login, logout, register)
- Token management (access & refresh tokens)
- Password management
- Two-factor authentication
- OAuth integration (Google, Microsoft)
- Auto token refresh

**Usage:**
```tsx
import { useAuth } from './hooks';

function Component() {
  const {
    user,
    isAuthenticated,
    login,
    logout,
    enableTwoFactor,
  } = useAuth();

  if (!isAuthenticated) {
    return <LoginForm onLogin={login} />;
  }

  return (
    <div>
      <p>Welcome, {user.firstName}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### 3. ThemeContext

Theme management (light/dark mode).

**Features:**
- Theme switching
- Persistent theme preference
- System preference detection
- Dynamic theme tokens

**Usage:**
```tsx
import { useTheme } from './hooks';

function Component() {
  const { mode, toggleTheme, theme, isDark } = useTheme();

  return (
    <div style={{ background: theme.background }}>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}
```

### 4. NotificationContext

High-level notification system with persistence.

**Features:**
- Create notifications
- Mark as read/unread
- Notification history
- Integration with toast notifications
- Local storage persistence

**Usage:**
```tsx
import { useNotifications } from './hooks';

function Component() {
  const {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    showToast,
  } = useNotifications();

  const handleSuccess = () => {
    addNotification({
      type: 'success',
      title: 'Success!',
      message: 'Operation completed successfully',
    });
  };

  return (
    <div>
      <Badge count={unreadCount} />
      <button onClick={handleSuccess}>Complete Action</button>
    </div>
  );
}
```

### 5. DataContext

Global data caching with TTL and tag-based invalidation.

**Features:**
- Cache management with TTL
- Tag-based invalidation
- Bulk operations
- Async data fetching with cache
- Optional persistence to localStorage

**Usage:**
```tsx
import { useData } from './hooks';

function Component() {
  const { get, set, fetchWithCache, invalidateByTag } = useData();

  const loadUser = async (userId: string) => {
    return await fetchWithCache(
      `user-${userId}`,
      () => fetch(`/api/users/${userId}`).then(r => r.json()),
      { ttl: 5 * 60 * 1000, tags: ['users'] }
    );
  };

  const invalidateUsers = () => {
    invalidateByTag('users');
  };

  return <div>...</div>;
}
```

### 6. SearchContext

Global search state management.

**Features:**
- Search query with debouncing
- Search scope (all, cases, documents, etc.)
- Advanced filters
- Search history
- Recent searches
- Keyboard shortcuts (Cmd+K)

**Usage:**
```tsx
import { useSearch } from './hooks';

function Component() {
  const {
    query,
    debouncedQuery,
    setQuery,
    scope,
    setScope,
    results,
    history,
    isOpen,
    openSearch,
  } = useSearch();

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      <button onClick={openSearch}>Open Search (⌘K)</button>
    </div>
  );
}
```

### 7. BreadcrumbContext

Navigation breadcrumb management.

**Features:**
- Dynamic breadcrumb generation
- Auto-generate from path
- Custom breadcrumb actions
- Configurable separator and max items

**Usage:**
```tsx
import { useBreadcrumb } from './hooks';

function Component() {
  const { breadcrumbs, generateFromPath, addBreadcrumb } = useBreadcrumb();

  useEffect(() => {
    generateFromPath(location.pathname, {
      'cases': 'Cases',
      'documents': 'Documents',
    });
  }, [location.pathname]);

  return (
    <nav>
      {breadcrumbs.map((crumb) => (
        <span key={crumb.id}>{crumb.label}</span>
      ))}
    </nav>
  );
}
```

### 8. LoadingContext

Global loading state management.

**Features:**
- Multiple concurrent loading states
- Progress tracking
- Loading priorities
- Async operation wrapper
- Auto-cleanup of stale states

**Usage:**
```tsx
import { useLoading } from './hooks';

function Component() {
  const { startLoading, stopLoading, withLoading, isLoading } = useLoading();

  const handleSubmit = async () => {
    await withLoading(
      async () => {
        await api.submitForm(data);
      },
      { message: 'Submitting form...' }
    );
  };

  return (
    <div>
      {isLoading && <Spinner />}
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}
```

### 9. PermissionContext

Role-Based Access Control (RBAC) system.

**Features:**
- Permission checking
- Role management
- Resource-based permissions
- Role inheritance
- Feature access control

**Usage:**
```tsx
import { usePermission } from './hooks';

function Component() {
  const {
    hasPermission,
    hasRole,
    canPerformAction,
    isAdmin,
    canAccessFeature,
  } = usePermission();

  if (!hasPermission('cases:read')) {
    return <AccessDenied />;
  }

  return (
    <div>
      {hasPermission('cases:create') && (
        <button>Create Case</button>
      )}
      {isAdmin && <AdminPanel />}
    </div>
  );
}
```

## Custom Hooks

### Utility Hooks

#### usePrevious
Track the previous value of a state or prop.

```tsx
import { usePrevious } from './hooks';

function Component() {
  const [count, setCount] = useState(0);
  const previousCount = usePrevious(count);

  return <div>Previous: {previousCount}, Current: {count}</div>;
}
```

#### useKeyPress
Detect when a specific key is pressed.

```tsx
import { useKeyPress } from './hooks';

function Component() {
  const enterPressed = useKeyPress('Enter');
  const saveShortcut = useKeyPress('s', {
    modifiers: { ctrl: true, meta: true }
  });

  useEffect(() => {
    if (saveShortcut) {
      handleSave();
    }
  }, [saveShortcut]);

  return <div>...</div>;
}
```

#### useMediaQuery
React hook for CSS media queries.

```tsx
import { useMediaQuery, useIsMobile } from './hooks';

function Component() {
  const isMobile = useIsMobile();
  const isLarge = useMediaQuery('(min-width: 1024px)');

  return (
    <div>
      {isMobile ? <MobileView /> : <DesktopView />}
    </div>
  );
}
```

#### useAsync
Manage async operations with loading, error, and data states.

```tsx
import { useAsync } from './hooks';

function Component() {
  const { data, loading, error, execute } = useAsync(
    async (userId: string) => {
      const response = await fetch(`/api/users/${userId}`);
      return response.json();
    }
  );

  return (
    <div>
      {loading && <Spinner />}
      {error && <Error message={error.message} />}
      {data && <UserProfile user={data} />}
      <button onClick={() => execute('123')}>Load User</button>
    </div>
  );
}
```

### Context Hooks

All contexts have corresponding hooks:

- `useApp()` - App settings and state
- `useAuth()` - Authentication
- `useTheme()` - Theme management
- `useNotifications()` - Notifications
- `useData()` - Data cache
- `useSearch()` - Global search
- `useBreadcrumb()` - Breadcrumbs
- `useLoading()` - Loading states
- `usePermission()` - Permissions & RBAC

## Usage Examples

### Example 1: Protected Route with Permissions

```tsx
import { useAuth, usePermission } from './hooks';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, requiredPermission }) {
  const { isAuthenticated } = useAuth();
  const { hasPermission } = usePermission();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <AccessDenied />;
  }

  return children;
}
```

### Example 2: Data Fetching with Cache

```tsx
import { useAsync, useData } from './hooks';

function CaseDetail({ caseId }) {
  const { fetchWithCache } = useData();

  const { data, loading, error } = useAsync(
    async () => {
      return await fetchWithCache(
        `case-${caseId}`,
        () => api.getCase(caseId),
        {
          ttl: 5 * 60 * 1000,
          tags: ['cases'],
        }
      );
    },
    { immediate: true, dependencies: [caseId] }
  );

  if (loading) return <Spinner />;
  if (error) return <Error error={error} />;

  return <div>{data.title}</div>;
}
```

### Example 3: Global Search with Keyboard Shortcut

```tsx
import { useSearch, useKeyPress } from './hooks';

function SearchBar() {
  const {
    query,
    setQuery,
    results,
    isSearching,
    openSearch,
    closeSearch,
  } = useSearch();

  useKeyPress('k', {
    modifiers: { ctrl: true, meta: true },
    onKeyPress: openSearch,
  });

  useKeyPress('Escape', {
    onKeyPress: closeSearch,
  });

  return (
    <SearchModal>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search... (⌘K)"
      />
      {isSearching && <Spinner />}
      <SearchResults results={results} />
    </SearchModal>
  );
}
```

### Example 4: Form with Loading State

```tsx
import { useLoading, useNotifications } from './hooks';

function CreateCaseForm() {
  const { withLoading } = useLoading();
  const { addNotification } = useNotifications();

  const handleSubmit = async (data) => {
    try {
      await withLoading(
        async () => {
          await api.createCase(data);
        },
        { message: 'Creating case...' }
      );

      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Case created successfully',
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.message,
      });
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

## Best Practices

### 1. Use RootProvider at the App Root

Always wrap your app with `RootProvider` at the highest level:

```tsx
// main.tsx or App.tsx
import { RootProvider } from './context';

ReactDOM.render(
  <RootProvider>
    <App />
  </RootProvider>,
  document.getElementById('root')
);
```

### 2. Access Contexts via Hooks

Always use the provided hooks instead of directly accessing contexts:

```tsx
// Good ✅
import { useAuth } from './hooks';
const { user } = useAuth();

// Bad ❌
import { AuthContext } from './context/AuthContext';
const auth = useContext(AuthContext);
```

### 3. Handle Loading and Error States

Always handle loading and error states in async operations:

```tsx
const { data, loading, error } = useAsync(fetchData);

if (loading) return <Spinner />;
if (error) return <Error error={error} />;
if (!data) return null;

return <Display data={data} />;
```

### 4. Use Cache for Expensive Operations

Leverage the data cache for expensive API calls:

```tsx
const { fetchWithCache } = useData();

const data = await fetchWithCache(
  'expensive-data',
  () => api.getExpensiveData(),
  { ttl: 10 * 60 * 1000 } // 10 minutes
);
```

### 5. Implement Permission Checks

Always check permissions before rendering sensitive UI:

```tsx
const { hasPermission } = usePermission();

return (
  <div>
    {hasPermission('admin:panel') && <AdminPanel />}
    {hasPermission('cases:create') && <CreateButton />}
  </div>
);
```

### 6. Memoize Expensive Computations

Use React's memoization hooks with context values:

```tsx
const { cases } = useCase();

const filteredCases = useMemo(() => {
  return cases.filter(c => c.status === 'active');
}, [cases]);
```

### 7. Clean Up Side Effects

Always clean up subscriptions and listeners:

```tsx
useEffect(() => {
  const { subscribe, unsubscribe } = useWebSocket();

  subscribe('notifications', handleNotification);

  return () => {
    unsubscribe('notifications', handleNotification);
  };
}, []);
```

## Configuration

### Custom Configuration

You can customize providers through the `RootProvider`:

```tsx
<RootProvider
  config={{
    data: {
      defaultTtl: 10 * 60 * 1000, // 10 minutes
      maxSize: 500,
      enablePersistence: true,
    },
    search: {
      debounceDelay: 500,
      maxHistoryItems: 100,
    },
    permissions: {
      roleDefinitions: customRoles,
    },
  }}
>
  <App />
</RootProvider>
```

## TypeScript Support

All contexts and hooks are fully typed. Import types from the hooks:

```tsx
import { useAuth } from './hooks';
import type { User, AuthTokens } from './hooks';

const user: User = useAuth().user;
```

## Performance Considerations

1. **Selective Re-renders**: All contexts use `useMemo` to prevent unnecessary re-renders
2. **Code Splitting**: Import only the contexts you need
3. **Cache Management**: Use TTL and tag-based invalidation to manage cache size
4. **Debouncing**: Search queries are debounced by default
5. **Lazy Loading**: Consider lazy loading heavy contexts

## Troubleshooting

### Context Not Available

Make sure the component is wrapped in the appropriate provider:

```tsx
// Error: useAuth must be used within an AuthProvider
// Solution: Wrap with RootProvider or AuthProvider
<AuthProvider>
  <YourComponent />
</AuthProvider>
```

### Stale Data

Clear cache or reduce TTL:

```tsx
const { clear, invalidateByTag } = useData();

// Clear all cache
clear();

// Or invalidate specific tags
invalidateByTag('users');
```

### Performance Issues

- Check for unnecessary re-renders using React DevTools
- Memoize expensive computations
- Use selective context subscriptions
- Consider code splitting

## Migration Guide

If migrating from Redux or other state management:

1. Replace Redux store with `RootProvider`
2. Convert selectors to context hooks
3. Replace actions with context methods
4. Update middleware to use context providers
5. Test thoroughly with existing components

## Contributing

When adding new contexts:

1. Create context in `/context/NewContext.tsx`
2. Export hook in `/hooks/useNew.ts`
3. Add to `RootProvider` in correct order
4. Update `/context/index.ts`
5. Add TypeScript types to `/types/state.ts`
6. Document usage in this file
7. Add tests

## Support

For issues or questions:
- Check the troubleshooting section
- Review existing contexts for patterns
- Consult TypeScript types for API details
- Reach out to the development team
