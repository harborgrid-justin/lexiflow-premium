# Database Security Module - Integration Guide

## Quick Start

### Step 1: Add Environment Variables

Add to your `.env` file:

```env
# Required: Encryption key (generate with: openssl rand -hex 32)
ENCRYPTION_KEY=your-256-bit-hex-key-here
DATABASE_ENCRYPTION_KEY=your-256-bit-hex-key-here

# Optional: Previous keys for rotation
ENCRYPTION_PREVIOUS_KEYS=["old-key-1","old-key-2"]

# Optional: Data masking key
MASKING_KEY=your-masking-key-here

# Optional: Query security limits
QUERY_MAX_JOINS=10
QUERY_MAX_WHERE=20
QUERY_MAX_ORDER_BY=5
QUERY_MAX_DEPTH=5
QUERY_MAX_PARAM_LENGTH=10000

# Optional: Connection pool settings
DB_HEALTH_CHECK_INTERVAL=30000
DB_METRICS_INTERVAL=60000
DB_LEAK_DETECTION_INTERVAL=120000
DB_MAX_CONNECTION_AGE=3600000

# Optional: SSL/TLS settings
DB_SSL_CA_CERT_PATH=/path/to/ca-cert.pem
DB_SSL_CLIENT_CERT_PATH=/path/to/client-cert.pem
DB_SSL_CLIENT_KEY_PATH=/path/to/client-key.pem
DB_SSL_SERVER_NAME=your-db-host.com
DB_FORCE_SSL=true
DB_ENABLE_RLS=true

# Optional: Security settings
DB_PREPARED_STATEMENT_CACHE=100
DB_LOCK_TIMEOUT=30000
DB_IDLE_TRANSACTION_TIMEOUT=60000
```

### Step 2: Import Module in AppModule

Update `/backend/src/app.module.ts`:

```typescript
// Add this import at the top with other imports
import { DatabaseSecurityModule } from './database/security';

@Module({
  imports: [
    // ... existing imports ...

    // Add DatabaseSecurityModule (should be imported early)
    DatabaseSecurityModule,

    // ... rest of imports ...
  ],
  // ... rest of module configuration ...
})
export class AppModule {}
```

### Step 3: Run Database Migration

```bash
# Generate new migration if needed
npm run migration:generate -- AddDatabaseSecurityEnhancements

# Run all migrations
npm run migration:run
```

### Step 4: Verify Installation

Create a test endpoint to verify everything is working:

```typescript
import { Controller, Get } from '@nestjs/common';
import {
  ColumnEncryptionService,
  QuerySanitizationService,
  ConnectionPoolService,
  DataMaskingService,
} from './database/security';

@Controller('security-test')
export class SecurityTestController {
  constructor(
    private readonly encryption: ColumnEncryptionService,
    private readonly sanitization: QuerySanitizationService,
    private readonly pool: ConnectionPoolService,
    private readonly masking: DataMaskingService,
  ) {}

  @Get('health')
  async testSecurity() {
    // Test encryption
    const encrypted = this.encryption.encrypt('test-data');
    const decrypted = this.encryption.decrypt(encrypted);

    // Test sanitization
    const query = 'SELECT * FROM users WHERE id = $1';
    const sanitized = this.sanitization.validateQuery(query, ['123']);

    // Test pool health
    const poolHealth = await this.pool.performHealthCheck();

    // Test masking
    const masked = this.masking.maskEmail('user@example.com');

    return {
      encryption: { success: decrypted === 'test-data' },
      sanitization: { safe: sanitized.isSafe },
      pool: { healthy: poolHealth.isHealthy },
      masking: { result: masked },
    };
  }
}
```

## Using Encrypted Columns

### Example Entity with Encryption

```typescript
import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../common/base/base.entity';
import {
  EncryptedColumn,
  EncryptedSSN,
  EncryptedCreditCard,
} from '../database/security';

@Entity('sensitive_data')
export class SensitiveData extends BaseEntity {
  @Column()
  publicField: string;

  @EncryptedSSN()
  socialSecurityNumber: string;

  @EncryptedCreditCard()
  creditCardNumber: string;

  @EncryptedColumn({ nullable: true })
  customEncryptedField: string;
}
```

### Using in a Service

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SensitiveData } from './entities/sensitive-data.entity';

@Injectable()
export class SensitiveDataService {
  constructor(
    @InjectRepository(SensitiveData)
    private readonly repository: Repository<SensitiveData>,
  ) {}

  async create(data: Partial<SensitiveData>): Promise<SensitiveData> {
    const entity = this.repository.create(data);
    // Encryption happens automatically on save
    return await this.repository.save(entity);
  }

  async findById(id: string): Promise<SensitiveData> {
    // Decryption happens automatically on load
    return await this.repository.findOne({ where: { id } });
  }
}
```

## Query Sanitization Best Practices

### Safe Query Building

```typescript
import { Injectable } from '@nestjs/common';
import { QuerySanitizationService } from '../database/security';

@Injectable()
export class SearchService {
  constructor(private readonly sanitizer: QuerySanitizationService) {}

  async search(tableName: string, filters: Record<string, any>) {
    // Sanitize table name
    const safeTable = this.sanitizer.sanitizeTableName(tableName);

    // Validate WHERE clause
    this.sanitizer.validateWhereClause(filters);

    // Build safe query
    // Use parameterized queries - TypeORM handles this automatically
  }
}
```

## Data Masking for Exports

### Export Service Example

```typescript
import { Injectable } from '@nestjs/common';
import { DataMaskingService } from '../database/security';

