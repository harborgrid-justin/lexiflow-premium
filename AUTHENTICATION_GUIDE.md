# LexiFlow AI Legal Suite - Authentication Integration Guide

Complete guide for integrating and using the authentication system.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Setup](#setup)
3. [Authentication Flow](#authentication-flow)
4. [Components](#components)
5. [Hooks](#hooks)
6. [Route Protection](#route-protection)
7. [Best Practices](#best-practices)

## Quick Start

### 1. Initialize Auth System

In your main `App.tsx` or entry point:

```typescript
import { useEffect } from 'react';
import { initializeAuth } from './services/auth';

function App() {
  useEffect(() => {
    // Initialize authentication system on app startup
    initializeAuth();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Your routes */}
      </Routes>
    </BrowserRouter>
  );
}
```

### 2. Add Auth Routes

```typescript
import { authRoutes } from './router';

function AppRoutes() {
  return (
    <Routes>
      {/* Auth routes */}
      {authRoutes.map((route, index) => (
        <Route key={index} {...route} />
      ))}

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
```

### 3. Use Auth Hook

```typescript
import { useAuth } from './hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>Welcome, {user?.firstName}!</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <p>Please log in</p>
      )}
    </div>
  );
}
```

## Setup

### Install Dependencies

```bash
npm install axios jwt-decode
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled
npm install react-router-dom
```

### Environment Variables

Create `.env` file:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_GRAPHQL_URL=http://localhost:3000/graphql
VITE_WS_URL=ws://localhost:3000
```

## Authentication Flow

### Standard Login Flow

```
User → LoginPage → LoginForm → useLogin hook → authService.login()
  ↓
Check MFA required?
  ↓ NO                  ↓ YES
Store tokens      Show MFA page → Verify code → Store tokens
  ↓
Save session
  ↓
Redirect to dashboard
```

### Token Refresh Flow

```
API Request → Interceptor checks token expiry
  ↓
Token expired?
  ↓ YES              ↓ NO
Refresh token    Add to request
  ↓
Store new tokens
  ↓
Retry original request
```

### OAuth Flow

```
User clicks OAuth button → Redirect to provider
  ↓
User authorizes → Redirect back to callback
  ↓
Exchange code for tokens
  ↓
Store tokens and session
  ↓
Redirect to dashboard
```

## Components

### Login Form

```typescript
import { LoginFormEnhanced } from './components/auth';

function LoginPage() {
  const navigate = useNavigate();

  return (
    <LoginFormEnhanced
      onSuccess={() => navigate('/dashboard')}
      onMfaRequired={(mfaToken) => navigate('/auth/two-factor', { state: { mfaToken } })}
      onForgotPassword={() => navigate('/auth/forgot-password')}
      showRememberMe
    />
  );
}
```

### OAuth Buttons

```typescript
import { OAuthButtons } from './components/auth';

function LoginPage() {
  return (
    <OAuthButtons
      onSuccess={() => navigate('/dashboard')}
      onError={(error) => console.error(error)}
      variant="outlined"
      fullWidth
    />
  );
}
```

### Account Selector

```typescript
import { AccountSelector } from './components/auth';

function MultiAccountLogin() {
  const [open, setOpen] = useState(false);
  const [accounts, setAccounts] = useState([]);

  return (
    <AccountSelector
      open={open}
      accounts={accounts}
      onSelect={(account) => {
        // Switch to selected account
        switchAccount(account);
      }}
      onClose={() => setOpen(false)}
    />
  );
}
```

### Session Timeout Warning

```typescript
import { SessionTimeout } from './components/auth';

function App() {
  return (
    <>
      <SessionTimeout
        warningTime={5 * 60 * 1000} // 5 minutes before expiry
        onExtend={() => console.log('Session extended')}
        onTimeout={() => console.log('Session timed out')}
      />
      {/* Rest of app */}
    </>
  );
}
```

## Hooks

### useLogin

```typescript
import { useLogin } from './hooks/useLogin';

function LoginComponent() {
  const { login, loading, error, requiresMfa, clearError } = useLogin();

  const handleLogin = async () => {
    try {
      const response = await login(email, password, rememberMe);
      if (response.requiresMfa) {
        // Show MFA input
      }
    } catch (err) {
      // Error already set in hook
    }
  };
}
```

### useLogout

```typescript
import { useLogout } from './hooks/useLogout';

function LogoutButton() {
  const { logout, loading } = useLogout();

  return (
    <button onClick={logout} disabled={loading}>
      {loading ? 'Logging out...' : 'Logout'}
    </button>
  );
}
```

### useRegister

```typescript
import { useRegister } from './hooks/useRegister';

function RegisterForm() {
  const { register, loading, error, success } = useRegister();

  const handleRegister = async (data) => {
    try {
      await register(data);
      // Show success message
    } catch (err) {
      // Error handled by hook
    }
  };
}
```

### useResetPassword

```typescript
import { useResetPassword } from './hooks/useResetPassword';

function ForgotPassword() {
  const { requestReset, loading, success } = useResetPassword();

  const handleSubmit = async () => {
    try {
      await requestReset(email);
      // Show success message
    } catch (err) {
      // Error handled
    }
  };
}
```

### useTwoFactor

```typescript
import { useTwoFactor } from './hooks/useTwoFactor';

function MFASetup() {
  const { setupMfa, verifyMfa, qrCode, backupCodes } = useTwoFactor();

  const handleSetup = async () => {
    const setup = await setupMfa();
    // Display QR code: setup.qrCode
    // Display backup codes: setup.backupCodes
  };

  const handleVerify = async (code) => {
    await verifyMfa(mfaToken, code);
    // MFA verified and enabled
  };
}
```

### useOAuth

```typescript
import { useOAuth } from './hooks/useOAuth';

function OAuthLogin() {
  const { loginWithGoogle, loginWithMicrosoft, loading } = useOAuth();

  return (
    <>
      <button onClick={loginWithGoogle} disabled={loading}>
        Login with Google
      </button>
      <button onClick={loginWithMicrosoft} disabled={loading}>
        Login with Microsoft
      </button>
    </>
  );
}
```

### useSession

```typescript
import { useSession } from './hooks/useSession';

function SessionMonitor() {
  const {
    isActive,
    timeRemaining,
    warningShown,
    extendSession,
    refreshSession,
  } = useSession();

  useEffect(() => {
    if (warningShown && timeRemaining && timeRemaining < 5 * 60 * 1000) {
      // Show warning dialog
      showDialog('Your session is about to expire');
    }
  }, [warningShown, timeRemaining]);

  return (
    <div>
      {warningShown && (
        <button onClick={extendSession}>Extend Session</button>
      )}
    </div>
  );
}
```

## Route Protection

### Protected Routes

Require authentication:

```typescript
import { ProtectedRoute } from './router';

<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

### Role-Based Routes

Require specific role:

```typescript
import { RoleRoute } from './router';

<Route
  path="/admin"
  element={
    <RoleRoute role="FIRM_ADMIN">
      <AdminPanel />
    </RoleRoute>
  }
/>
```

### Permission-Based Routes

Require specific permission:

```typescript
import { PermissionRoute } from './router';

// Single permission
<Route
  path="/cases/create"
  element={
    <PermissionRoute permission="cases:create">
      <CreateCase />
    </PermissionRoute>
  }
/>

// Multiple permissions (any)
<Route
  path="/cases"
  element={
    <PermissionRoute permission={['cases:read', 'cases:write']}>
      <CasesList />
    </PermissionRoute>
  }
/>

// Multiple permissions (all required)
<Route
  path="/cases/manage"
  element={
    <PermissionRoute
      permission={['cases:read', 'cases:write', 'cases:delete']}
      requireAll
    >
      <ManageCases />
    </PermissionRoute>
  }
/>

// Show inline error instead of redirect
<Route
  path="/admin"
  element={
    <PermissionRoute permission="admin:*" showInlineError>
      <AdminPanel />
    </PermissionRoute>
  }
/>
```

### Public Routes

Redirect to dashboard if already authenticated:

```typescript
import { PublicRoute } from './router';

<Route
  path="/login"
  element={
    <PublicRoute>
      <LoginPage />
    </PublicRoute>
  }
/>
```

## Best Practices

### 1. Always Initialize on App Startup

```typescript
// In App.tsx
useEffect(() => {
  initializeAuth();
}, []);
```

### 2. Use Hooks Instead of Direct Service Calls

```typescript
// ✅ Good
const { login } = useLogin();
await login(email, password);

// ❌ Bad
import { login } from './services/api/authService';
await login({ email, password });
```

### 3. Handle All Auth States

```typescript
const { isAuthenticated, isLoading, user, error } = useAuth();

if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
if (!isAuthenticated) return <LoginPrompt />;

return <Dashboard user={user} />;
```

### 4. Protect Routes Properly

```typescript
// Always wrap protected pages
<ProtectedRoute>
  <PermissionRoute permission="cases:read">
    <CasesPage />
  </PermissionRoute>
</ProtectedRoute>
```

### 5. Monitor Session State

```typescript
// Show session warnings
const { warningShown, timeRemaining, extendSession } = useSession();

if (warningShown) {
  return (
    <Dialog>
      <DialogTitle>Session Expiring Soon</DialogTitle>
      <DialogContent>
        Your session will expire in {Math.floor(timeRemaining / 1000 / 60)} minutes
      </DialogContent>
      <DialogActions>
        <Button onClick={extendSession}>Stay Logged In</Button>
      </DialogActions>
    </Dialog>
  );
}
```

### 6. Handle MFA Flows

```typescript
const handleLogin = async () => {
  const response = await login(email, password);

  if (response.requiresMfa && response.mfaToken) {
    // Store MFA token and redirect
    navigate('/auth/two-factor', {
      state: { mfaToken: response.mfaToken }
    });
  } else {
    // Login complete
    navigate('/dashboard');
  }
};
```

### 7. Clear Sensitive Data

```typescript
// On logout
const handleLogout = () => {
  // Clear forms
  setPassword('');
  setMfaCode('');

  // Logout
  logout();
};
```

### 8. Validate OAuth State

```typescript
// OAuth callback
const { handleCallback } = useOAuth();

useEffect(() => {
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (code && state) {
    handleCallback(provider, code, state);
  }
}, []);
```

### 9. Check Permissions Before Actions

```typescript
import { permissionService } from './services/auth';

function CaseActions() {
  const canEdit = permissionService.checkPermission('cases:update');
  const canDelete = permissionService.checkPermission('cases:delete');

  return (
    <>
      {canEdit && <Button>Edit</Button>}
      {canDelete && <Button>Delete</Button>}
    </>
  );
}
```

### 10. Handle Errors Gracefully

```typescript
try {
  await login(email, password);
} catch (error) {
  if (error.message.includes('locked')) {
    navigate('/auth/account-locked', { state: { email } });
  } else if (error.message.includes('verify')) {
    navigate('/auth/verify-email', { state: { email } });
  } else {
    // Show generic error
    setError(error.message);
  }
}
```

## Testing

### Test Login Flow

```typescript
import { render, fireEvent, waitFor } from '@testing-library/react';
import { LoginPage } from './pages/auth/LoginPage';

test('login flow', async () => {
  const { getByLabelText, getByText } = render(<LoginPage />);

  fireEvent.change(getByLabelText('Email'), {
    target: { value: 'test@example.com' }
  });

  fireEvent.change(getByLabelText('Password'), {
    target: { value: 'password123' }
  });

  fireEvent.click(getByText('Sign In'));

  await waitFor(() => {
    expect(window.location.pathname).toBe('/dashboard');
  });
});
```

## Troubleshooting

### Token Not Refreshing

Check that interceptors are initialized:

```typescript
import { initializeAuth } from './services/auth';

useEffect(() => {
  initializeAuth();
}, []);
```

### Session Cleared Unexpectedly

Check for token/session sync issues:

```typescript
import { sessionService } from './services/auth';

const synced = sessionService.syncWithToken();
if (!synced) {
  console.error('Session/token mismatch');
}
```

### Permissions Not Working

Verify user has required permissions:

```typescript
import { permissionService } from './services/auth';

const user = sessionService.getSession();
const permissions = permissionService.getUserPermissions(user);
console.log('User permissions:', permissions);
```

For more details, see [Auth Services README](./services/auth/README.md)
