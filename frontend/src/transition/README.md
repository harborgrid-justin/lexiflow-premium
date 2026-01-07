# Transition Architecture - Enterprise SOA Frontend

This directory contains an enterprise-grade, SOA-style frontend architecture with clear separation of concerns.

## Architecture Overview

### Core Principles

1. **Service-Oriented Architecture (SOA)**: Capability services (identity, session, state, data) are isolated bounded contexts
2. **Provider Composition**: Single source of truth for provider nesting in `app/providers/AppProviders.tsx`
3. **Multiple Shells**: Explicit fallback UIs for different loading states (GlobalShell, AppShell, FeatureShell)
4. **SSR Streaming**: Separate Node.js and Edge runtime entry points with proper streaming support
5. **Edge-Safe Code**: Runtime-specific adapters prevent use of Node.js-only APIs in Edge deployments

## Directory Structure

```
transition/
├── app/              # Composition root - framework entry and wiring
├── platform/         # Cross-cutting platform services
├── services/         # SOA capability services (bounded contexts)
├── features/         # Product domains (billing, reporting, admin)
├── ui/               # Shared UI kit
├── lib/              # Low-level utilities
└── tests/            # Test suites
```

## Key Concepts

### Provider Tree Ownership

**Single Source of Truth**: `app/providers/AppProviders.tsx`

Provider nesting order (outer → inner):

1. StrictMode
2. ErrorBoundary
3. Config
4. Theme
5. I18n
6. Auth
7. Session
8. State
9. DataFetching
10. Router
11. Layout

Each provider implementation lives in its capability/service folder.

### Shell Architecture

Shells are first-class architectural artifacts, not scattered inline:

- **GlobalShell**: Minimal themed fallback (no auth, no data)
- **AppShell**: Auth-aware chrome skeleton (nav/sidebar placeholders)
- **FeatureShell**: Feature-level skeletons (tables/charts/forms)

Suspense boundaries wrap shells at appropriate levels.

### SSR Streaming vs Edge Runtime

**Node.js Entry** (`app/entry/node/server.tsx`):

- Uses `renderToPipeableStream(...)`
- Access to Node.js crypto, fs, etc.

**Edge Entry** (`app/entry/edge/server.tsx`):

- Uses `renderToReadableStream(...)` (Web Streams API)
- Must use Edge-safe adapters (no Node.js APIs)

Runtime-specific adapters:

- `app/providers/runtime/node.ts`
- `app/providers/runtime/edge.ts`
- `services/identity/adapters/edge.ts`
- `services/data/edge/`

### Platform Services

**Cross-cutting concerns that every feature needs:**

- **config/**: Feature flags, environment configuration
- **theme/**: Design tokens, theme provider
- **i18n/**: Internationalization, dictionaries
- **observability/**: Logging, metrics, tracing, analytics
- **security/**: CSP, redaction, secure storage

### Capability Services (SOA)

**Bounded contexts with clear ownership:**

- **identity/**: Auth provider, OIDC adapters, JWT handling
- **session/**: Session lifecycle, token refresh, storage
- **state/**: Global state management, hydration
- **data/**: Query client, caching, SSR prefetch
- **routing/**: Navigation, route policies

### Features (Product Domains)

**Feature modules organized by bounded context:**

Each feature has:

- `routes/` - Route definitions
- `components/` - UI components
- `hooks/` - Custom React hooks
- `data/` - Gateway (API client) + query keys
- `domain/` - Domain models and business logic

Examples:

- `billing/` - Invoices, payments, subscriptions
- `reporting/` - Analytics, exports
- `admin/` - User management, settings

## Usage Patterns

### Adding a New Provider

1. Implement provider in appropriate service folder (e.g., `services/myService/MyProvider.tsx`)
2. Add to composition in `app/providers/AppProviders.tsx`
3. Maintain correct nesting order

### Adding a New Feature

1. Create feature folder: `features/myFeature/`
2. Structure: `routes/`, `components/`, `hooks/`, `data/`, `domain/`
3. Implement gateway in `data/myFeatureGateway.ts`
4. Define domain models in `domain/`
5. Add routes to `routes/index.ts`

### SSR Data Prefetching

```typescript
// In server entry
import {
  prefetchQueries,
  getQueriesForRoute,
} from "services/data/ssr/prefetch";

const queries = getQueriesForRoute(request.path);
await prefetchQueries(queries);
```

### Edge-Safe Development

**Do NOT:**

- Import `crypto` from Node.js
- Use `fs`, `path`, `os` modules
- Use `process.env` (use runtime adapters)

**DO:**

- Use Web Crypto API (`crypto.subtle`)
- Use runtime adapters (`app/providers/runtime/`)
- Use `services/data/edge/` adapters

## Testing

- **Unit tests**: `tests/unit/` - Component and utility tests
- **Integration tests**: `tests/integration/` - Multi-component flows
- **Contract tests**: `tests/contract/` - API gateway contract verification

Run tests:

```bash
npm test
```

## Best Practices

1. **Keep providers minimal** - Only essential wrappers in provider components
2. **Explicit shells** - Don't scatter loading states, use shell components
3. **Runtime isolation** - Use adapters for Node/Edge differences
4. **Service boundaries** - Don't cross-import between feature domains
5. **Type safety** - Use TypeScript strictly, define domain models clearly
6. **Test contracts** - Verify API gateway contracts with backend

## Integration with Existing Project

This architecture can coexist with existing code:

- Mount at `/transition` route
- Gradually migrate features
- Share platform services (theme, auth) with legacy code

## References

- Provider composition pattern
- Suspense for SSR streaming
- Edge runtime constraints
- Service-Oriented Architecture (SOA)
- Domain-Driven Design (DDD)
