# Database Security Module

Comprehensive database security implementation for LexiFlow Premium, including encryption, sanitization, connection pooling, and audit logging.

## Features

- **AES-256-GCM Column Encryption**: Transparent encryption/decryption with key rotation support
- **Query Sanitization**: SQL injection prevention and query complexity limits
- **Connection Pool Management**: Enhanced pool monitoring, health checks, and leak detection
- **Audit Logging**: Automatic tracking of all database operations
- **Data Masking**: PII masking for logs and exports
- **SSL/TLS Security**: Certificate validation and encrypted connections

## Installation

The DatabaseSecurityModule is automatically available when imported in your app module:

```typescript
import { Module } from '@nestjs/common';
import { DatabaseSecurityModule } from './database/security';

@Module({
  imports: [DatabaseSecurityModule],
})
export class AppModule {}
```

## Configuration

### Environment Variables

Required:
```env
ENCRYPTION_KEY=your-256-bit-encryption-key-here
DATABASE_ENCRYPTION_KEY=alternative-key-name
```

Optional:
```env
# Encryption
ENCRYPTION_PREVIOUS_KEYS=["old-key-1","old-key-2"]
MASKING_KEY=your-masking-key

# Query Security
QUERY_MAX_JOINS=10
QUERY_MAX_WHERE=20
QUERY_MAX_ORDER_BY=5
QUERY_MAX_DEPTH=5
QUERY_MAX_PARAM_LENGTH=10000

# Connection Pool
DB_HEALTH_CHECK_INTERVAL=30000
DB_METRICS_INTERVAL=60000
DB_LEAK_DETECTION_INTERVAL=120000
DB_MAX_CONNECTION_AGE=3600000

# SSL/TLS
DB_SSL_CA_CERT_PATH=/path/to/ca-cert.pem
DB_SSL_CLIENT_CERT_PATH=/path/to/client-cert.pem
DB_SSL_CLIENT_KEY_PATH=/path/to/client-key.pem
DB_SSL_SERVER_NAME=postgres.example.com
DB_FORCE_SSL=true

# Row Level Security
DB_ENABLE_RLS=true
```

## Usage Examples

### 1. Column Encryption

Use the `@EncryptedColumn()` decorator to automatically encrypt sensitive data:

```typescript
import { Entity, Column } from 'typeorm';
import { EncryptedColumn, EncryptedSSN, EncryptedCreditCard } from './database/security';
import { BaseEntity } from './common/base/base.entity';

@Entity('clients')
export class Client extends BaseEntity {
  @Column()
  name: string;

  @EncryptedSSN()
  socialSecurityNumber: string;

  @EncryptedCreditCard()
  creditCardNumber: string;

  @EncryptedColumn({ nullable: true })
  sensitiveNotes: string;
}
```

Specialized decorators available:
- `@EncryptedSSN()` - Social Security Numbers
- `@EncryptedCreditCard()` - Credit Card Numbers
- `@EncryptedBankAccount()` - Bank Account Numbers
- `@EncryptedDriverLicense()` - Driver License Numbers
- `@EncryptedPassport()` - Passport Numbers
- `@EncryptedTaxId()` - Tax IDs
- `@EncryptedHealthRecord()` - Health Records
- `@EncryptedPersonalInfo()` - General PII

### 2. Manual Encryption

```typescript
import { Injectable } from '@nestjs/common';
import { ColumnEncryptionService } from './database/security';

@Injectable()
export class MyService {
  constructor(private readonly encryption: ColumnEncryptionService) {}

  async processData(sensitiveData: string): Promise<void> {
    const encrypted = this.encryption.encrypt(sensitiveData);

    const decrypted = this.encryption.decrypt(encrypted);

    const hash = this.encryption.hashValue(sensitiveData);
  }

  async rotateKeys(repository: Repository<MyEntity>): Promise<void> {
    const count = await this.encryption.rotateKey(
      'encryptedField',
      MyEntity,
      repository
    );
    console.log(`Rotated ${count} records`);
  }
}
```

### 3. Query Sanitization

```typescript
import { Injectable } from '@nestjs/common';
import { QuerySanitizationService } from './database/security';

@Injectable()
export class QueryService {
  constructor(private readonly sanitizer: QuerySanitizationService) {}

  async executeQuery(query: string, params: any[]): Promise<any> {
    const result = this.sanitizer.validateQuery(query, params);

    if (!result.isSafe) {
      throw new Error(`Unsafe query: ${result.violations.join(', ')}`);
    }

    this.sanitizer.blockDangerousOperations(query);

    return await this.dataSource.query(query, params);
  }

  buildSafeQuery(tableName: string, columns: string[]): string {
    const safeTable = this.sanitizer.sanitizeTableName(tableName);
    const safeColumns = columns.map(c => this.sanitizer.sanitizeColumnName(c));

    return `SELECT ${safeColumns.join(', ')} FROM ${safeTable}`;
  }
}
```

