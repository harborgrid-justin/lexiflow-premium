# Authentication System - Quick Reference

Quick reference guide for common authentication tasks.

## Setup

```typescript
// App.tsx
import { initializeAuth } from './services/auth';

useEffect(() => {
  initializeAuth();
}, []);
```

## Hooks

### useAuth
```typescript
const { isAuthenticated, user, logout } = useAuth();
```

### useLogin
```typescript
const { login, loading, error } = useLogin();
await login(email, password, rememberMe);
```

### useLogout
```typescript
const { logout } = useLogout();
await logout();
```

### useRegister
```typescript
const { register, loading, success } = useRegister();
await register({ email, password, firstName, lastName, acceptTerms: true });
```

### useResetPassword
```typescript
const { requestReset, resetPassword } = useResetPassword();
await requestReset(email); // Send reset email
await resetPassword(token, newPassword); // Reset with token
```

### useTwoFactor
```typescript
const { setupMfa, verifyMfa, qrCode, backupCodes } = useTwoFactor();
const setup = await setupMfa(); // Get QR code
await verifyMfa(mfaToken, code); // Verify code
```

### useOAuth
```typescript
const { loginWithGoogle, loginWithMicrosoft } = useOAuth();
await loginWithGoogle(); // Redirects to Google
```

### useSession
```typescript
const { isActive, timeRemaining, extendSession } = useSession();
```

## Services

### tokenService
```typescript
import { tokenService } from './services/auth';

tokenService.setAccessToken(token, rememberMe);
tokenService.getAccessToken();
tokenService.isTokenExpired();
tokenService.clearTokens();
```

### sessionService
```typescript
import { sessionService } from './services/auth';

sessionService.saveSession(user, rememberMe);
sessionService.getSession();
sessionService.isActive();
sessionService.clearSession();
```

### permissionService
```typescript
import { permissionService } from './services/auth';

permissionService.checkPermission('cases:create');
permissionService.checkAnyPermission(['cases:read', 'cases:write']);
permissionService.checkAllPermissions(['cases:read', 'cases:write']);
permissionService.checkRole('PARTNER');
permissionService.checkAccess('documents', 'delete');
```

## Components

### LoginFormEnhanced
```typescript
<LoginFormEnhanced
  onSuccess={() => navigate('/dashboard')}
  onMfaRequired={(mfaToken) => navigate('/auth/two-factor')}
  showRememberMe
/>
```

### OAuthButtons
```typescript
<OAuthButtons
  onSuccess={() => navigate('/dashboard')}
  onError={(error) => console.error(error)}
/>
```

### RememberMe
```typescript
<RememberMe
  checked={rememberMe}
  onChange={setRememberMe}
/>
```

### AccountSelector
```typescript
<AccountSelector
  open={open}
  accounts={accounts}
  onSelect={(account) => switchAccount(account)}
  onClose={() => setOpen(false)}
/>
```

## Route Protection

### ProtectedRoute
```typescript
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

### PublicRoute
```typescript
<PublicRoute>
  <LoginPage />
</PublicRoute>
```

### RoleRoute
```typescript
<RoleRoute role="FIRM_ADMIN">
  <AdminPanel />
</RoleRoute>
```

### PermissionRoute
```typescript
// Single permission
<PermissionRoute permission="cases:create">
  <CreateCase />
</PermissionRoute>

// Multiple permissions (OR)
<PermissionRoute permission={['cases:read', 'cases:write']}>
  <CasePage />
</PermissionRoute>

// Multiple permissions (AND)
<PermissionRoute permission={['cases:read', 'cases:write']} requireAll>
  <ManageCases />
</PermissionRoute>

// Inline error
<PermissionRoute permission="admin:*" showInlineError>
  <AdminPanel />
</PermissionRoute>
```

## Permissions

### Format
```
resource:action

Examples:
- cases:read
- cases:create
- cases:update
- cases:delete
- cases:* (all case operations)
- *:* (all operations)
```

### Check in Component
```typescript
import { permissionService } from './services/auth';

