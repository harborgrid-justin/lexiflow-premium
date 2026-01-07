# LexiFlow Transition Architecture

Enterprise SOA-style frontend architecture built with React 18+ and TypeScript.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Type check
npm run typecheck
```

The app will run on `http://localhost:5174`

## Project Structure

```
transition/
├── app/                    # Application layer
│   ├── entry/             # Entry points (client, node, edge)
│   ├── providers/         # Provider composition
│   ├── shells/            # Suspense boundaries
│   ├── routing/           # Routing, navigation, paths.ts
│   └── layout/            # Layout structure
├── platform/              # Platform services
│   ├── config/           # Configuration management
│   ├── theme/            # Theming system
│   ├── i18n/             # Internationalization
│   ├── observability/    # Logging, tracing, analytics
│   └── security/         # Security utilities
├── services/             # Core services
│   ├── identity/        # Authentication
│   ├── session/         # Session management
│   ├── state/           # State management
│   ├── data/            # Data fetching
│   └── routing/         # Navigation utilities
├── features/            # Feature domains
│   ├── billing/        # Billing feature
│   ├── reporting/      # Reporting feature
│   └── admin/          # Admin feature
├── ui/                 # UI components
│   ├── components/    # Reusable components
│   ├── primitives/    # Layout primitives
│   ├── patterns/      # Layout patterns
│   └── icons/         # Icon components
├── lib/               # Utility libraries
│   ├── http/         # HTTP utilities
│   ├── fp/           # Functional programming
│   ├── dates/        # Date utilities
│   └── types/        # Type utilities
└── tests/            # Test suites
```

## Available Routes

- `/` - Home page
- `/billing` - Billing dashboard
- `/billing/invoices` - Invoice list
- `/reporting` - Reporting dashboard
- `/admin` - Admin dashboard (requires admin role)
- `/admin/users` - User management (requires admin role)

## Architecture Features

✅ **React 18+** with Suspense and Streaming SSR
✅ **TypeScript** strict mode
✅ **SOA/DDD** principles with bounded contexts
✅ **Provider composition** pattern
✅ **Multiple shell levels** for optimal streaming
✅ **Node/Edge runtime** separation
✅ **Feature-specific shells** with custom loading states
✅ **Barrel exports** for clean imports
✅ **Path aliases** for better DX

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Key variables:

- `VITE_API_BASE_URL` - API base URL
- `VITE_AUTH_PROVIDER` - Authentication provider (jwt, oidc, oauth2)
- `VITE_DEFAULT_THEME` - Default theme (light, dark, system)
- `VITE_DEFAULT_LOCALE` - Default locale (en, es, fr)

## Development

### Using Clean Imports

```typescript
// UI components
import { Button, Card, Input } from "@/ui/components";
import { Box, Stack, Grid } from "@/ui/primitives";

// Platform services
import { useTheme, useI18n, useConfig } from "@/platform";

// Utilities
import { httpGet, pipe, formatDate } from "@/lib";
```

### Adding New Features

1. Create feature directory in `features/`
2. Add domain models, components, hooks, and gateway
3. Create feature-specific shells if needed
4. Add routes in `app/routing/routes.tsx`
5. Register in routing configuration

### Testing

```bash
# Run all tests
npm test

# Run with UI
npm run test:ui

# Coverage report
npm run test:coverage
```

## Production Build

```bash
npm run build
```

Output in `dist/` directory with:

- Code splitting (React vendor, platform, services chunks)
- Source maps
- Minification
- ES modules

## License

Proprietary - LexiFlow AI Legal Suite
