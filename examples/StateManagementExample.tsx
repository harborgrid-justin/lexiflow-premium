/**
 * State Management Examples
 * Comprehensive examples demonstrating all state management features
 */

import React, { useEffect, useState } from 'react';
import {
  useApp,
  useAuth,
  useTheme,
  useNotifications,
  useData,
  useSearch,
  useBreadcrumb,
  useLoading,
  usePermission,
  useAsync,
  useKeyPress,
  useMediaQuery,
  usePrevious,
} from '../hooks';

// ============================================================================
// Example 1: Authentication Flow
// ============================================================================

export function LoginExample() {
  const { login, isAuthenticated, user } = useAuth();
  const { addNotification } = useNotifications();
  const { startLoading, stopLoading } = useLoading();

  const handleLogin = async (email: string, password: string) => {
    const loadingId = startLoading({ message: 'Logging in...' });

    try {
      const response = await login(email, password);

      if (response.requiresMfa) {
        // Handle MFA flow
        return;
      }

      addNotification({
        type: 'success',
        title: 'Welcome!',
        message: `Logged in as ${user?.firstName}`,
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Login Failed',
        message: error.message,
      });
    } finally {
      stopLoading(loadingId);
    }
  };

  if (isAuthenticated) {
    return <div>Welcome, {user?.firstName}!</div>;
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.target as HTMLFormElement);
      handleLogin(
        formData.get('email') as string,
        formData.get('password') as string
      );
    }}>
      <input name="email" type="email" placeholder="Email" />
      <input name="password" type="password" placeholder="Password" />
      <button type="submit">Login</button>
    </form>
  );
}

// ============================================================================
// Example 2: Permission-Based UI
// ============================================================================

