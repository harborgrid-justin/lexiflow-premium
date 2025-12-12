# Authentication Services

Complete authentication and authorization system for LexiFlow AI Legal Suite.

## Overview

This authentication system provides:

- **JWT-based authentication** with automatic token refresh
- **OAuth integration** (Google, Microsoft)
- **Multi-factor authentication (MFA)** support
- **Role-based access control (RBAC)**
- **Permission-based authorization**
- **Session management** with activity tracking
- **Secure token storage** with Remember Me functionality
- **Automatic session timeout** handling

## Architecture

```
services/auth/
├── tokenService.ts         # JWT token management
├── sessionService.ts       # User session state
├── permissionService.ts    # Authorization & permissions
└── authInterceptor.ts      # Axios interceptors for token refresh
```

## Token Service

Manages JWT tokens with automatic expiry detection.

```typescript
import { tokenService } from './services/auth';

// Store tokens
tokenService.setAccessToken(accessToken, rememberMe);
tokenService.setRefreshToken(refreshToken);

// Get tokens
const token = tokenService.getAccessToken();

// Check token status
if (tokenService.isTokenExpired()) {
  // Token needs refresh
}

// Clear tokens
tokenService.clearTokens();
```

## Session Service

Manages user session state and activity tracking.

```typescript
import { sessionService } from './services/auth';

// Save session
sessionService.saveSession(user, rememberMe);

// Get current user
const user = sessionService.getSession();

// Check session status
if (sessionService.isActive()) {
  // Session is valid
}

// Update activity (extends session)
sessionService.updateActivity();

// Clear session
sessionService.clearSession();
```

## Permission Service

Role-based and permission-based access control.

```typescript
import { permissionService } from './services/auth';

// Check permissions
if (permissionService.checkPermission('cases:create')) {
  // User can create cases
}

// Check multiple permissions (OR)
if (permissionService.checkAnyPermission(['cases:read', 'cases:write'])) {
  // User has at least one permission
}

// Check multiple permissions (AND)
if (permissionService.checkAllPermissions(['cases:read', 'cases:write'])) {
  // User has all permissions
}

// Check role
if (permissionService.checkRole('PARTNER')) {
  // User is a partner
}

// Check resource access
if (permissionService.checkAccess('documents', 'delete')) {
  // User can delete documents
}
```

### Role Hierarchy

```
SUPER_ADMIN (100)
  ↓
SYSTEM_ADMIN (90)
  ↓
FIRM_ADMIN (80)
  ↓
SENIOR_PARTNER (70)
  ↓
PARTNER (60)
  ↓
SENIOR_ASSOCIATE (50)
  ↓
ASSOCIATE (40)
  ↓
PARALEGAL (30)
  ↓
CLIENT_ADMIN (20)
  ↓
CLIENT_USER (10)
```

### Permission Format

Permissions follow the format: `resource:action`

Examples:
- `cases:read` - Read cases
- `cases:create` - Create cases
- `cases:*` - All case operations
- `*:*` - All operations (super admin)

## Auth Interceptor

Automatic token refresh with request queuing.

```typescript
import { initializeAuthInterceptors } from './services/auth';
import apiClient from './services/api/apiClient';

// Initialize on app startup
initializeAuthInterceptors(apiClient);
```

### Features

- **Automatic token refresh** when token expires
- **Request queuing** during refresh to prevent race conditions
- **Proactive refresh** before token expires
- **Session activity tracking** on each request
- **Graceful error handling** with automatic logout

## Usage Examples

### Complete Login Flow

```typescript
import { useLogin } from './hooks/useLogin';

function LoginPage() {
  const { login, loading, error } = useLogin();

  const handleLogin = async () => {
    try {
      const response = await login(email, password, rememberMe);

      if (response.requiresMfa) {
        // Redirect to MFA page
        navigate('/auth/two-factor');
      } else {
        // Login successful
        navigate('/dashboard');
      }
    } catch (err) {
      // Error is handled by the hook
    }
  };
}
```

### Protected Routes

