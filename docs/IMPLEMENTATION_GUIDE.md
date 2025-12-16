# LexiFlow Premium - Implementation Guide

Quick reference for using the new optimizations.

## Analytics Service Usage

### Using Real Billing Analytics

```typescript
import { BillingAnalyticsService } from './analytics/billing-analytics/billing-analytics.service';

// Inject the service
constructor(private billingAnalytics: BillingAnalyticsService) {}

// Get billing metrics (now returns real data)
async getMetrics() {
  const metrics = await this.billingAnalytics.getBillingMetrics({
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    caseId: 'optional-case-id',
  });

  // Real data includes:
  // - totalBillableHours (from time entries)
  // - totalBilled (from invoices)
  // - wipValue (unbilled work)
  // - arValue (unpaid invoices)
  // - realizationRate (collected/billed %)
  return metrics;
}
```

## Queue Error Monitoring

### Monitor Queue Health

```typescript
import { QueueErrorHandlerService } from './queues/services/queue-error-handler.service';

constructor(private queueErrors: QueueErrorHandlerService) {}

// Get statistics for all queues
async getQueueHealth() {
  const stats = await this.queueErrors.getAllQueueStats();
  // Returns: waiting, active, completed, failed, delayed counts
  return stats;
}

// Get failed jobs for review
async getFailedJobs() {
  const failed = await this.queueErrors.getFailedJobs('document-processing', 50);
  return failed;
}

// Retry a failed job
async retryJob(jobId: string) {
  await this.queueErrors.retryFailedJob('document-processing', jobId);
}
```

### Queue Error Handler Features

1. **Automatic Logging** - All queue events are logged
2. **Retry Tracking** - Monitors attempt counts
3. **Critical Alerts** - Flags permanent failures
4. **Data Sanitization** - Removes sensitive data from logs

## Database Connection Pooling

### Automatic Configuration

Connection pooling is automatically configured:

```typescript
// Configured in database.config.ts
{
  max: 20,                    // 20 connections max
  min: 5,                     // 5 connections min
  idleTimeoutMillis: 30000,   // 30s timeout
  maxUses: 7500,              // Rotate after 7500 uses
}
```

**Benefits:**
- Handles high traffic automatically
- Prevents connection leaks
- Optimizes resource usage

## API Versioning

### Creating Versioned Endpoints

```typescript
import { Controller, Get, Version } from '@nestjs/common';

@Controller('analytics')
export class AnalyticsController {

  // Version 1 endpoint (default)
  @Get('metrics')
  @Version('1')
  getMetricsV1() {
    return { version: 1, data: '...' };
  }

  // Version 2 endpoint (future)
  @Get('metrics')
  @Version('2')
  getMetricsV2() {
    return { version: 2, enhanced: true, data: '...' };
  }
}
```

**URL Access:**
- `/api/v1/analytics/metrics` - Version 1
- `/api/v2/analytics/metrics` - Version 2
- `/analytics/metrics` - Defaults to v1

### Version Migration Strategy

1. Keep v1 endpoints unchanged
2. Create v2 with improvements
3. Deprecate v1 with notice
4. Remove v1 after sunset period

## Caching Strategy

### Using Cache Decorator

```typescript
import { UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from '../common/interceptors/cache.interceptor';
import { Cache } from '../common/decorators/cache.decorator';

@Controller('analytics')
export class AnalyticsController {

  // Cache for 5 minutes
  @Get('metrics')
  @UseInterceptors(CacheInterceptor)
  @Cache({ ttl: 300 })
  async getMetrics() {
    // Expensive query here
    // Result cached for 300 seconds
  }
}
```

## Testing Recommendations

### Unit Tests

```typescript
describe('BillingAnalyticsService', () => {
  let service: BillingAnalyticsService;
  let realBillingService: BillingAnalyticsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        BillingAnalyticsService,
        {
          provide: RealBillingAnalyticsService,
          useValue: mockRealBillingService,
        },
      ],
    }).compile();

    service = module.get<BillingAnalyticsService>(BillingAnalyticsService);
  });

  it('should delegate to real billing service', async () => {
    const result = await service.getBillingMetrics({
      startDate: '2025-01-01',
      endDate: '2025-12-31',
    });

    expect(mockRealBillingService.getWipStats).toHaveBeenCalled();
    expect(result.wipValue).toBeGreaterThan(0);
  });
});
```

### Integration Tests

```typescript
describe('Analytics API', () => {
  it('GET /api/v1/analytics/billing/metrics', async () => {
    return request(app.getHttpServer())
      .get('/api/v1/analytics/billing/metrics')
      .query({ startDate: '2025-01-01', endDate: '2025-12-31' })
      .expect(200)
      .expect((res) => {
        expect(res.body.totalBillableHours).toBeDefined();
        expect(res.body.wipValue).toBeGreaterThan(0);
      });
  });
});
```

