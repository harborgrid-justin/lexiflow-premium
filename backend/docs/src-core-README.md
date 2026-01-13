# Core Module - Enterprise Coordination Infrastructure

The Core Module is the central coordination infrastructure for LexiFlow Premium, a $350M enterprise legal application. It orchestrates all security, authentication, authorization, compliance, monitoring, and performance modules.

## Overview

The Core Module provides:

- **Centralized Module Orchestration** - Ensures proper dependency ordering and initialization
- **Bootstrap & Shutdown Services** - Manages application lifecycle with health checks and graceful shutdown
- **Configuration Validation** - Validates all environment variables, secrets, and system configurations
- **Enterprise Decorators** - Composite decorators for common security and monitoring patterns
- **Module Coordination** - Ties together all enterprise infrastructure modules

## Architecture

```
/core
├── constants/
│   └── module.order.constant.ts    # Module loading order and dependencies
├── decorators/
│   └── enterprise.decorator.ts     # Composite decorators for controllers/methods
├── interfaces/
│   └── module.config.interface.ts  # Standard module configuration interfaces
├── services/
│   ├── bootstrap.service.ts        # Application startup sequence
│   ├── shutdown.service.ts         # Graceful shutdown handling
│   └── configuration.validator.service.ts  # Configuration validation
├── core.module.ts                  # Central module that imports all infrastructure
└── index.ts                        # Module exports
```

## Features

### 1. Bootstrap Service

Handles application startup with:
- Configuration validation
- Database connection verification
- Redis connection verification
- Health checks
- Critical subsystem initialization
- Detailed startup logging

### 2. Shutdown Service

Manages graceful shutdown with:
- In-flight request completion
- Queue draining
- External connection cleanup
- Database connection closing
- Resource cleanup
- Shutdown timeout protection (30 seconds)

### 3. Configuration Validator Service

Validates:
- Environment variables
- JWT secret strength
- Database connectivity
- Redis connectivity
- Security settings
- Rate limiting configuration
- File storage settings

### 4. Enterprise Decorators

Provides composite decorators:

#### `@EnterpriseController(tag, options)`
Applies all standard security, monitoring, and documentation decorators to controllers.

```typescript
@EnterpriseController('Cases', { requireAuth: true })
export class CasesController {
  // ...
}
```

#### `@EnterpriseMethod(options)`
Applies logging, auditing, and performance tracking to methods.

```typescript
@EnterpriseMethod({
  audit: true,
  performanceTrack: true,
  roles: ['admin'],
  summary: 'Create a new case'
})
async createCase() {
  // ...
}
```

#### `@SecuredEndpoint(roles, permissions)`
Combines authentication, authorization, audit, and performance tracking.

```typescript
@SecuredEndpoint(['attorney', 'admin'], ['cases:create'])
async createCase() {
  // ...
}
```

#### `@AdminOnly()`
Restricts endpoint to admin users only.

```typescript
@AdminOnly()
async deleteAllCases() {
  // ...
}
```

#### `@HighValueOperation(options)`
For critical operations requiring maximum security and monitoring.

```typescript
@HighValueOperation({
  roles: ['admin'],
  permissions: ['trust-account:transfer'],
  action: 'Transfer trust funds',
  performanceThreshold: 2000
})
async transferTrustFunds() {
  // ...
}
```

## Module Loading Order

Modules are loaded in dependency order:

1. **Core Infrastructure** (Priority 0-9)
   - Configuration, Database, Common, Errors

2. **Security & Authentication** (Priority 10-19)
   - Security, Auth, Users, JWT

3. **Authorization & Compliance** (Priority 20-29)
   - Authorization, Compliance, API Keys

4. **Monitoring & Performance** (Priority 30-39)
   - Monitoring, Health, Performance, Telemetry

5. **API Security** (Priority 40-49)
   - API Security, Rate Limiting

6. **Queues & Events** (Priority 50-59)
   - Queues, Events, Realtime

7. **Business Logic** (Priority 60-99)
   - All business modules (Cases, Documents, Billing, etc.)

## Usage

### Import CoreModule in AppModule

```typescript
import { CoreModule } from './core/core.module';

@Module({
  imports: [
    // ... configuration modules
    CoreModule,  // Import CoreModule early
    // ... other modules
  ],
})
export class AppModule {}
```

### Use Enterprise Decorators

```typescript
import {
  EnterpriseController,
  EnterpriseMethod,
  SecuredEndpoint,
  HighValueOperation
} from './core';

@EnterpriseController('Billing')
export class BillingController {

  @SecuredEndpoint(['attorney'], ['billing:view'])
  async getInvoices() {
    // Automatically includes: auth, audit, performance tracking
  }

  @HighValueOperation({
    roles: ['admin'],
    permissions: ['trust-account:manage'],
    action: 'Create trust account transfer',
    performanceThreshold: 1000
  })
  async createTrustTransfer() {
    // Maximum security and monitoring
  }
}
```

