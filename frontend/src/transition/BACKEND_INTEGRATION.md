# Backend API Integration - Complete Setup Guide

## Overview

The frontend is now fully integrated with the NestJS backend using **enterprise cookie-based authentication**. No JWT tokens are exposed to the frontend.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser                                  │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │              Frontend (React SSR/Edge)                     │ │
│  │                                                             │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │ AuthProvider (identity resolution)                   │ │ │
│  │  │  - Fetches /users/me                                │ │ │
│  │  │  - No token handling                                │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  │                          ↓                                 │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │ API Gateways (domain wrappers)                       │ │ │
│  │  │  - userGateway, billingGateway, etc.               │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  │                          ↓                                 │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │ HTTP Transport (authTransport.ts)                    │ │ │
│  │  │  - credentials: 'include' (automatic)              │ │ │
│  │  │  - Handles 401/403                                  │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                   │
│                   Cookie: sessionId=abc123                       │
│                   (httpOnly, Secure, SameSite)                   │
└───────────────────────────────────────┬───────────────────────────┘
                                        │
                                        │ HTTP + Cookie
                                        ↓
┌─────────────────────────────────────────────────────────────────┐
│                    NestJS Backend API                            │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ AuthGuard (validates cookie)                              │ │
│  │  - Reads httpOnly cookie                                 │ │
│  │  - Validates session                                     │ │
│  │  - Returns 401 if invalid                                │ │
│  └───────────────────────────────────────────────────────────┘ │
│                          ↓                                       │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ RolesGuard (checks permissions)                           │ │
│  │  - Validates user roles                                  │ │
│  │  - Returns 403 if insufficient                           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                          ↓                                       │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Controllers (business logic)                              │ │
│  │  - /users, /cases, /invoices, etc.                      │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## What Was Built

### 1. HTTP Transport Infrastructure

**Location**: `services/data/client/`

- **httpClient.ts** - Base fetch wrapper with automatic `credentials: 'include'`
- **authTransport.ts** - Authenticated requests, handles 401/403
- **config.ts** - Backend URL configuration from environment

**Key Feature**: Frontend NEVER constructs auth headers or handles tokens.

### 2. API Gateways

**Location**: `services/data/api/gateways/`

Domain-specific wrappers that encapsulate business logic:

- **userGateway.ts** - User management, identity resolution
- **billingGateway.ts** - Invoices, payments, metrics
- **reportingGateway.ts** - Analytics, reports, charts
- **adminGateway.ts** - System settings, audit logs, user management

**Pattern**: Features consume gateways, not raw HTTP clients.

### 3. OpenAPI Client Generation

**Location**: `services/data/api/generated/`

- Auto-generate TypeScript types from NestJS Swagger
- Run `npm run codegen` after backend API changes
- Types stay in sync with backend

### 4. Updated AuthProvider

**Location**: `services/identity/AuthProvider.tsx`

**New behavior**:

- Calls `userGateway.getCurrentIdentity()` → backend `/users/me`
- Backend validates session via httpOnly cookie
- No token parsing or refresh logic in frontend
- Listens for `auth:unauthorized` and `auth:forbidden` events

### 5. Updated SessionProvider

**Location**: `services/session/SessionProvider.tsx`

**New behavior**:

- Tracks session presence (cookie exists and valid)
- Periodically checks session health
- No token storage or refresh logic
- Backend owns session lifecycle

### 6. Environment Configuration

**Location**: `.env.local`

```env
VITE_BACKEND_API_URL=http://localhost:3000
VITE_API_VERSION=/api
VITE_DEBUG=true
```

## How to Use

### 1. Start Backend

```bash
cd /workspaces/lexiflow-premium/backend
npm run start:dev
```

### 2. Generate API Client (if backend Swagger is available)

```bash
cd /workspaces/lexiflow-premium/frontend/src/transition
npm run codegen
```

This fetches the OpenAPI spec from `http://localhost:3000/api-json` and generates TypeScript clients.

### 3. Start Frontend

```bash
cd /workspaces/lexiflow-premium/frontend/src/transition
npm run dev
```

### 4. Use Gateways in Components

