# LexiFlow Enterprise Authentication System

## Overview

Enterprise-grade authentication and security system for LexiFlow Premium with multi-factor authentication, role-based access control, session management, and comprehensive audit logging.

## Features

### 1. Multi-Factor Authentication (MFA)
- TOTP-based two-factor authentication
- QR code setup with authenticator apps
- Backup codes for account recovery
- MFA enforcement per user
- Graceful MFA verification flow during login

**Components:**
- `MFASetup` - Setup wizard for enabling MFA
- `MFAVerification` - Login verification component

**Usage:**
```tsx
import { MFASetup } from '@/components/auth';

function SecuritySettings() {
  return <MFASetup onComplete={() => console.log('MFA enabled')} />;
}
```

### 2. Session Management
- 30-minute session timeout with activity tracking
- 5-minute warning before session expiry
- Automatic token refresh every 15 minutes
- Session extension capability
- Visual timeout warning modal

**Components:**
- `SessionTimeoutWarning` - Displays session expiry warning

**Configuration:**
```typescript
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const SESSION_WARNING_TIME = 5 * 60 * 1000; // 5 minutes
const TOKEN_REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes
```

### 3. Role-Based Access Control (RBAC)
- Four user roles: `admin`, `attorney`, `paralegal`, `staff`
- Fine-grained permission system
- Role hierarchy support
- Protected route components
- Permission guards for UI elements

**Roles:**
- `admin` - Full system access
- `attorney` - Legal professional access
- `paralegal` - Support staff access
- `staff` - Basic access

**Components:**
- `ProtectedRoute` - Requires authentication
- `AdminRoute` - Requires admin role
- `AttorneyRoute` - Requires attorney or admin role
- `StaffRoute` - Requires staff, attorney, or admin role
- `PermissionGuard` - Fine-grained permission checking

**Usage:**
```tsx
import { ProtectedRoute, AdminRoute, PermissionGuard } from '@/components/guards';

// Require authentication
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>

// Require admin role
<AdminRoute>
  <AdminPanel />
</AdminRoute>

// Require specific permission
<PermissionGuard permissions="cases:write">
  <EditButton />
</PermissionGuard>

// Require multiple permissions (any)
<PermissionGuard permissions={['cases:write', 'cases:admin']}>
  <EditButton />
</PermissionGuard>

// Require all permissions
<PermissionGuard permissions={['cases:write', 'billing:read']} requireAll>
  <BillableActivity />
</PermissionGuard>
```

### 4. SSO/SAML Integration
- Support for Azure AD, Okta, Google Workspace
- SAML 2.0 and OAuth/OIDC protocols
- Configurable SSO providers
- Graceful fallback to standard login

**Components:**
- `SSOLoginOptions` - Displays available SSO providers

**Configuration:**
```typescript
const ssoProviders: SSOProvider[] = [
  {
    id: 'azure-ad',
    name: 'Microsoft Azure AD',
    type: 'saml',
    enabled: true,
    loginUrl: '/auth/sso/azure-ad',
  },
];
```

### 5. Audit Logging
- Comprehensive authentication event logging
- Client-side event tracking
- Event types: login, logout, mfa_enabled, mfa_disabled, password_changed, token_refresh, session_expired, access_denied
- Stored in localStorage (production should use server-side logging)
- Automatic log rotation (keeps last 100 events)

**Event Types:**
- `login` - User logged in
- `logout` - User logged out
- `mfa_enabled` - MFA enabled for account
- `mfa_disabled` - MFA disabled for account
- `password_changed` - Password changed
- `token_refresh` - Authentication token refreshed
- `session_expired` - Session expired
- `access_denied` - Access denied to resource

**Usage:**
```tsx
import { useAuthActions } from '@/contexts/auth/AuthProvider';

function MyComponent() {
  const { logAuthEvent } = useAuthActions();

  const handleSensitiveAction = () => {
    logAuthEvent({
      type: 'access_denied',
      timestamp: new Date(),
      metadata: { resource: 'sensitive-data' },
    });
  };
}
```

