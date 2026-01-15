# Enterprise React Services Architecture

**Status**: ✅ IMPLEMENTED
**Version**: 1.0
**Date**: 2026-01-14

## Overview

LexiFlow frontend now implements the **Enterprise React Services Architecture Standard**, providing a clean separation between:

- **Services** = Capabilities (browser APIs, side effects, integrations)
- **Frontend APIs** = Knowledge (data fetching, domain truth)
- **Contexts** = State (React state management)
- **Hooks** = Adapters (React-friendly service interfaces)

## Architecture Principles

### The Golden Rule

```
REACT SERVICES MAY DO THINGS
COMPONENTS MAY ONLY DESCRIBE THINGS
```

### Dependency Flow (One-Way)

```
SERVER
│
▼
FRONTEND API        (data, domain truth)
│
▼
REACT SERVICE       ←────────── CAPABILITY LAYER
│
├── browser APIs
├── side effects
├── integrations
├── scheduling
│
▼
LOADERS / ACTIONS
│
▼
CONTEXT (DOMAIN STATE)
│
▼
VIEWS / UI
```

### Critical Distinction

| Concern          | Frontend API | React Service  |
| ---------------- | ------------ | -------------- |
| Talks to backend | YES          | NO             |
| Talks to browser | NO           | YES            |
| Has side effects | NO           | YES            |
| Domain aware     | YES          | NO             |
| React imports    | NO           | OPTIONAL       |
| Stateful         | NO           | EPHEMERAL ONLY |

## Service Lifecycle

All services implement the formal lifecycle model:

```typescript
CREATE
│
├── configure()  // Setup with config
│
├── start()      // Begin operation
│
├── use()        // Active usage
│
├── stop()       // Halt operation
│
└── dispose()    // Cleanup resources
```

### Base Service

All services extend `BaseService`:

```typescript
import { BaseService } from "../core/BaseService";

export class MyService extends BaseService {
  constructor() {
    super("MyService");
  }

  override async configure(): Promise<void> {
    // Setup logic
  }

  override async start(): Promise<void> {
    await super.start();
    // Start logic
  }

  override async stop(): Promise<void> {
    // Stop logic
    await super.stop();
  }

  myCapability() {
    this.ensureStarted(); // Enforces lifecycle
    // Implementation
  }
}
```

## Implemented Services

### 1. StorageService

**Role**: Browser storage capability wrapper
**Location**: `services/storage/StorageService.ts`

```typescript
import { useStorage } from "@/hooks/useStorage";

function MyComponent() {
  const storage = useStorage();

  storage.set("key", "value");
  const value = storage.get("key");
}
```

### 2. TelemetryService

**Role**: Event tracking and logging
**Location**: `services/telemetry/TelemetryService.ts`

```typescript
import { useTelemetry } from "@/hooks/useTelemetry";

function MyComponent() {
  const telemetry = useTelemetry();

  const handleClick = () => {
    telemetry.track({
      event: "button_clicked",
      properties: { buttonId: "submit" },
    });
  };
}
```

### 3. CryptoService

**Role**: Web Crypto API wrapper
**Location**: `services/crypto/CryptoService.ts`

```typescript
import { useCrypto } from "@/hooks/useCrypto";

function MyComponent() {
  const crypto = useCrypto();

  const handleEncrypt = async () => {
    const result = await crypto.encrypt("sensitive data", "key");
    console.log(result.ciphertext);
  };
}
```

### 4. ClipboardService

**Role**: Clipboard operations
**Location**: `services/clipboard/ClipboardService.ts`

```typescript
import { useClipboard } from "@/hooks/useClipboard";

function MyComponent() {
  const { copy, paste, isSupported } = useClipboard();

  const handleCopy = async () => {
    const success = await copy("text to copy");
    if (success) {
      // Show success message
    }
  };
}
```

### 5. SessionService

**Role**: Session lifecycle and cross-tab coordination
**Location**: `services/session/SessionService.ts`

```typescript
import {
  useSession,
  useSessionVisibility,
  useBeforeUnload,
} from "@/hooks/useSession";

function MyComponent() {
  const { setItem, getItem } = useSession();
  const isVisible = useSessionVisibility();

  useBeforeUnload(() => {
    // Save state before unload
  });

  setItem("sessionKey", "value");
}
```

### 6. FeatureFlagService

**Role**: Environment-aware feature detection
**Location**: `services/featureFlags/FeatureFlagService.ts`

```typescript
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

function MyComponent() {
  const isNewUIEnabled = useFeatureFlag('new_ui');

  if (isNewUIEnabled) {
    return <NewUI />;
  }
  return <OldUI />;
}
```

## Service Registry

Central registry manages all service instances:

```typescript
import { ServiceRegistry } from "@/services";

// Get service
const telemetry = ServiceRegistry.get<TelemetryService>("TelemetryService");

// Check if registered
const exists = ServiceRegistry.has("TelemetryService");

// List all services
const services = ServiceRegistry.list();

// Health check
const health = ServiceRegistry.getHealthStatus();
```

## Application Bootstrap

Services are initialized at application startup:

```typescript
import {
  registerServices,
  initializeServices,
  shutdownServices,
} from "@/services";

// In main.tsx or App.tsx
async function initializeApp() {
  await registerServices(); // Register all services
  await initializeServices(); // Start all services
}

// On cleanup
async function cleanup() {
  await shutdownServices(); // Stop all services
}
```