```typescript
import { userGateway } from "@/services/data/api/gateways/userGateway";
import { billingGateway } from "@/services/data/api/gateways/billingGateway";

// In a component
const identity = await userGateway.getCurrentIdentity();
const invoices = await billingGateway.getAllInvoices();
```

### 5. Use AuthProvider in UI

```typescript
import { useAuth } from '@/services/identity/AuthProvider';

function MyComponent() {
  const { user, roles, permissions, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPrompt />;
  }

  return <div>Welcome, {user.name}!</div>;
}
```

## Authentication Flow

### Login Flow

1. User submits login form
2. Frontend calls backend `/auth/login` with credentials
3. Backend validates credentials
4. Backend sets httpOnly cookie with session ID
5. Backend returns user data
6. Frontend AuthProvider stores user identity
7. All subsequent requests automatically include cookie

### Protected Request Flow

1. Component calls gateway method (e.g., `billingGateway.getAllInvoices()`)
2. Gateway calls `authGet('/invoices')`
3. authTransport includes `credentials: 'include'`
4. Backend AuthGuard validates cookie
5. If valid: returns data
6. If invalid (401): authTransport fires `auth:unauthorized` event
7. AuthProvider clears identity

### Logout Flow

1. Frontend calls backend `/auth/logout`
2. Backend clears session cookie
3. Frontend AuthProvider clears identity
4. User redirected to login

## Security Considerations

### ✅ What Frontend Does

- Includes cookies automatically (`credentials: 'include'`)
- Displays user identity (read-only)
- Checks roles/permissions for UI rendering
- Handles 401/403 responses gracefully

### ❌ What Frontend Does NOT Do

- Parse or validate JWTs
- Store tokens in localStorage/sessionStorage
- Construct Authorization headers
- Refresh tokens
- Enforce permissions (backend enforces)

### Backend Responsibilities

- Issue httpOnly cookies
- Validate sessions on every request
- Rotate session tokens
- Enforce RBAC (AuthGuard, RolesGuard)
- Handle token refresh automatically

## Production Checklist

- [ ] Set `VITE_BACKEND_API_URL` to production API URL
- [ ] Ensure backend sets `httpOnly`, `Secure`, `SameSite` cookies
- [ ] Enable CSRF protection in backend
- [ ] Configure CORS properly (allow credentials)
- [ ] Set up proper session timeout policies
- [ ] Enable backend rate limiting
- [ ] Add API request logging/monitoring
- [ ] Test SSR with real backend
- [ ] Test Edge runtime with real backend
- [ ] Configure CDN to proxy `/api` to backend

## Troubleshooting

### "401 Unauthorized" on all requests

- Check backend is running on correct URL
- Verify cookies are being set (check browser DevTools → Application → Cookies)
- Ensure CORS allows credentials: `credentials: true` in NestJS

### "Failed to fetch"

- Backend URL misconfigured (check `.env.local`)
- Backend not running
- CORS blocking request

### "Cookies not sent with request"

- `credentials: 'include'` not set (should be automatic in httpClient)
- Cookie domain mismatch (frontend/backend on different domains)
- SameSite policy too restrictive

### "Identity not loading"

- Backend `/users/me` endpoint doesn't exist
- Backend AuthGuard not applied to `/users/me`
- Session cookie invalid or expired

## Next Steps

1. **Implement backend `/users/me` endpoint** if it doesn't exist
2. **Set up backend authentication** with cookie-based sessions
3. **Configure CORS** to allow credentials from frontend origin
4. **Test full auth flow** (login → authenticated requests → logout)
5. **Generate real API clients** once Swagger is complete
6. **Replace placeholder types** in gateways with generated types
7. **Add error boundaries** for API errors
8. **Implement loading states** for async operations

## Enterprise Benefits

✅ **Security**: No tokens exposed to JavaScript
✅ **Simplicity**: Frontend never handles auth logic
✅ **Maintainability**: Single source of truth (backend)
✅ **SSR/Edge Compatible**: Cookies work everywhere
✅ **Type Safety**: Generated clients from Swagger
✅ **Separation of Concerns**: Transport, gateway, feature layers
✅ **Backend-First**: Backend enforces all security

---

**Frontend**: Identity consumer
**Backend**: Security authority
**Transport**: Secure by default