## Monitoring Queries

### Check Database Pool Usage

```sql
-- PostgreSQL: View active connections
SELECT
  datname,
  count(*) as connections,
  max_conn
FROM pg_stat_activity
CROSS JOIN (SELECT setting::int as max_conn FROM pg_settings WHERE name = 'max_connections') x
GROUP BY datname, max_conn;

-- View connection pool stats
SELECT
  application_name,
  state,
  count(*)
FROM pg_stat_activity
WHERE datname = 'lexiflow'
GROUP BY application_name, state;
```

### Check Queue Status

```bash
# Via Redis CLI
redis-cli

# Count jobs in each state
LLEN bull:document-processing:wait
LLEN bull:document-processing:active
LLEN bull:document-processing:failed
```

## Performance Optimization Tips

### 1. Use Parallel Queries

```typescript
// Good - Parallel execution
const [wipStats, realization, summary] = await Promise.all([
  this.getWipStats(filter),
  this.getRealization(filter),
  this.getSummary(filter),
]);

// Avoid - Sequential execution
const wipStats = await this.getWipStats(filter);
const realization = await this.getRealization(filter);
const summary = await this.getSummary(filter);
```

### 2. Use Query Builder for Complex Queries

```typescript
// Efficient with indexes
const result = await this.timeEntryRepository
  .createQueryBuilder('te')
  .where('te.status IN (:...statuses)', { statuses: ['APPROVED'] })
  .andWhere('te.billable = :billable', { billable: true })
  .andWhere('te.date BETWEEN :start AND :end', { start, end })
  .cache(30000) // Cache for 30 seconds
  .getMany();
```

### 3. Leverage TypeORM Caching

```typescript
// Enable query result caching
const result = await this.repository
  .createQueryBuilder('entity')
  .cache(true, 30000) // Cache for 30 seconds
  .getMany();
```

## Error Handling Best Practices

### Controller Level

```typescript
@Get('metrics')
async getMetrics(@Query() query: BillingAnalyticsQueryDto) {
  try {
    return await this.service.getBillingMetrics(query);
  } catch (error) {
    // EnterpriseExceptionFilter handles this automatically
    throw new InternalServerErrorException(
      'Failed to retrieve billing metrics',
      error.message,
    );
  }
}
```

### Service Level

```typescript
async getBillingMetrics(query: BillingAnalyticsQueryDto) {
  try {
    const data = await this.fetchData(query);
    return this.transform(data);
  } catch (error) {
    this.logger.error(
      `Error in getBillingMetrics: ${error.message}`,
      error.stack,
    );
    throw error; // Let controller handle
  }
}
```

## Security Considerations

### 1. Input Validation

All DTOs use class-validator:

```typescript
export class BillingAnalyticsQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  caseId?: string;
}
```

### 2. Sensitive Data in Logs

Queue error handler automatically sanitizes:

```typescript
// Sensitive keys removed from logs
const sensitiveKeys = [
  'password',
  'token',
  'secret',
  'apiKey',
  'authorization',
  'creditCard',
  'ssn',
];
```

### 3. Rate Limiting

Already configured globally:

```typescript
// 100 requests per minute per IP
ThrottlerModule.forRoot([{
  ttl: 60000,
  limit: 100,
}])
```

## Troubleshooting

### Issue: Analytics returns empty data

**Solution:** Check database has time entries and invoices

```sql
SELECT count(*) FROM time_entries WHERE billable = true;
SELECT count(*) FROM invoices;
```

### Issue: Queue jobs failing repeatedly

**Solution:** Check logs and retry failed jobs

```typescript
// Get failed jobs
const failed = await queueErrorHandler.getFailedJobs('email', 50);

// Retry specific job
await queueErrorHandler.retryFailedJob('email', jobId);
```

### Issue: Slow analytics queries

**Solution:** Add indexes and use query caching

```sql
-- Add indexes for common filters
CREATE INDEX idx_time_entries_date_billable
  ON time_entries(date, billable) WHERE deleted_at IS NULL;

CREATE INDEX idx_invoices_status_date
  ON invoices(status, invoice_date) WHERE deleted_at IS NULL;
```

## Migration Checklist

When deploying these changes:

- [ ] Run database migrations if any
- [ ] Update environment variables
- [ ] Test analytics endpoints with real data
- [ ] Monitor queue error logs
- [ ] Check database connection pool usage
- [ ] Verify API versioning works
- [ ] Test cache behavior
- [ ] Update API documentation

## Additional Resources

- TypeORM Documentation: https://typeorm.io
- NestJS Documentation: https://docs.nestjs.com
- Bull Queue Documentation: https://github.com/OptimalBits/bull
- PostgreSQL Connection Pooling: https://node-postgres.com/apis/pool

---

**Last Updated:** 2025-12-16
**Version:** 1.0.0