**Retrieve Audit Logs:**
```tsx
import { getAuditLogs } from '@/contexts/auth/AuthProvider';

const logs = getAuditLogs();
console.log('Recent auth events:', logs);
```

### 6. Password Policy Enforcement
- Minimum length requirement (default: 12 characters)
- Uppercase letter requirement
- Lowercase letter requirement
- Number requirement
- Special character requirement
- Password expiry (default: 90 days)
- Password reuse prevention (default: 5 previous passwords)

**Components:**
- `PasswordStrengthIndicator` - Real-time password strength feedback

**Configuration:**
```typescript
const passwordPolicy: PasswordPolicy = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  expiryDays: 90,
  preventReuse: 5,
};
```

**Usage:**
```tsx
import { PasswordStrengthIndicator } from '@/components/auth';

function PasswordForm() {
  const [password, setPassword] = useState('');

  return (
    <div>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <PasswordStrengthIndicator password={password} showRequirements />
    </div>
  );
}
```

### 7. Account Lockout Handling
- Automatic account lockout after failed login attempts
- Admin-initiated lockouts
- Security-triggered lockouts
- Clear user messaging
- Contact information for support

**Components:**
- `AccountLockedMessage` - User-friendly lockout screen

**Usage:**
```tsx
import { AccountLockedMessage } from '@/components/auth';

<AccountLockedMessage
  reason="failed_attempts"
  unlockTime={new Date(Date.now() + 30 * 60 * 1000)}
/>
```

## Authentication Context API

### State
```typescript
interface AuthStateValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  session: SessionInfo | null;
  requiresMFA: boolean;
  passwordPolicy: PasswordPolicy;
}
```

### Actions
```typescript
interface AuthActionsValue {
  login: (email: string, password: string) => Promise<boolean>;
  verifyMFA: (code: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  hasPermission: (permission: string) => boolean;
  hasRole: (...roles: AuthUser['role'][]) => boolean;
  enableMFA: () => Promise<MFASetup>;
  disableMFA: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  loginWithSSO: (providerId: string) => Promise<void>;
  logAuthEvent: (event: AuthEvent) => void;
  extendSession: () => Promise<void>;
}
```

### Hooks

**useAuthState()**
Access authentication state only (optimized for performance):
```tsx
import { useAuthState } from '@/contexts/auth/AuthProvider';

function MyComponent() {
  const { user, isLoading, isAuthenticated } = useAuthState();
  // Component re-renders only when state changes
}
```

**useAuthActions()**
Access authentication actions only (never triggers re-renders):
```tsx
import { useAuthActions } from '@/contexts/auth/AuthProvider';

function MyComponent() {
  const { login, logout } = useAuthActions();
  // Component never re-renders from auth changes
}
```

**useAuth()**
Access both state and actions (use sparingly):
```tsx
import { useAuth } from '@/contexts/auth/AuthProvider';

function MyComponent() {
  const { user, login, logout } = useAuth();
  // Component re-renders when state changes
}
```

## File Structure

```
frontend/src/
├── contexts/auth/
│   ├── authTypes.ts              # TypeScript type definitions
│   ├── authContexts.ts           # React context definitions
│   ├── AuthProvider.tsx          # Main auth provider with enterprise features
│   ├── authUtils.ts              # Server-side auth utilities
│   ├── authHooks.ts              # Custom hooks
│   └── README.md                 # This file
├── components/auth/
│   ├── MFASetup.tsx              # MFA setup wizard
│   ├── MFAVerification.tsx       # MFA login verification
│   ├── SessionTimeoutWarning.tsx # Session timeout modal
│   ├── PasswordStrengthIndicator.tsx # Password strength meter
│   ├── SSOLoginOptions.tsx       # SSO provider buttons
│   ├── AccountLockedMessage.tsx  # Account lockout screen
│   └── index.ts                  # Exports
├── components/guards/
│   ├── ProtectedRoute.tsx        # Route protection components
│   ├── PermissionGuard.tsx       # Permission-based rendering
│   └── index.ts                  # Exports
└── routes/auth/
    ├── login.tsx                 # Basic login page
    ├── login-enterprise.tsx      # Enhanced login with MFA & SSO
    ├── change-password.tsx       # Password change page
    ├── forgot-password.tsx       # Password reset request
    └── reset-password.tsx        # Password reset completion
```

