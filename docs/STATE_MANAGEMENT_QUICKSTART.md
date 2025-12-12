# State Management Quick Start Guide

Get up and running with LexiFlow's state management system in 5 minutes.

## Step 1: Wrap Your App with RootProvider

```tsx
// main.tsx or App.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RootProvider } from './context';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RootProvider>
      <App />
    </RootProvider>
  </React.StrictMode>
);
```

That's it! All state management is now available throughout your app.

## Step 2: Use Hooks in Your Components

### Authentication

```tsx
import { useAuth } from './hooks';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <button onClick={() => login('email', 'password')}>Login</button>;
  }

  return (
    <div>
      <p>Welcome, {user.firstName}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Permissions

```tsx
import { usePermission } from './hooks';

function MyComponent() {
  const { hasPermission, isAdmin } = usePermission();

  return (
    <div>
      {hasPermission('cases:create') && <button>Create Case</button>}
      {isAdmin && <AdminPanel />}
    </div>
  );
}
```

### Loading States

```tsx
import { useLoading } from './hooks';

function MyComponent() {
  const { withLoading } = useLoading();

  const handleSubmit = async (data) => {
    await withLoading(
      async () => {
        await api.submit(data);
      },
      { message: 'Submitting...' }
    );
  };

  return <button onClick={handleSubmit}>Submit</button>;
}
```

### Notifications

```tsx
import { useNotifications } from './hooks';

function MyComponent() {
  const { addNotification } = useNotifications();

  const showSuccess = () => {
    addNotification({
      type: 'success',
      title: 'Success!',
      message: 'Operation completed',
    });
  };

  return <button onClick={showSuccess}>Do Something</button>;
}
```

### Data Caching

```tsx
import { useData, useAsync } from './hooks';

function MyComponent({ userId }) {
  const { fetchWithCache } = useData();

  const { data, loading } = useAsync(
    async () => {
      return await fetchWithCache(
        `user-${userId}`,
        () => api.getUser(userId),
        { ttl: 5 * 60 * 1000 } // Cache for 5 minutes
      );
    },
    { immediate: true, dependencies: [userId] }
  );

  if (loading) return <div>Loading...</div>;
  return <div>{data.name}</div>;
}
```

### Global Search

```tsx
import { useSearch } from './hooks';

function SearchBar() {
  const { query, setQuery, results, openSearch } = useSearch();

  // Cmd+K opens search automatically
  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search... (⌘K)"
      />
      {results.map(result => (
        <div key={result.id}>{result.title}</div>
      ))}
    </div>
  );
}
```

### Theme

```tsx
import { useTheme } from './hooks';

function ThemeToggle() {
  const { mode, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme}>
      {mode === 'dark' ? '🌙' : '☀️'}
    </button>
  );
}
```

### Breadcrumbs

```tsx
import { useBreadcrumb } from './hooks';
import { useEffect } from 'react';

function MyPage() {
  const { breadcrumbs, generateFromPath } = useBreadcrumb();

  useEffect(() => {
    generateFromPath('/cases/123/documents');
  }, []);

  return (
    <nav>
      {breadcrumbs.map(crumb => (
        <span key={crumb.id}>{crumb.label}</span>
      ))}
    </nav>
  );
}
```

## Step 3: Common Patterns

### Protected Routes

```tsx
import { useAuth, usePermission } from './hooks';

function ProtectedRoute({ children, permission }) {
  const { isAuthenticated } = useAuth();
  const { hasPermission } = usePermission();

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (permission && !hasPermission(permission)) return <AccessDenied />;

  return children;
}

// Usage
<ProtectedRoute permission="cases:read">
  <CasesPage />
</ProtectedRoute>
```

### Async Operations with Error Handling

```tsx
import { useAsync, useNotifications } from './hooks';

function MyComponent() {
  const { addNotification } = useNotifications();

  const { execute, loading, error } = useAsync(
    async (data) => {
      const response = await fetch('/api/endpoint', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response.json();
    },
    {
      onSuccess: () => {
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Operation completed',
        });
      },
      onError: (error) => {
        addNotification({
          type: 'error',
          title: 'Error',
          message: error.message,
        });
      },
    }
  );

  return (
    <button onClick={() => execute(formData)} disabled={loading}>
      {loading ? 'Loading...' : 'Submit'}
    </button>
  );
}
```

### Responsive Design

```tsx
import { useMediaQuery } from './hooks';

function MyComponent() {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div>
      {isMobile ? <MobileView /> : <DesktopView />}
    </div>
  );
}
```

### Keyboard Shortcuts

```tsx
import { useKeyPress } from './hooks';

function MyComponent() {
  useKeyPress('s', {
    modifiers: { ctrl: true, meta: true },
    onKeyPress: () => {
      handleSave();
    },
  });

  return <div>Press Ctrl/Cmd+S to save</div>;
}
```

## Available Hooks

Quick reference of all available hooks:

| Hook | Purpose |
|------|---------|
| `useAuth()` | Authentication & user management |
| `usePermission()` | RBAC permission checking |
| `useTheme()` | Light/dark theme management |
| `useNotifications()` | Toast notifications & alerts |
| `useData()` | Global data caching |
| `useSearch()` | Global search state |
| `useBreadcrumb()` | Navigation breadcrumbs |
| `useLoading()` | Loading state management |
| `useApp()` | App settings & preferences |
| `useAsync()` | Async operation management |
| `useKeyPress()` | Keyboard shortcut detection |
| `useMediaQuery()` | Responsive design queries |
| `usePrevious()` | Track previous state values |

## Configuration

Customize providers via RootProvider:

```tsx
<RootProvider
  config={{
    data: {
      defaultTtl: 10 * 60 * 1000, // 10 minutes
      enablePersistence: true,
    },
    search: {
      debounceDelay: 500,
    },
  }}
>
  <App />
</RootProvider>
```

## Next Steps

- Read the [full documentation](./STATE_MANAGEMENT.md)
- Check out [examples](../examples/StateManagementExample.tsx)
- Explore [type definitions](../types/state.ts)

## Common Issues

**Hook throws "must be used within provider" error**
- Make sure RootProvider wraps your component
- Check that you're importing from the correct path

**Cache not persisting**
- Enable persistence in DataProvider config
- Check localStorage is available

**Permissions not working**
- Verify user is authenticated
- Check role definitions are loaded
- Ensure user has required permissions

## Support

For more help:
- See [troubleshooting guide](./STATE_MANAGEMENT.md#troubleshooting)
- Check [examples](../examples/StateManagementExample.tsx)
- Review TypeScript types for API details