function MyComponent() {
  const canCreate = permissionService.checkPermission('cases:create');
  const canDelete = permissionService.checkPermission('cases:delete');

  return (
    <>
      {canCreate && <Button>Create</Button>}
      {canDelete && <Button>Delete</Button>}
    </>
  );
}
```

## Roles

### Hierarchy (High to Low)
1. SUPER_ADMIN (100)
2. SYSTEM_ADMIN (90)
3. FIRM_ADMIN (80)
4. SENIOR_PARTNER (70)
5. PARTNER (60)
6. SENIOR_ASSOCIATE (50)
7. ASSOCIATE (40)
8. PARALEGAL (30)
9. CLIENT_ADMIN (20)
10. CLIENT_USER (10)

## Events

### Listen for Auth Events
```typescript
// Logout
window.addEventListener('auth:logout', () => {
  console.log('User logged out');
});

// Session expired
window.addEventListener('auth:sessionExpired', () => {
  console.log('Session expired');
});

// Forbidden access
window.addEventListener('auth:forbidden', (event) => {
  console.log('Access denied:', event.detail);
});

// Token refreshed
window.addEventListener('auth:tokenRefreshed', () => {
  console.log('Token refreshed');
});
```

## Common Patterns

### Complete Login Flow
```typescript
const { login } = useLogin();

const handleLogin = async () => {
  try {
    const response = await login(email, password, rememberMe);

    if (response.requiresMfa) {
      navigate('/auth/two-factor', { state: { mfaToken: response.mfaToken } });
    } else {
      navigate('/dashboard');
    }
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

### Logout with Cleanup
```typescript
const { logout } = useLogout();

const handleLogout = async () => {
  // Clear sensitive data
  setPassword('');

  // Logout
  await logout();
};
```

### Check Auth State
```typescript
const { isAuthenticated, isLoading, user } = useAuth();

if (isLoading) return <LoadingSpinner />;
if (!isAuthenticated) return <LoginPrompt />;

return <Dashboard user={user} />;
```

### Session Warning
```typescript
const { warningShown, timeRemaining, extendSession } = useSession();

{warningShown && (
  <Dialog>
    Session expires in {Math.floor(timeRemaining / 1000 / 60)} min
    <Button onClick={extendSession}>Extend</Button>
  </Dialog>
)}
```

### Conditional Rendering
```typescript
const { user } = useAuth();
const { checkPermission } = permissionService;

return (
  <>
    {checkPermission('cases:create') && <CreateButton />}
    {checkPermission('cases:delete') && <DeleteButton />}
    {user.role === 'PARTNER' && <PartnerFeatures />}
  </>
);
```

## Error Handling

### Form Validation
```typescript
const [errors, setErrors] = useState({});

const validate = () => {
  const newErrors = {};

  if (!email) newErrors.email = 'Email required';
  if (!password) newErrors.password = 'Password required';

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validate()) return;

  try {
    await login(email, password);
  } catch (error) {
    setErrors({ general: error.message });
  }
};
```

### API Errors
```typescript
const { login, error, clearError } = useLogin();

{error && (
  <Alert severity="error" onClose={clearError}>
    {error}
  </Alert>
)}
```

## Debugging

### Check Token Status
```typescript
import { tokenService } from './services/auth';

const token = tokenService.getAccessToken();
console.log('Token:', token);
console.log('Expired:', tokenService.isTokenExpired());
console.log('Expiring soon:', tokenService.isTokenExpiringSoon());
console.log('Time until expiry:', tokenService.getTimeUntilExpiry());
```

### Check Session Status
```typescript
import { sessionService } from './services/auth';

const info = sessionService.getSessionInfo();
console.log('Session info:', info);
console.log('User:', sessionService.getSession());
console.log('Active:', sessionService.isActive());
```

### Check Permissions
```typescript
import { permissionService } from './services/auth';

const user = sessionService.getSession();
const permissions = permissionService.getUserPermissions(user);
console.log('All permissions:', permissions);
console.log('Can create cases:', permissionService.hasPermission(user, 'cases:create'));
```

## Environment Variables

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_GRAPHQL_URL=http://localhost:3000/graphql
VITE_WS_URL=ws://localhost:3000
```

## TypeScript Types

```typescript
import type {
  User,
  UserRole,
  AuthTokens,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from './types/auth';

import type {
  UserSession,
} from './services/auth';
```
