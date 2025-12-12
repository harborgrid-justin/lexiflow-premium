# Error Reporting Workflow for LexiFlow AI Legal Suite

## Overview
This document describes the comprehensive error handling and GitHub issue reporting system implemented in LexiFlow AI Legal Suite.

## System Architecture

### Backend Components

1. **Exception Filters**
   - `AllExceptionsFilter` - Catches all unhandled exceptions (last line of defense)
   - `HttpExceptionFilter` - Handles HTTP exceptions specifically
   - Both filters integrate with error tracking and logging services

2. **Error Tracking Service** (`ErrorTrackingService`)
   - Tracks all application errors
   - Categorizes errors by severity (LOW, MEDIUM, HIGH, CRITICAL)
   - Maintains error cache with fingerprinting for deduplication
   - Automatically marks high-severity errors for GitHub reporting
   - Provides error statistics and analytics

3. **GitHub Issue Service** (`GitHubIssueService`)
   - Creates GitHub issues from critical errors
   - Searches for existing issues to avoid duplicates
   - Formats issues with detailed context and debugging information
   - Supports adding comments to existing issues
   - Configurable via environment variables

4. **Logging Service** (`LoggingService`)
   - Structured logging with multiple levels (FATAL, ERROR, WARN, INFO, DEBUG)
   - Special categories: SECURITY, AUDIT, PERFORMANCE
   - Correlation ID support for request tracing
   - Multiple transports (Console, File)
   - Batch logging capability

5. **Custom Exceptions**
   - `BaseCustomException` - Base class with correlation ID support
   - `ValidationException` - Input validation errors
   - `NotFoundException` - Resource not found
   - `UnauthorizedException` - Authentication failures
   - `ForbiddenException` - Authorization failures
   - `DatabaseException` - Database operation errors
   - `ExternalServiceException` - External API failures
   - `AIServiceException` - AI/ML service errors
   - `PaymentException` - Payment processing errors
   - And more...

### Frontend Components

1. **Error Boundary** (`ErrorBoundary`)
   - React error boundary that catches component errors
   - Automatically logs errors to backend
   - Generates correlation IDs
   - Supports custom fallback UI
   - Provides error reporting functionality

2. **Error Pages**
   - `NetworkError` - Network connectivity issues
   - `NotFound` - 404 errors with search functionality
   - `Forbidden` - 403 permission errors
   - `ServerError` - 500 server errors with auto-retry
   - `ErrorFallback` - Generic error display

3. **Error Service** (`errorService`)
   - Centralized error logging
   - Queue-based batch processing
   - API integration for error reporting
   - GitHub issue creation support

4. **GitHub Issue Service** (`githubIssueService`)
   - Frontend interface for creating GitHub issues
   - Routes through backend API for security
   - Automatic severity detection
   - Environment information collection

5. **Error Utilities** (`errorUtils`)
   - Error categorization and classification
   - Error message extraction
   - Retry logic with exponential backoff
   - Error fingerprinting
   - User-friendly error messages

6. **Error Type Definitions**
   - `AppError` - Base application error class
   - `NetworkError` - Network-specific errors
   - `AuthError` - Authentication errors
   - `ValidationError` - Validation errors
   - `ServerError` - Server-side errors
   - Type guards and utility functions

## Error Flow

### 1. Frontend Error Occurrence

```
User Action → Error Occurs → Error Boundary Catches
  ↓
Generate Correlation ID
  ↓
Log to Error Service
  ↓
Display User-Friendly UI
  ↓
(Optional) User Reports Issue
  ↓
Create GitHub Issue via Backend API
```

### 2. Backend Error Occurrence

```
Request → Controller/Service → Error Thrown
  ↓
Exception Filter Catches
  ↓
Generate Correlation ID
  ↓
Log to Logging Service
  ↓
Track in Error Tracking Service
  ↓
Check Severity & Frequency
  ↓
(If Critical/High) Mark for GitHub Reporting
  ↓
Return Error Response to Client
```

### 3. GitHub Issue Creation

```
Error Tracked → Severity Check → Frequency Check
  ↓
Generate Error Fingerprint
  ↓
Search for Existing Issues
  ↓
If Exists: Add Comment
If Not: Create New Issue
  ↓
Label with Severity & Type
  ↓
Include Full Context & Stack Trace
  ↓
Update Error Tracking Record
```

## Configuration

### Environment Variables

```env
# GitHub Integration
GITHUB_TOKEN=ghp_xxxxxxxxxxxxx
GITHUB_REPO=username/repository
GITHUB_ISSUE_REPORTING_ENABLED=true

# Error Tracking
ERROR_REPORT_THRESHOLD=5  # Number of occurrences before creating GitHub issue
ERROR_CACHE_TTL=3600000   # 1 hour in milliseconds
MAX_ERROR_CACHE_SIZE=1000

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=/var/log/lexiflow
LOG_ROTATION_SIZE=10M
LOG_ROTATION_FILES=5
```

### GitHub Token Setup

1. Go to GitHub Settings → Developer Settings → Personal Access Tokens
2. Generate new token (classic) with permissions:
   - `repo` - Full control of private repositories
   - `public_repo` - Access public repositories (if needed)