### 4. Data Masking

```typescript
import { Injectable } from '@nestjs/common';
import { DataMaskingService } from './database/security';

@Injectable()
export class ExportService {
  constructor(private readonly masking: DataMaskingService) {}

  async exportData(data: any, userRole: string): Promise<any> {
    if (userRole === 'public') {
      return this.masking.maskForExport(data, 'public');
    } else if (userRole === 'internal') {
      return this.masking.maskForExport(data, 'internal');
    }
    return data;
  }

  logSensitiveOperation(data: any): void {
    const masked = this.masking.maskForLogging(data);
    console.log('Operation:', masked);
  }

  maskSpecificFields(value: string, type: string): string {
    switch (type) {
      case 'email':
        return this.masking.maskEmail(value);
      case 'phone':
        return this.masking.maskPhone(value);
      case 'ssn':
        return this.masking.maskSSN(value);
      case 'creditcard':
        return this.masking.maskCreditCard(value);
      default:
        return this.masking.maskData(value);
    }
  }
}
```

### 5. Connection Pool Monitoring

```typescript
import { Injectable } from '@nestjs/common';
import { ConnectionPoolService } from './database/security';

@Injectable()
export class HealthService {
  constructor(private readonly poolService: ConnectionPoolService) {}

  async checkDatabaseHealth(): Promise<any> {
    const health = await this.poolService.performHealthCheck();

    if (!health.isHealthy) {
      console.error('Database health issues:', health.errors);
    }

    const metrics = await this.poolService.getPoolMetrics();

    return {
      status: health.isHealthy ? 'healthy' : 'unhealthy',
      metrics,
      poolSize: health.poolSize,
      activeConnections: health.activeConnections,
    };
  }

  async reconnectDatabase(): Promise<void> {
    await this.poolService.reconnectWithBackoff(5, 1000);
  }
}
```

### 6. Audit Logging

Audit logging is automatic via the AuditSubscriber. All INSERT, UPDATE, DELETE operations are logged.

```typescript
import { Injectable } from '@nestjs/common';
import { AuditSubscriber } from './database/security';

@Injectable()
export class AuditService {
  constructor(private readonly auditSubscriber: AuditSubscriber) {}

  async getEntityHistory(entityName: string, entityId: string): Promise<any> {
    return await this.auditSubscriber.getAuditLogs({
      entityName,
      entityId,
      limit: 100,
    });
  }

  async getUserActivity(userId: string, startDate: Date): Promise<any> {
    return await this.auditSubscriber.getAuditLogs({
      userId,
      startDate,
      limit: 1000,
    });
  }
}
```

## Security Best Practices

1. **Encryption Keys**
   - Use strong, randomly generated 256-bit keys
   - Store keys in secure environment variables or key management services
   - Rotate keys periodically (use key rotation feature)
   - Never commit keys to version control

2. **Database Connections**
   - Always use SSL/TLS in production
   - Validate SSL certificates
   - Use connection pooling
   - Monitor for connection leaks

3. **Query Security**
   - Always use parameterized queries
   - Validate and sanitize all user input
   - Set appropriate query complexity limits
   - Monitor for suspicious query patterns

4. **Data Access**
   - Implement row-level security where appropriate
   - Use data masking for logs and exports
   - Audit all access to sensitive data
   - Apply principle of least privilege

5. **Monitoring**
   - Regularly review audit logs
   - Monitor connection pool metrics
   - Set up alerts for security events
   - Track failed authentication attempts

## Migration

Run the security migration to set up database functions and policies:

```bash
npm run migration:run
```

This will:
- Enable pgcrypto extension
- Create audit functions
- Set up row-level security policies
- Create security monitoring views

## Performance Considerations

- Encryption/decryption adds ~1-2ms per operation
- Audit logging is buffered and flushed periodically
- Connection pool monitoring has minimal overhead
- Query sanitization adds <1ms validation time

## Troubleshooting

### Encryption Not Working

Check that ENCRYPTION_KEY is set:
```typescript
console.log(process.env.ENCRYPTION_KEY ? 'Set' : 'Not set');
```

### Audit Logs Not Appearing

Verify AuditSubscriber is registered:
```typescript
// Should be automatic with DatabaseSecurityModule
```

### Connection Pool Issues

Check pool metrics:
```typescript
const metrics = await connectionPoolService.getPoolMetrics();
console.log(metrics);
```

## Support

For issues or questions, refer to the enterprise support documentation.
