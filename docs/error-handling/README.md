# Error Handling & Logging System

This directory contains comprehensive documentation for the LexiFlow AI Legal Suite error handling and logging system with GitHub issue integration.

## Documentation Files

1. **[ERROR_REPORTING_WORKFLOW.md](./ERROR_REPORTING_WORKFLOW.md)**
   - Complete system architecture overview
   - Backend and frontend components
   - Error flow diagrams
   - Configuration guide
   - Best practices for developers
   - Monitoring and analytics
   - Testing strategies
   - Troubleshooting guide

2. **[GITHUB_ISSUE_SETUP.md](./GITHUB_ISSUE_SETUP.md)**
   - Step-by-step setup guide
   - GitHub token creation
   - Environment configuration
   - Label setup instructions
   - Testing procedures
   - Security best practices
   - Production deployment
   - Troubleshooting

## Quick Start

### For Backend Development

```typescript
import { NotFoundException, DatabaseException } from '@/common/exceptions';

// Throw custom exceptions with context
throw new NotFoundException('Case', caseId);
throw new DatabaseException('query', 'Timeout', correlationId, { query });
```

### For Frontend Development

```typescript
import { ErrorBoundary } from '@/components/error';
import { errorService } from '@/services/errorService';

// Wrap components with error boundary
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>

// Log errors manually
errorService.logError({
  error,
  correlationId: generateId(),
  context: { action: 'createCase' }
});
```

## System Components

### Backend (/backend/src)

- **Exception Filters**
  - `common/filters/all-exceptions.filter.ts` - Global exception handler
  - `common/filters/http-exception.filter.ts` - HTTP exception handler

- **Services**
  - `common/exceptions/error-tracking.service.ts` - Error tracking and analytics
  - `common/exceptions/github-issue.service.ts` - GitHub issue automation
  - `logging/logging.service.ts` - Structured logging

- **Custom Exceptions**
  - `common/exceptions/custom-exceptions.ts` - All custom exception classes

### Frontend (/)

- **Error Components**
  - `components/error/ErrorBoundary.tsx` - React error boundary
  - `components/error/ErrorFallback.tsx` - Default error UI
  - `components/error/NetworkError.tsx` - Network error page
  - `components/error/NotFound.tsx` - 404 page
  - `components/error/Forbidden.tsx` - 403 page
  - `components/error/ServerError.tsx` - 500 page

- **Services**
  - `services/errorService.ts` - Error logging service
  - `services/githubIssueService.ts` - GitHub issue creation

- **Utilities**
  - `utils/errorUtils.ts` - Error utilities and helpers
  - `types/errors.ts` - Error type definitions

### GitHub Integration

- **Issue Templates**
  - `.github/ISSUE_TEMPLATE/bug_report.md` - Manual bug reports
  - `.github/ISSUE_TEMPLATE/error_report.md` - Automated error reports
  - `.github/ISSUE_TEMPLATE/config.yml` - Template configuration

## Key Features

### 1. Automatic Error Tracking
- All errors are automatically tracked with correlation IDs
- Errors are categorized by severity (LOW, MEDIUM, HIGH, CRITICAL)
- Error fingerprinting prevents duplicates
- In-memory cache with TTL for performance

### 2. GitHub Issue Integration
- Critical and high-severity errors automatically create GitHub issues
- Deduplication prevents spam
- Rich context including stack traces, environment info
- Automatic labeling by severity and type
- Threshold-based reporting (default: 5 occurrences)

### 3. Structured Logging
- Multiple log levels: FATAL, ERROR, WARN, INFO, DEBUG
- Special categories: SECURITY, AUDIT, PERFORMANCE
- Correlation ID support for request tracing
- Multiple transports (Console, File)
- Log rotation support

### 4. User-Friendly Error Pages
- Network error detection with troubleshooting steps
- 404 with search functionality
- 403 with permission details
- 500 with auto-retry capability
- Error reporting directly from UI

### 5. Error Analytics
- Real-time error statistics
- Error trends by severity
- Unique error tracking
- Recent error monitoring
- API endpoints for dashboards

## Configuration

### Required Environment Variables

