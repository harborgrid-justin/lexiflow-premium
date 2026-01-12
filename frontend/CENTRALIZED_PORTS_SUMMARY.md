# ✅ Port & Timeout Centralization Complete

## 📍 Central Configuration

**Location:** [`src/config/ports.config.ts`](src/config/ports.config.ts)

## 🎯 What Was Centralized

### 1. **All Port Assignments**
- Frontend (Vite): **3400**
- Backend (NestJS): **3000**
- Backend Alt: **3001** (testing)
- Backend Legacy: **5000** (deprecated)
- Storybook: **6006**
- Cypress: **3400**

### 2. **Network Timeouts** (NEW!)
- API Request: 30s
- Health Check: 5s
- WebSocket Connection: 5s
- Backend Discovery: 3s
- Notification Default: 4s
- Notification Success: 3s
- Notification Error: 5s
- Session Timeout: 1 hour
- Session Warning: 5 min

## 📦 Exports Available

```typescript
import { PORTS, URLS, HOSTS, TIMEOUTS } from '@/config/ports.config';
// Or from barrel
import { PORTS, URLS, HOSTS, TIMEOUTS } from '@/config';
```

## ✅ Files Updated (15 total)

### Core Config Files
- ✅ [`src/config/ports.config.ts`](src/config/ports.config.ts) - Central source
- ✅ [`src/config/index.ts`](src/config/index.ts) - Barrel export with TIMEOUTS
- ✅ [`src/config/network/api.config.ts`](src/config/network/api.config.ts) - Uses `TIMEOUTS.API_REQUEST`
- ✅ [`src/config/network/websocket.config.ts`](src/config/network/websocket.config.ts) - Uses `TIMEOUTS.WS_CONNECTION`
- ✅ [`src/config/security/security.config.ts`](src/config/security/security.config.ts) - Uses `TIMEOUTS.SESSION_*`

### Service/Infrastructure Files
- ✅ [`src/services/infrastructure/api-client/config.ts`](src/services/infrastructure/api-client/config.ts) - Uses `TIMEOUTS.HEALTH_CHECK`
- ✅ [`src/services/integration/backendDiscovery.ts`](src/services/integration/backendDiscovery.ts) - Uses `TIMEOUTS.BACKEND_DISCOVERY`
- ✅ [`src/hooks/useNotificationWebSocket.ts`](src/hooks/useNotificationWebSocket.ts)
- ✅ [`src/contexts/repository/config.ts`](src/contexts/repository/config.ts)
- ✅ [`src/transition/src/platform/config/env.ts`](src/transition/src/platform/config/env.ts)

### Test Files
- ✅ [`__tests__/utils/mswHandlers.ts`](__tests__/utils/mswHandlers.ts) - Uses `PORTS.BACKEND_ALT`
- ✅ [`__tests__/services/infrastructure/socketService.test.ts`](__tests__/services/infrastructure/socketService.test.ts) - Uses `URLS` helpers

### Build/Dev Config
- ✅ [`vite.config.ts`](vite.config.ts)
- ✅ [`cypress.config.ts`](cypress.config.ts)
- ✅ [`.env.development`](.env.development) - Comments reference central config

## 🔄 Migration Pattern

### Before (Scattered)
```typescript
// Different files had hardcoded values
const API_URL = 'http://localhost:3000';
const timeout = 30000; // Magic number
const healthCheck = 5000; // Another magic number
```

### After (Centralized)
```typescript
import { URLS, PORTS, TIMEOUTS } from '@/config/ports.config';

const API_URL = URLS.backend();
const timeout = TIMEOUTS.API_REQUEST;
const healthCheck = TIMEOUTS.HEALTH_CHECK;
```

## 🎓 Usage Examples

### Building URLs
```typescript
import { URLS, HOSTS } from '@/config/ports.config';

// Simple usage
const api = URLS.api(); // http://localhost:3000/api

// Custom host
const prodApi = URLS.api('api.lexiflow.com');

// WebSocket
const ws = URLS.websocket(); // ws://localhost:3000
const wss = URLS.websocket(HOSTS.LOCAL, true); // wss://localhost:3000
```

### Using Timeouts
```typescript
import { TIMEOUTS } from '@/config/ports.config';

// API client
fetch('/api/data', { timeout: TIMEOUTS.API_REQUEST });

// Health checks
await checkHealth({ timeout: TIMEOUTS.HEALTH_CHECK });

// Notifications
showToast({ duration: TIMEOUTS.NOTIFICATION_SUCCESS });
```

## 📖 Documentation

See [`PORTS.md`](PORTS.md) for complete usage guide.

## 🧪 Testing

All test files updated to use centralized constants:
- MSW handlers use `PORTS.BACKEND_ALT` (3001)
- Socket tests use `URLS.backend()` and `URLS.websocket()`
- No more hardcoded localhost URLs in tests

## 🚀 Benefits

1. **Single Source of Truth** - One file to change all ports
2. **Type Safety** - TypeScript constants with `as const`
3. **Environment Aware** - Falls back to env vars when available
4. **Consistency** - Same values across all code
5. **Easy Testing** - Centralized test port configuration
6. **Better DX** - Import from one place
7. **Timeout Consistency** - Network timeouts centralized too!

## 🔍 Next Steps (Optional)

If you want to centralize more timeout values, these files have additional timeouts:
- Notification durations (toast auto-dismiss)
- Retry delays and intervals
- Polling intervals
- Cache TTLs
- Debounce/throttle values

Most of these are domain-specific and may be better left in their respective config files.
