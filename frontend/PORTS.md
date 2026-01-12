# Port Configuration Guide

All port configurations and network timeouts for the LexiFlow frontend are centralized in [src/config/ports.config.ts](src/config/ports.config.ts).

## 📋 Port Assignments

| Service | Port | Purpose |
|---------|------|---------|
| **Frontend** | `3400` | Vite dev server (React app) |
| **Backend** | `3000` | NestJS API server (current) |
| **Backend Legacy** | `5000` | Deprecated - old backend port |
| **Backend Alt** | `3001` | Alternative backend for SSR/testing |
| **Storybook** | `6006` | Component documentation |
| **Cypress** | `3400` | E2E tests (uses frontend port) |

## ⏱️ Centralized Timeouts

Network timeout values are also centralized in `TIMEOUTS`:

| Timeout | Value | Purpose |
|---------|-------|---------|
| **API_REQUEST** | `30000ms` | Default API request timeout |
| **HEALTH_CHECK** | `5000ms` | Backend health check timeout |
| **WS_CONNECTION** | `5000ms` | WebSocket connection timeout |
| **BACKEND_DISCOVERY** | `3000ms` | Service discovery timeout |
| **NOTIFICATION_DEFAULT** | `4000ms` | Default toast notification |
| **NOTIFICATION_SUCCESS** | `3000ms` | Success message duration |
| **NOTIFICATION_ERROR** | `5000ms` | Error message duration |
| **SESSION_TIMEOUT** | `3600000ms` | User session expiry (1 hour) |
| **SESSION_WARNING** | `300000ms` | Session expiry warning (5 min) |

## 🔧 Usage

### Import the Configuration

```typescript
import { PORTS, URLS, HOSTS, TIMEOUTS } from '@/config/ports.config';
// Or from barrel export
import { PORTS, URLS, HOSTS, TIMEOUTS } from '@/config';
```

### Access Specific Ports

```typescript
const frontendPort = PORTS.FRONTEND; // 3400
const backendPort = PORTS.BACKEND;   // 3000
const storybookPort = PORTS.STORYBOOK; // 6006
```

### Build URLs

```typescript
// Build frontend URL
const frontendUrl = URLS.frontend(); // http://localhost:3400
const frontendUrlAny = URLS.frontend(HOSTS.ANY); // http://0.0.0.0:3400

// Build backend URL
const backendUrl = URLS.backend(); // http://localhost:3000

// Build API URL with /api prefix
const apiUrl = URLS.api(); // http://localhost:3000/api

// Build WebSocket URL
const wsUrl = URLS.websocket(); // ws://localhost:3000
const wssUrl = URLS.websocket('localhost', true); // wss://localhost:3000

// Build Storybook URL
const storybookUrl = URLS.storybook(); // http://localhost:6006
```

### Use Centralized Timeouts

```typescript
import { TIMEOUTS } from '@/config/ports.config';

// API requests
const response = await fetch('/api/data', {
  timeout: TIMEOUTS.API_REQUEST // 30s
});

// Health checks
const health = await checkHealth({
  timeout: TIMEOUTS.HEALTH_CHECK // 5s
});

// WebSocket connections
const ws = new WebSocket(url, {
  handshakeTimeout: TIMEOUTS.WS_CONNECTION // 5s
});

// Notifications
showNotification({
  message: 'Success!',
  duration: TIMEOUTS.NOTIFICATION_SUCCESS // 3s
});

// Session management
const sessionConfig = {
  timeout: TIMEOUTS.SESSION_TIMEOUT, // 1 hour
  warningThreshold: TIMEOUTS.SESSION_WARNING // 5 min
};
```

### Environment-Aware Helpers

```typescript
import { getBackendUrl, getApiUrl, getWebSocketUrl } from '@/config/ports.config';

// Automatically uses environment variables or defaults
const backendUrl = getBackendUrl(); // Uses VITE_API_BASE_URL or default
const apiUrl = getApiUrl(); // Uses VITE_API_URL or default
const wsUrl = getWebSocketUrl(); // Uses VITE_WS_URL or default
```

## 📁 Files Updated

The following files have been updated to use the centralized configuration:

- ✅ [vite.config.ts](vite.config.ts) - Vite dev server and proxy
- ✅ [cypress.config.ts](cypress.config.ts) - E2E testing
- ✅ [.env.development](.env.development) - Development environment
- ✅ [.env.example](.env.example) - Example environment variables
- ✅ [package.json](package.json) - Storybook dev command
- ✅ [src/services/infrastructure/api-client/config.ts](src/services/infrastructure/api-client/config.ts)
- ✅ [src/hooks/useNotificationWebSocket.ts](src/hooks/useNotificationWebSocket.ts)
- ✅ [src/contexts/repository/config.ts](src/contexts/repository/config.ts)
- ✅ [src/config/network/api.config.ts](src/config/network/api.config.ts)
- ✅ [src/transition/src/platform/config/env.ts](src/transition/src/platform/config/env.ts)

## 🎯 Best Practices

### ✅ DO

```typescript
// Use centralized constants
import { PORTS, URLS } from '@/config';
const url = URLS.backend();

// Use environment-aware helpers
import { getBackendUrl } from '@/config';
const apiUrl = getBackendUrl();
```

### ❌ DON'T

```typescript
// Hard-code ports
const url = 'http://localhost:3000'; // Bad!

// Magic numbers
const port = 3400; // Bad!
```

## 🔄 Changing Ports

To change a port:

1. Update [src/config/ports.config.ts](src/config/ports.config.ts)
2. Update environment variables in `.env` files if needed
3. That's it! All references automatically update

## 🌍 Environment Variables

The configuration respects these environment variables:

- `VITE_API_BASE_URL` - Backend base URL (e.g., `http://localhost:3000`)
- `VITE_API_URL` - Full API URL with prefix (e.g., `http://localhost:3000/api`)
- `VITE_WS_URL` - WebSocket URL (e.g., `ws://localhost:3000`)

When these are not set, the configuration falls back to the centralized defaults from `ports.config.ts`.

## 📦 Type Safety

All port constants are `as const`, providing type safety and autocomplete:

```typescript
// TypeScript knows the exact value
const port: 3400 = PORTS.FRONTEND; // ✅
const port: 9999 = PORTS.FRONTEND; // ❌ Type error!
```

## 🚀 Benefits

1. **Single Source of Truth** - All ports defined in one place
2. **Type Safety** - TypeScript ensures correct usage
3. **DRY Principle** - No duplicated port numbers
4. **Easy Migration** - Change once, update everywhere
5. **Environment Aware** - Respects env vars with sensible defaults
6. **Documentation** - Clear documentation of all port assignments
