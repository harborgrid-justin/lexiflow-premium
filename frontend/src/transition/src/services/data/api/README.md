# OpenAPI Client Generation for LexiFlow

This directory contains auto-generated TypeScript clients from the NestJS Swagger API.

## Structure

```
services/data/api/
├── generated/              # Auto-generated (DO NOT EDIT)
│   ├── schemas.ts         # OpenAPI type definitions
│   └── client.ts          # Typed API client
├── gateways/              # Domain-specific wrappers
│   ├── userGateway.ts
│   ├── billingGateway.ts
│   ├── reportingGateway.ts
│   └── adminGateway.ts
└── index.ts               # Public exports
```

## Generating Clients

### Prerequisites

1. Ensure backend is running on `http://localhost:3000`
2. Backend must expose Swagger JSON at `/api-json`

### Generate Command

```bash
cd /workspaces/lexiflow-premium/frontend/src/transition
npm run codegen
```

This will:

1. Fetch OpenAPI spec from backend
2. Generate TypeScript types in `generated/schemas.ts`
3. Create typed client in `generated/client.ts`

### Manual Generation

If you need to generate from a specific backend URL:

```bash
export BACKEND_URL=https://api.lexiflow.com
npm run generate:prod
npm run build-client
```

## Usage

### Direct API Usage (Not Recommended)

```typescript
import { usersApi, casesApi } from "@/services/data/api/generated/client";

// Get current user
const user = await usersApi.me();

// Get all cases
const cases = await casesApi.findAll();
```

### Via Gateways (Recommended)

```typescript
import { userGateway } from "@/services/data/api/gateways/userGateway";

// Gateways provide domain-specific logic and caching
const identity = await userGateway.getCurrentIdentity();
```

## Authentication

All generated API clients automatically include authentication via:

- **httpOnly cookies** (primary method)
- **credentials: 'include'** in all requests
- Automatic 401/403 handling

Frontend never handles JWT tokens directly.

## Type Safety

All requests and responses are fully typed:

```typescript
import type { User, Case } from "@/services/data/api/generated/client";

const user: User = await usersApi.me();
//    ^? type User = { id: string; email: string; ... }
```

## Troubleshooting

### "Cannot find module './schemas'"

Run code generation: `npm run codegen`

### "Failed to fetch OpenAPI spec"

- Ensure backend is running
- Check backend URL in `codegen.package.json`
- Verify `/api-json` endpoint is accessible

### "Type errors in generated code"

- Ensure backend Swagger decorators are correct
- Check NestJS @ApiProperty() decorators on DTOs
- Regenerate: `npm run codegen`

## CI/CD Integration

Add to your pipeline:

```yaml
- name: Generate API Client
  run: |
    cd frontend/src/transition
    npm run codegen
```

## Notes

- **Never edit generated files manually** - they will be overwritten
- Run `npm run codegen` after backend API changes
- Gateways wrap generated clients with domain logic
- Use gateways in components, not generated clients directly