@Injectable()
export class ExportService {
  constructor(private readonly masking: DataMaskingService) {}

  async exportForPublic(data: any): Promise<any> {
    return this.masking.maskForExport(data, 'public');
  }

  async exportForInternal(data: any): Promise<any> {
    return this.masking.maskForExport(data, 'internal');
  }

  async exportForRestricted(data: any): Promise<any> {
    return this.masking.maskForExport(data, 'restricted');
  }
}
```

## Monitoring Database Health

### Health Check Endpoint

```typescript
import { Controller, Get } from '@nestjs/common';
import { ConnectionPoolService } from '../database/security';

@Controller('health/database')
export class DatabaseHealthController {
  constructor(private readonly pool: ConnectionPoolService) {}

  @Get()
  async checkHealth() {
    const health = await this.pool.performHealthCheck();
    const metrics = await this.pool.getPoolMetrics();

    return {
      status: health.isHealthy ? 'healthy' : 'unhealthy',
      timestamp: health.lastCheck,
      poolSize: health.poolSize,
      activeConnections: health.activeConnections,
      idleConnections: health.idleConnections,
      metrics: {
        totalQueries: metrics.totalQueries,
        failedQueries: metrics.failedQueries,
        averageQueryTime: metrics.averageQueryTime,
        leakedConnections: metrics.leakedConnections,
      },
      errors: health.errors,
    };
  }
}
```

## Key Rotation

### Scheduled Key Rotation

```typescript
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ColumnEncryptionService } from '../database/security';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class KeyRotationService {
  constructor(
    private readonly encryption: ColumnEncryptionService,
    @InjectRepository(SensitiveData)
    private readonly repository: Repository<SensitiveData>,
  ) {}

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async rotateKeys() {
    console.log('Starting key rotation...');

    const count = await this.encryption.rotateKey(
      'encryptedField',
      SensitiveData,
      this.repository,
    );

    console.log(`Rotated ${count} encrypted records`);
  }
}
```

## Audit Log Queries

### Viewing Audit Logs

```typescript
import { Injectable } from '@nestjs/common';
import { AuditSubscriber } from '../database/security';

@Injectable()
export class AuditService {
  constructor(private readonly auditSubscriber: AuditSubscriber) {}

  async getEntityHistory(entityName: string, entityId: string) {
    return await this.auditSubscriber.getAuditLogs({
      entityName,
      entityId,
      limit: 100,
    });
  }

  async getUserActivity(userId: string, days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await this.auditSubscriber.getAuditLogs({
      userId,
      startDate,
      limit: 1000,
    });
  }

  async getActionHistory(action: string, limit: number = 100) {
    return await this.auditSubscriber.getAuditLogs({
      action,
      limit,
    });
  }
}
```

## Testing

### Unit Test Example

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ColumnEncryptionService } from '../database/security';
import { ConfigModule } from '@nestjs/config';

describe('ColumnEncryptionService', () => {
  let service: ColumnEncryptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            () => ({
              ENCRYPTION_KEY: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
            }),
          ],
        }),
      ],
      providers: [ColumnEncryptionService],
    }).compile();

    service = module.get<ColumnEncryptionService>(ColumnEncryptionService);
  });

  it('should encrypt and decrypt data', () => {
    const plaintext = 'sensitive-data';
    const encrypted = service.encrypt(plaintext);
    const decrypted = service.decrypt(encrypted);

    expect(encrypted).not.toBe(plaintext);
    expect(decrypted).toBe(plaintext);
  });

  it('should handle null values', () => {
    expect(service.encrypt(null)).toBeNull();
    expect(service.decrypt(null)).toBeNull();
  });
});
```

## Troubleshooting

### Common Issues

1. **"ENCRYPTION_KEY not set" error**
   - Ensure ENCRYPTION_KEY or DATABASE_ENCRYPTION_KEY is in your .env file
   - Verify ConfigModule is imported before DatabaseSecurityModule

2. **Audit logs not appearing**
   - Check that AuditSubscriber is registered (automatic with module import)
   - Verify the audit_logs table exists (run migrations)

3. **Connection pool issues**
   - Check pool metrics with ConnectionPoolService.getPoolMetrics()
   - Verify database connection settings
   - Check for connection leaks

4. **Query sanitization blocking valid queries**
   - Adjust complexity limits in environment variables
   - Review sanitization rules
   - Use parameterized queries

### Debug Mode

Enable debug logging:

```typescript
// In main.ts or app.module.ts
app.useLogger(['error', 'warn', 'log', 'debug', 'verbose']);
```

## Production Checklist

- [ ] ENCRYPTION_KEY set to strong 256-bit key
- [ ] SSL/TLS enabled and certificates configured
- [ ] Database migrations run successfully
- [ ] Connection pool limits configured appropriately
- [ ] Query complexity limits set for your use case
- [ ] Audit logging verified working
- [ ] Key rotation schedule established
- [ ] Health monitoring endpoints configured
- [ ] Backup encryption keys stored securely
- [ ] Row-level security policies configured (if needed)
- [ ] Regular security audits scheduled

## Support

For additional help:
- Review README.md for detailed feature documentation
- Check USAGE_EXAMPLE.ts for code examples
- Review master.config.ts for configuration options
- Consult database.config.ts for SSL/TLS setup