## Integration Guide

### 1. Setup AuthProvider

Wrap your app with the AuthProvider:

```tsx
// app/root.tsx or main entry point
import { AuthProvider } from '@/contexts/auth/AuthProvider';
import { SessionTimeoutWarning } from '@/components/auth';

function App() {
  return (
    <AuthProvider>
      <SessionTimeoutWarning />
      {/* Your app routes */}
    </AuthProvider>
  );
}
```

### 2. Protect Routes

```tsx
import { ProtectedRoute, AdminRoute } from '@/components/guards';

// Require authentication
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />

// Require admin role
<Route path="/admin" element={
  <AdminRoute>
    <AdminPanel />
  </AdminRoute>
} />
```

### 3. Check Permissions in Components

```tsx
import { PermissionGuard } from '@/components/guards';

function CaseDetail() {
  return (
    <div>
      <h1>Case Details</h1>

      {/* Show edit button only to users with cases:write permission */}
      <PermissionGuard permissions="cases:write">
        <EditButton />
      </PermissionGuard>
    </div>
  );
}
```

### 4. Use Authentication in Code

```tsx
import { useAuthState, useAuthActions } from '@/contexts/auth/AuthProvider';

function MyComponent() {
  const { user, isAuthenticated } = useAuthState();
  const { logout, hasPermission } = useAuthActions();

  const canEdit = hasPermission('cases:write');

  return (
    <div>
      {isAuthenticated && <p>Welcome, {user?.name}!</p>}
      {canEdit && <button>Edit</button>}
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## Security Best Practices

1. **Always use HTTPS** in production
2. **Store tokens securely** - currently using localStorage, consider httpOnly cookies for production
3. **Implement server-side validation** - client-side guards are not sufficient
4. **Use audit logging** - monitor authentication events
5. **Enforce strong passwords** - use the password policy
6. **Enable MFA** for sensitive accounts
7. **Implement rate limiting** on the backend
8. **Regular security audits** of authentication flows
9. **Rotate secrets** regularly
10. **Monitor failed login attempts**

## API Integration

The auth system expects these backend endpoints:

- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Token refresh
- `GET /auth/profile` - Get current user
- `POST /auth/enable-mfa` - Enable MFA
- `POST /auth/verify-mfa` - Verify MFA code
- `POST /auth/disable-mfa` - Disable MFA
- `POST /auth/change-password` - Change password
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Complete password reset
- `GET /auth/sso/:provider` - SSO login redirect

## Troubleshooting

### Session keeps expiring
- Check `SESSION_TIMEOUT` constant
- Ensure token refresh is working
- Verify backend token expiry matches frontend expectations

### MFA not working
- Verify `/auth/enable-mfa` and `/auth/verify-mfa` endpoints
- Check that QR code is properly generated
- Ensure TOTP secret is stored securely

### Permission guards not working
- Verify user permissions are loaded correctly
- Check permission strings match exactly
- Ensure user has required role

### SSO redirect fails
- Verify SSO provider configuration
- Check SAML/OAuth callback URLs
- Ensure provider is enabled

## Future Enhancements

- [ ] Biometric authentication support
- [ ] Hardware token support (YubiKey, etc.)
- [ ] Risk-based authentication
- [ ] Passwordless authentication (WebAuthn)
- [ ] Session management across devices
- [ ] OAuth 2.0 client support
- [ ] Advanced audit log analytics
- [ ] Behavioral analytics
- [ ] Adaptive authentication policies
- [ ] Integration with identity providers (LDAP, Active Directory)

## License

Copyright 2025 LexiFlow. All rights reserved.