### Access Bootstrap/Shutdown Services

```typescript
import { BootstrapService, ShutdownService } from './core';

// In main.ts, services are automatically initialized
// You can access them for monitoring:

const bootstrapService = app.get(BootstrapService);
const results = bootstrapService.getStartupResults();
console.log(results);

const shutdownService = app.get(ShutdownService);
const isShuttingDown = shutdownService.isShutdownInProgress();
```

## Module Configuration Interface

All modules can implement the standard `ModuleConfig` interface:

```typescript
import { ModuleConfig } from './core';

const myModuleConfig: ModuleConfig = {
  name: 'MyModule',
  version: '1.0.0',
  features: {
    enabled: true,
    features: {
      featureA: true,
      featureB: false
    }
  },
  health: {
    enabled: true,
    interval: 30000,
    timeout: 5000
  },
  logging: {
    enabled: true,
    level: 'info'
  },
  metrics: {
    enabled: true,
    interval: 60000
  },
  dependencies: ['Auth', 'Database'],
  priority: 60,
  required: false
};
```

## Graceful Shutdown

The Core Module handles graceful shutdown via signal handlers:

- **SIGTERM** - Kubernetes, Docker, systemd shutdown
- **SIGINT** - Ctrl+C interrupt

Shutdown sequence:
1. Stop accepting new requests
2. Complete in-flight requests (5 second wait)
3. Drain queues (2 second wait)
4. Close external connections (Redis, etc.)
5. Close database connection
6. Cleanup resources

Total timeout: 30 seconds (forced exit if exceeded)

## Production Readiness

The Core Module ensures:

- ✅ No mock data
- ✅ No TODOs
- ✅ 100% production-ready code
- ✅ No underscores in new code (camelCase throughout)
- ✅ Complete error handling
- ✅ Comprehensive logging
- ✅ Health checks
- ✅ Configuration validation
- ✅ Graceful shutdown

## Integration with Existing Modules

The Core Module imports and coordinates:

- **CommonModule** - Utilities, guards, interceptors, filters
- **SecurityModule** - Encryption, security headers, fingerprinting
- **ErrorsModule** - Error handling and recovery
- **AuthModule** - JWT authentication, session management
- **UsersModule** - User entities and management
- **AuthorizationModule** - RBAC, permissions, policies
- **ComplianceModule** - Audit logs, GDPR, ethical walls
- **MonitoringModule** - Logging, metrics, alerting, tracing
- **HealthModule** - Health checks
- **PerformanceModule** - Caching, query optimization
- **ApiSecurityModule** - Rate limiting, request validation

## Environment Variables

Required variables validated by ConfigurationValidatorService:

### Critical
- `NODE_ENV` - Environment (development, production, staging, test)
- `PORT` - Server port
- `JWT_SECRET` - JWT signing secret (minimum 32 characters)
- `JWT_REFRESH_SECRET` - Refresh token secret (minimum 32 characters)
- `DATABASE_URL` or `DATABASE_HOST` - Database connection

### Optional
- `REDIS_HOST` - Redis host (default: localhost)
- `REDIS_PORT` - Redis port (default: 6379)
- `REDIS_ENABLED` - Enable Redis (default: true)
- `DEMO_MODE` - Demo mode flag (default: false)
- `OTEL_ENABLED` - OpenTelemetry enabled (default: false)

## Monitoring & Observability

The Core Module integrates with:

- **Structured Logging** - JSON logs with PII redaction
- **Performance Tracking** - Automatic performance metrics
- **Audit Trail** - All actions logged automatically
- **Distributed Tracing** - OpenTelemetry integration
- **Health Checks** - Database, Redis, memory, disk
- **Metrics Collection** - Prometheus-compatible metrics

## Best Practices

1. **Always use CoreModule** - Don't import individual infrastructure modules directly
2. **Use Enterprise Decorators** - Apply consistent security and monitoring
3. **Follow Module Order** - Respect dependency order defined in constants
4. **Validate Configuration** - Check startup logs for configuration issues
5. **Monitor Shutdown** - Ensure graceful shutdown completes successfully
6. **Check Health Endpoint** - Use `/api/health` for liveness/readiness probes

## Troubleshooting

### Configuration Validation Fails
Check the startup logs for specific configuration issues. The validator provides detailed recommendations.

### Module Initialization Errors
Review the module dependency graph in `module.order.constant.ts` to ensure proper ordering.

### Shutdown Timeout
If shutdown exceeds 30 seconds, the application will force exit. Check logs to identify stuck resources.

### Health Checks Failing
Access `/api/health` endpoint to see detailed health check results for each subsystem.

## Version History

- **v1.0.0** - Initial release
  - Bootstrap service with configuration validation
  - Shutdown service with graceful shutdown
  - Enterprise decorators for security and monitoring
  - Module coordination and orchestration

## License

Proprietary - LexiFlow Premium