```typescript
import { ProtectedRoute, PermissionRoute } from './router';

// Require authentication
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>

// Require specific permission
<PermissionRoute permission="cases:create">
  <CreateCase />
</PermissionRoute>

// Require multiple permissions (any)
<PermissionRoute permission={['cases:read', 'cases:write']}>
  <CasePage />
</PermissionRoute>

// Require all permissions
<PermissionRoute permission={['cases:read', 'cases:write']} requireAll>
  <CasePage />
</PermissionRoute>

// Show inline error instead of redirecting
<PermissionRoute permission="admin:*" showInlineError>
  <AdminPanel />
</PermissionRoute>
```

### Session Monitoring

```typescript
import { useSession } from './hooks/useSession';

function App() {
  const {
    isActive,
    timeRemaining,
    warningShown,
    extendSession
  } = useSession();

  useEffect(() => {
    if (warningShown && timeRemaining && timeRemaining < 5 * 60 * 1000) {
      // Show session expiring warning
      showWarningDialog();
    }
  }, [warningShown, timeRemaining]);
}
```

### OAuth Login

```typescript
import { useOAuth } from './hooks/useOAuth';

function LoginPage() {
  const { loginWithGoogle, loginWithMicrosoft, loading } = useOAuth();

  return (
    <>
      <button onClick={loginWithGoogle}>
        Login with Google
      </button>
      <button onClick={loginWithMicrosoft}>
        Login with Microsoft
      </button>
    </>
  );
}
```

### MFA Setup

```typescript
import { useTwoFactor } from './hooks/useTwoFactor';

function MFASetup() {
  const { setupMfa, verifyMfa, qrCode, backupCodes } = useTwoFactor();

  const handleSetup = async () => {
    const setup = await setupMfa();
    // Show QR code to user
    setQRCode(setup.qrCode);
  };

  const handleVerify = async (code: string) => {
    await verifyMfa(mfaToken, code);
    // MFA enabled
  };
}
```

## Security Features

### Token Storage

- **Access tokens**: Stored in sessionStorage (or localStorage if "Remember Me")
- **Refresh tokens**: Always in localStorage for persistence
- **Automatic cleanup**: Tokens cleared on logout or expiry

### Session Security

- **Activity tracking**: Last activity timestamp updated on each request
- **Automatic timeout**: Session expires after 30 minutes of inactivity
- **Token rotation**: Refresh tokens are rotated on use
- **CSRF protection**: OAuth state validation

### Permission Checks

- **Server-side enforcement**: Always validate on backend
- **Client-side optimization**: Reduce unnecessary API calls
- **Hierarchical roles**: Higher roles inherit lower permissions
- **Wildcard permissions**: Support for `resource:*` patterns

## Events

The auth system dispatches custom events:

```typescript
// Listen for logout
window.addEventListener('auth:logout', () => {
  // Handle logout
});

// Listen for session expiry
window.addEventListener('auth:sessionExpired', () => {
  // Show session expired message
});

// Listen for forbidden access
window.addEventListener('auth:forbidden', (event) => {
  // Handle 403 error
  console.log(event.detail.message);
});

// Listen for token refresh
window.addEventListener('auth:tokenRefreshed', () => {
  // Token was refreshed
});
```

## Best Practices

1. **Always use hooks** instead of directly calling services
2. **Initialize interceptors** on app startup
3. **Handle MFA flows** properly in login
4. **Check permissions** before showing UI elements
5. **Monitor session state** for timeout warnings
6. **Clear sensitive data** on logout
7. **Validate tokens** on app initialization
8. **Use ProtectedRoute** for all authenticated pages
9. **Use PermissionRoute** for role-specific features
10. **Handle OAuth callbacks** with state validation

## Troubleshooting

### Token Refresh Issues

```typescript
import { manualRefreshToken } from './services/auth';

// Force token refresh
try {
  await manualRefreshToken();
} catch (error) {
  // Refresh failed, logout user
}
```

### Session Sync Issues

```typescript
import { sessionService } from './services/auth';

// Sync session with token
if (!sessionService.syncWithToken()) {
  // Session/token mismatch, logout
  sessionService.clearSession();
}
```

### Permission Debugging

```typescript
import { permissionService } from './services/auth';

// Get all user permissions
const permissions = permissionService.getUserPermissions(user);
console.log('User permissions:', permissions);

// Check specific permission with details
const hasPermission = permissionService.hasPermission(user, 'cases:create');
console.log('Can create cases:', hasPermission);
```