## Hook Adapters

**Critical Pattern**: Hooks adapt services, never vice versa

```typescript
// hooks/useMyService.ts
import { useCallback } from "react";
import { useService } from "./useService";
import type { MyService } from "../services/my/MyService";

export function useMyService() {
  const myService = useService<MyService>("MyService");

  const doSomething = useCallback(async () => {
    return await myService.doSomething();
  }, [myService]);

  return { doSomething };
}
```

## Governance Rules

### ✅ DO

- Services are stateless or have ephemeral state only
- Services are injectable and replaceable
- Services are testable in isolation
- Services expose minimal interfaces
- Services handle technical errors
- Services are environment-aware

### ❌ DON'T

- Services managing domain state
- Services calling fetch (use Frontend APIs)
- Hooks hiding service side effects
- Components instantiating services
- Services importing React Router
- Services importing UI components
- Services importing contexts

## Failure Modes (Anti-Patterns)

```typescript
// ❌ WRONG: Service owns domain state
class BadService {
  private cases: Case[] = [];

  addCase(case: Case) {
    this.cases.push(case); // Domain state in service!
  }
}

// ✅ CORRECT: Service provides capability
class GoodService {
  save(key: string, data: string) {
    localStorage.setItem(key, data); // Pure capability
  }
}

// ❌ WRONG: Service does data fetching
class BadService {
  async getCases() {
    return fetch('/api/cases'); // Domain knowledge!
  }
}

// ✅ CORRECT: Use Frontend API
import { api } from '@/api';
const cases = await api.cases.getAll();

// ❌ WRONG: Component creates service
function MyComponent() {
  const service = new MyService(); // Lifecycle violation!
}

// ✅ CORRECT: Use hook adapter
function MyComponent() {
  const service = useService<MyService>('MyService');
}
```

## Testing

Services are fully testable in isolation:

```typescript
import { ServiceRegistry } from "@/services";
import { BrowserClipboardService } from "@/services/clipboard/ClipboardService";

describe("ClipboardService", () => {
  let service: BrowserClipboardService;

  beforeEach(async () => {
    service = new BrowserClipboardService();
    await service.configure();
    await service.start();
  });

  afterEach(async () => {
    await service.stop();
    await service.dispose();
  });

  it("should copy text", async () => {
    await service.copy("test");
    const result = await service.paste();
    expect(result).toBe("test");
  });
});
```

## Development Tools

In development mode, services are exposed globally:

```javascript
// In browser console
window.__LEXIFLOW_SERVICES__.health(); // Get health status
window.__LEXIFLOW_SERVICES__.shutdown(); // Stop all services
window.__LEXIFLOW_SERVICES__.restart(); // Restart services
```

## Folder Structure

```
src/
├── services/
│   ├── core/
│   │   ├── ServiceLifecycle.ts
│   │   ├── ServiceRegistry.ts
│   │   └── BaseService.ts
│   │
│   ├── storage/
│   │   └── StorageService.ts
│   │
│   ├── telemetry/
│   │   └── TelemetryService.ts
│   │
│   ├── crypto/
│   │   └── CryptoService.ts
│   │
│   ├── clipboard/
│   │   └── ClipboardService.ts
│   │
│   ├── session/
│   │   └── SessionService.ts
│   │
│   ├── featureFlags/
│   │   └── FeatureFlagService.ts
│   │
│   ├── bootstrap.ts
│   └── index.ts
│
├── hooks/
│   ├── useService.ts
│   ├── useStorage.ts
│   ├── useTelemetry.ts
│   ├── useCrypto.ts
│   ├── useClipboard.ts
│   ├── useSession.ts
│   └── useFeatureFlag.ts
│
└── api/                     (Frontend APIs - separate!)
    ├── cases.ts
    ├── documents.ts
    └── ...
```

## Review Checklist

When creating a new service, verify:

- [ ] Is this logic imperative?
- [ ] Does it touch browser or SDK APIs?
- [ ] Is it stateless?
- [ ] Is it injectable?
- [ ] Does it avoid domain knowledge?
- [ ] Does it avoid React imports?
- [ ] Does it extend BaseService?
- [ ] Does it have a hook adapter?
- [ ] Is it registered in bootstrap.ts?

## Migration Guide

### Existing Service → Enterprise Service

```typescript
// BEFORE: Unmanaged service
export const myService = {
  doSomething() {
    // ...
  },
};

// AFTER: Enterprise service
export class MyService extends BaseService {
  constructor() {
    super("MyService");
  }

  async doSomething() {
    this.ensureStarted();
    // ...
  }
}

// Register in bootstrap.ts
ServiceRegistry.register({
  service: new MyService(),
  lifecycle: "singleton",
  autoStart: true,
});

// Create hook adapter
export function useMyService() {
  const service = useService<MyService>("MyService");
  return { doSomething: () => service.doSomething() };
}
```

## Summary

The Enterprise React Services Architecture provides:

1. **Clear separation of concerns** - Services vs APIs vs State vs UI
2. **Explicit lifecycle management** - No implicit initialization
3. **Dependency injection** - Testable and replaceable
4. **Type safety** - Full TypeScript support
5. **Developer tools** - Health monitoring and debugging
6. **React integration** - Clean hook adapters

This architecture ensures maintainable, testable, and scalable service layer for LexiFlow.