```env
# GitHub Integration
GITHUB_TOKEN=ghp_xxxxxxxxxxxxx
GITHUB_REPO=username/repository
GITHUB_ISSUE_REPORTING_ENABLED=true

# Error Tracking
ERROR_REPORT_THRESHOLD=5
ERROR_CACHE_TTL=3600000

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=/var/log/lexiflow
```

See [GITHUB_ISSUE_SETUP.md](./GITHUB_ISSUE_SETUP.md) for detailed configuration.

## Error Severity Levels

| Level | Description | Examples | Action |
|-------|-------------|----------|--------|
| CRITICAL | System-critical failures | Database down, payment service unavailable | Immediate GitHub issue + Alert |
| HIGH | Major functionality broken | API errors, auth failures | GitHub issue after threshold |
| MEDIUM | Partial functionality affected | Rate limiting, business logic errors | Log and track |
| LOW | Minor issues | Validation errors, 404s | Log only |

## Usage Examples

### Backend Exception Handling

```typescript
import { Injectable } from '@nestjs/common';
import { DatabaseException, NotFoundException } from '@/common/exceptions';

@Injectable()
export class CasesService {
  async findOne(id: string) {
    try {
      const case = await this.repository.findOne(id);
      if (!case) {
        throw new NotFoundException('Case', id);
      }
      return case;
    } catch (error) {
      throw new DatabaseException(
        'findOne',
        error.message,
        correlationId,
        { caseId: id }
      );
    }
  }
}
```

### Frontend Error Handling

```typescript
import { ErrorBoundary } from '@/components/error';
import { errorService } from '@/services/errorService';

function App() {
  return (
    <ErrorBoundary onError={(error, errorInfo) => {
      // Custom error handling
      console.error('App error:', error);
    }}>
      <YourApp />
    </ErrorBoundary>
  );
}

// Manual error logging
try {
  await createCase(data);
} catch (error) {
  await errorService.logError({
    error,
    correlationId: generateId(),
    context: { userId, action: 'createCase' }
  });
}
```

### Creating GitHub Issues

```typescript
import { githubIssueService } from '@/services/githubIssueService';

const report = {
  error: new Error('Payment processing failed'),
  correlationId: 'err-123456',
  severity: 'critical',
  userDescription: 'Payment failed after card was charged',
  reproSteps: [
    'Add items to cart',
    'Proceed to checkout',
    'Enter payment details',
    'Click "Pay Now"'
  ]
};

const result = await githubIssueService.createIssue(report);
console.log('Issue created:', result.issueUrl);
```

## Monitoring & Debugging

### Check Error Statistics

```bash
curl http://localhost:3000/api/errors/statistics
```

### Get Recent Errors

```bash
curl http://localhost:3000/api/errors/recent?limit=10
```

### Find Error by Correlation ID

```bash
curl http://localhost:3000/api/errors/err-123456
```

### Verify GitHub Integration

```bash
curl http://localhost:3000/api/errors/github-status
```

## Testing

### Run Unit Tests

```bash
# Backend
cd backend
npm test

# Frontend
npm test
```

### Test Error Handling

```bash
# Trigger test error
curl -X POST http://localhost:3000/api/errors/test \
  -H "Content-Type: application/json" \
  -d '{"severity": "high"}'
```

## Troubleshooting

See the [ERROR_REPORTING_WORKFLOW.md](./ERROR_REPORTING_WORKFLOW.md#troubleshooting) for detailed troubleshooting guides.

Common issues:
- GitHub issues not being created → Check token and severity level
- Errors not being logged → Verify logging service initialization
- Frontend errors not reaching backend → Check API URL and CORS

## Support

For questions or issues:
1. Check the documentation in this directory
2. Review inline code comments
3. Check GitHub issues for known problems
4. Contact the development team

## Future Enhancements

- [ ] Slack integration for critical errors
- [ ] Email notifications
- [ ] Error analytics dashboard
- [ ] Automated error resolution suggestions
- [ ] Error replay in development
- [ ] APM integration
- [ ] User feedback collection
- [ ] SLO/SLA tracking

## Contributing

When adding new error types or modifying the error handling system:
1. Update custom exceptions in `backend/src/common/exceptions/`
2. Add corresponding error types in `types/errors.ts`
3. Update documentation
4. Add tests for new error scenarios
5. Update GitHub issue templates if needed

## License

Proprietary - LexiFlow AI Legal Suite