3. Set token in environment variable: `GITHUB_TOKEN`
4. Set repository in format: `GITHUB_REPO=owner/repository`

## Error Severity Classification

### CRITICAL
- Database connection failures
- External payment service failures
- AI service unavailability
- Data corruption or loss
- Security breaches

**Action:** Immediately create GitHub issue and alert team

### HIGH
- Server errors (5xx)
- External service timeouts
- File processing failures
- Authentication service failures

**Action:** Create GitHub issue after threshold reached (default: 5 occurrences)

### MEDIUM
- Authorization failures (403)
- Rate limiting
- Business logic validation failures

**Action:** Log and track, manual review

### LOW
- Input validation errors
- Not found errors (404)
- Client-side rendering issues

**Action:** Log only

## Error Fingerprinting

Errors are fingerprinted using:
- Error name
- Error message (first 100 chars)
- First line of stack trace
- Context (first 50 chars of JSON)

This prevents duplicate GitHub issues for the same error.

## Best Practices

### For Developers

1. **Always use custom exceptions:**
   ```typescript
   throw new NotFoundException('Case', caseId);
   throw new ValidationException('Invalid email format');
   ```

2. **Include context:**
   ```typescript
   throw new DatabaseException('query', 'Connection timeout', correlationId, {
     query: 'SELECT * FROM cases',
     timeout: 5000
   });
   ```

3. **Use correlation IDs for tracking:**
   ```typescript
   const correlationId = request.headers['x-correlation-id'];
   logger.logError('Error occurred', error, correlationId);
   ```

4. **Log at appropriate levels:**
   ```typescript
   logger.debug('User search query', { query });
   logger.info('Case created', { caseId });
   logger.warn('Rate limit approaching', { userId, count });
   logger.error('Database query failed', error.stack);
   logger.fatal('Server cannot start', error.stack);
   ```

### For Error Handling

1. **Frontend:**
   ```typescript
   try {
     await apiCall();
   } catch (error) {
     errorService.logError({
       error,
       correlationId: generateId(),
       context: { userId, action: 'createCase' }
     });

     // Show user-friendly message
     showNotification(errorUtils.getUserFriendlyMessage(error));
   }
   ```

2. **Backend:**
   ```typescript
   try {
     await databaseOperation();
   } catch (error) {
     throw new DatabaseException(
       'insert',
       error.message,
       correlationId,
       { table: 'cases', data }
     );
   }
   ```

## Monitoring and Analytics

### Error Statistics Endpoint
```
GET /api/errors/statistics
```

Returns:
- Total errors
- Errors by severity
- Errors by fingerprint
- Recent error count
- Unique error count

### Recent Errors Endpoint
```
GET /api/errors/recent?limit=50
```

### Error by Correlation ID
```
GET /api/errors/:correlationId
```

### GitHub Issue Status
```
GET /api/errors/github-status
```

## Testing Error Handling

### Manual Testing

1. **Trigger validation error:**
   ```bash
   curl -X POST /api/cases -d '{"invalid": "data"}'
   ```

2. **Trigger authentication error:**
   ```bash
   curl -X GET /api/cases -H "Authorization: Bearer invalid_token"
   ```

3. **Trigger server error:**
   ```bash
   curl -X GET /api/cases/simulate-error
   ```

### Automated Testing

```typescript
describe('Error Handling', () => {
  it('should create GitHub issue for critical errors', async () => {
    // Simulate critical error
    const error = new DatabaseException('query', 'Connection failed');

    // Track error multiple times to exceed threshold
    for (let i = 0; i < 5; i++) {
      await errorTrackingService.trackError({...});
    }

    // Verify GitHub issue was created
    expect(githubIssueService.createIssue).toHaveBeenCalled();
  });
});
```

## Troubleshooting

### GitHub Issues Not Being Created

1. Check `GITHUB_ISSUE_REPORTING_ENABLED=true`
2. Verify `GITHUB_TOKEN` is valid
3. Verify `GITHUB_REPO` format is correct
4. Check error severity is HIGH or CRITICAL
5. Verify threshold is met (default: 5 occurrences)
6. Check backend logs for GitHub API errors

### Errors Not Being Logged

1. Verify logging service is properly initialized
2. Check log file permissions
3. Verify log level configuration
4. Check console for transport errors

### Frontend Errors Not Reaching Backend

1. Verify API URL is correct
2. Check CORS configuration
3. Verify network connectivity
4. Check browser console for errors

## Future Enhancements

1. **Slack Integration** - Send critical errors to Slack channel
2. **Email Notifications** - Email alerts for critical errors
3. **Error Analytics Dashboard** - Visual dashboard for error trends
4. **Automated Error Resolution** - ML-based error categorization and suggested fixes
5. **Error Replay** - Ability to replay errors in development environment
6. **Performance Monitoring** - APM integration (New Relic, DataDog)
7. **User Feedback Loop** - Collect user feedback on errors
8. **Error Budget Tracking** - SLO/SLA compliance monitoring

## References

- [NestJS Exception Filters](https://docs.nestjs.com/exception-filters)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [GitHub Issues API](https://docs.github.com/en/rest/issues)
- [Structured Logging Best Practices](https://www.loggly.com/ultimate-guide/node-logging-basics/)