export function PermissionExample() {
  const {
    hasPermission,
    hasRole,
    isAdmin,
    canPerformAction,
  } = usePermission();

  return (
    <div>
      {/* Show admin panel only to admins */}
      {isAdmin && <AdminPanel />}

      {/* Show create button only to users with permission */}
      {hasPermission('cases:create') && (
        <button>Create New Case</button>
      )}

      {/* Show edit button based on resource ownership */}
      {canPerformAction('cases', 'update', { ownerId: 'user123' }) && (
        <button>Edit Case</button>
      )}

      {/* Check multiple permissions */}
      {hasRole('attorney') && (
        <div>
          <h3>Attorney Dashboard</h3>
          {hasPermission('billing:read') && <BillingWidget />}
          {hasPermission('documents:create') && <DocumentUpload />}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Example 3: Data Caching
// ============================================================================

export function DataCacheExample({ caseId }: { caseId: string }) {
  const { fetchWithCache, invalidateByTag } = useData();
  const { withLoading } = useLoading();

  const { data, loading, error, execute } = useAsync(
    async (id: string) => {
      return await fetchWithCache(
        `case-${id}`,
        async () => {
          const response = await fetch(`/api/cases/${id}`);
          return response.json();
        },
        {
          ttl: 5 * 60 * 1000, // 5 minutes
          tags: ['cases', `case-${id}`],
        }
      );
    }
  );

  const handleRefresh = async () => {
    await withLoading(
      async () => {
        invalidateByTag(`case-${caseId}`);
        await execute(caseId);
      },
      { message: 'Refreshing case data...' }
    );
  };

  useEffect(() => {
    execute(caseId);
  }, [caseId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return null;

  return (
    <div>
      <h2>{data.title}</h2>
      <p>{data.description}</p>
      <button onClick={handleRefresh}>Refresh</button>
    </div>
  );
}

// ============================================================================
// Example 4: Global Search
// ============================================================================

export function SearchExample() {
  const {
    query,
    setQuery,
    debouncedQuery,
    results,
    isSearching,
    scope,
    setScope,
    history,
    isOpen,
    openSearch,
    closeSearch,
  } = useSearch();

  const { execute } = useAsync(
    async (searchQuery: string) => {
      const response = await fetch(`/api/search?q=${searchQuery}&scope=${scope}`);
      return response.json();
    }
  );

  // Search when debounced query changes
  useEffect(() => {
    if (debouncedQuery) {
      execute(debouncedQuery);
    }
  }, [debouncedQuery]);

  // Keyboard shortcut to open search (Cmd+K or Ctrl+K)
  useKeyPress('k', {
    modifiers: { ctrl: true, meta: true },
    onKeyPress: openSearch,
  });

  // Close on Escape
  useKeyPress('Escape', {
    onKeyPress: closeSearch,
  });

  if (!isOpen) return null;

  return (
    <div className="search-modal">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search... (⌘K)"
        autoFocus
      />

      <select value={scope} onChange={(e) => setScope(e.target.value as any)}>
        <option value="all">All</option>
        <option value="cases">Cases</option>
        <option value="documents">Documents</option>
        <option value="clients">Clients</option>
      </select>

      {isSearching && <div>Searching...</div>}

      <div className="results">
        {results.map((result) => (
          <div key={result.id} className="result-item">
            <h4>{result.title}</h4>
            <p>{result.subtitle}</p>
          </div>
        ))}
      </div>

      <div className="history">
        <h4>Recent Searches</h4>
        {history.slice(0, 5).map((item) => (
          <div key={item.id} onClick={() => setQuery(item.query)}>
            {item.query} ({item.scope})
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Example 5: Breadcrumb Navigation
// ============================================================================

export function BreadcrumbExample() {
  const { breadcrumbs, generateFromPath, addBreadcrumb } = useBreadcrumb();

  useEffect(() => {
    // Auto-generate breadcrumbs from URL path
    generateFromPath(window.location.pathname, {
      'cases': 'Cases',
      'documents': 'Documents',
      'clients': 'Clients',
      'settings': 'Settings',
    });
  }, [window.location.pathname]);

  // Or manually add breadcrumbs
  const addManualBreadcrumb = () => {
    addBreadcrumb({
      label: 'Custom Page',
      path: '/custom',
      icon: 'page',
    });
  };

  return (
    <nav className="breadcrumbs">
      {breadcrumbs.map((crumb, index) => (
        <span key={crumb.id}>
          {index > 0 && <span className="separator">/</span>}
          {crumb.path ? (
            <a href={crumb.path}>{crumb.label}</a>
          ) : (
            <span>{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

// ============================================================================
// Example 6: Theme Switching
// ============================================================================

export function ThemeExample() {
  const { mode, toggleTheme, theme, isDark } = useTheme();
  const { updateSettings } = useApp();

  return (
    <div style={{
      background: theme.background,
      color: theme.text,
      padding: '20px',
    }}>
      <h2>Current Theme: {mode}</h2>
      <button onClick={toggleTheme}>
        Switch to {isDark ? 'Light' : 'Dark'} Mode
      </button>

      <div style={{
        background: theme.primary,
        color: 'white',
        padding: '10px',
        marginTop: '10px',
      }}>
        Primary Color Box
      </div>

      <div style={{
        background: theme.secondary,
        color: 'white',
        padding: '10px',
        marginTop: '10px',
      }}>
        Secondary Color Box
      </div>
    </div>
  );
}

// ============================================================================
// Example 7: Loading States
// ============================================================================

export function LoadingExample() {
  const { withLoading, isLoading, getPrimaryLoading } = useLoading();
  const { addNotification } = useNotifications();

  const handleOperation = async () => {
    try {
      await withLoading(
        async () => {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 2000));
          return { success: true };
        },
        {
          message: 'Processing your request...',
          type: 'progress',
          onError: (error) => {
            addNotification({
              type: 'error',
              title: 'Operation Failed',
              message: error.message,
            });
          },
        }
      );

      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Operation completed successfully',
      });
    } catch (error) {
      // Error already handled by withLoading
    }
  };

  const primaryLoading = getPrimaryLoading();

  return (
    <div>
      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner" />
          {primaryLoading?.message && <p>{primaryLoading.message}</p>}
          {primaryLoading?.progress !== undefined && (
            <progress value={primaryLoading.progress} max="100" />
          )}
        </div>
      )}

      <button onClick={handleOperation} disabled={isLoading}>
        Start Operation
      </button>
    </div>
  );
}

// ============================================================================
// Example 8: Responsive Design with Media Queries
// ============================================================================

export function ResponsiveExample() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
  const isDesktop = useMediaQuery('(min-width: 1025px)');

  return (
    <div>
      {isMobile && <MobileView />}
      {isTablet && <TabletView />}
      {isDesktop && <DesktopView />}
    </div>
  );
}

// ============================================================================
// Example 9: Form with Previous Value Tracking
// ============================================================================

export function FormExample() {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const previousFormData = usePrevious(formData);

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(previousFormData);

  return (
    <div>
      <input
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Name"
      />
      <input
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="Email"
      />

      {hasChanges && (
        <div className="unsaved-changes">
          You have unsaved changes
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Example 10: Notification System
// ============================================================================

export function NotificationExample() {
  const {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
  } = useNotifications();

  const showSuccess = () => {
    addNotification({
      type: 'success',
      title: 'Success!',
      message: 'Your operation was completed successfully',
      actionLabel: 'View Details',
      actionUrl: '/details',
    });
  };

  const showError = () => {
    addNotification({
      type: 'error',
      title: 'Error',
      message: 'Something went wrong',
    });
  };

  return (
    <div>
      <div className="notification-badge">
        Notifications ({unreadCount})
      </div>

      <button onClick={showSuccess}>Show Success</button>
      <button onClick={showError}>Show Error</button>
      <button onClick={markAllAsRead}>Mark All Read</button>
      <button onClick={clearAll}>Clear All</button>

      <div className="notifications-list">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={notification.read ? 'read' : 'unread'}
            onClick={() => markAsRead(notification.id)}
          >
            <h4>{notification.title}</h4>
            <p>{notification.message}</p>
            <small>{new Date(notification.timestamp).toLocaleString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Example 11: Keyboard Shortcuts
// ============================================================================

export function KeyboardShortcutsExample() {
  const savePressed = useKeyPress('s', {
    modifiers: { ctrl: true, meta: true }
  });

  const deletePressed = useKeyPress('Delete');
  const escapePressed = useKeyPress('Escape');

  useEffect(() => {
    if (savePressed) {
      console.log('Save shortcut pressed!');
      // Handle save
    }
  }, [savePressed]);

  return (
    <div>
      <p>Try these shortcuts:</p>
      <ul>
        <li>Ctrl/Cmd + S: Save</li>
        <li>Delete: Delete item</li>
        <li>Escape: Cancel</li>
      </ul>
    </div>
  );
}

// ============================================================================
// Example 12: Complete Integration
// ============================================================================

export function CompleteExample() {
  const { isAuthenticated } = useAuth();
  const { hasPermission } = usePermission();
  const { fetchWithCache } = useData();
  const { withLoading } = useLoading();
  const { addNotification } = useNotifications();
  const { isDark } = useTheme();

  const { data, loading, error, execute } = useAsync(
    async (caseId: string) => {
      return await fetchWithCache(
        `case-${caseId}`,
        async () => {
          const response = await fetch(`/api/cases/${caseId}`);
          if (!response.ok) throw new Error('Failed to fetch case');
          return response.json();
        },
        { ttl: 5 * 60 * 1000, tags: ['cases'] }
      );
    }
  );

  const handleUpdate = async (caseId: string, updates: any) => {
    try {
      await withLoading(
        async () => {
          const response = await fetch(`/api/cases/${caseId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
          });

          if (!response.ok) throw new Error('Update failed');

          await execute(caseId); // Refresh data
        },
        { message: 'Updating case...' }
      );

      addNotification({
        type: 'success',
        title: 'Updated',
        message: 'Case updated successfully',
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.message,
      });
    }
  };

  if (!isAuthenticated) {
    return <LoginExample />;
  }

  if (!hasPermission('cases:read')) {
    return <div>Access Denied</div>;
  }

  return (
    <div className={isDark ? 'dark-theme' : 'light-theme'}>
      <SearchExample />
      <BreadcrumbExample />
      <ThemeExample />
      {/* Rest of your app */}
    </div>
  );
}

// Placeholder components
function AdminPanel() { return <div>Admin Panel</div>; }
function BillingWidget() { return <div>Billing Widget</div>; }
function DocumentUpload() { return <div>Document Upload</div>; }
function MobileView() { return <div>Mobile View</div>; }
function TabletView() { return <div>Tablet View</div>; }
function DesktopView() { return <div>Desktop View</div>; }
