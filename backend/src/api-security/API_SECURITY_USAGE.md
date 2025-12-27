# LexiFlow API Security - Usage Guide

## Overview

This comprehensive API security implementation provides enterprise-grade security features for the LexiFlow Premium application, including:

- **Enhanced API Key Management**: Scoped permissions, IP whitelisting, usage quotas, and automatic rotation
- **Rate Limiting**: Tiered rate limiting with sliding window algorithm and Redis backend
- **Request Validation**: Deep validation, SQL injection detection, and XSS prevention
- **Request Signing**: HMAC-SHA256 signing with replay attack prevention
- **Webhook Security**: Payload signing, signature verification, and delivery tracking

## Table of Contents

1. [API Key Management](#api-key-management)
2. [Rate Limiting](#rate-limiting)
3. [API Key Scope Guard](#api-key-scope-guard)
4. [Request Validation](#request-validation)
5. [Request Signing](#request-signing)
6. [Webhook Security](#webhook-security)

---

## API Key Management

### Creating API Keys with Advanced Features

```typescript
import { ApiKeyService } from './api-keys/services/api.key.service';
import { ApiKeyScope, ApiKeyRotationPolicy } from './api-security/dto';

// Inject the service
constructor(private readonly apiKeyService: ApiKeyService) {}

// Create an API key with comprehensive security settings
const apiKey = await this.apiKeyService.create({
  name: 'Production API Key',
  description: 'API key for production document processing',
  scopes: [
    ApiKeyScope.DOCUMENTS_READ,
    ApiKeyScope.DOCUMENTS_WRITE,
    ApiKeyScope.CASES_READ,
  ],
  ipWhitelist: ['203.0.113.0', '198.51.100.0'],
  expiresAt: new Date('2026-12-31'),
  rateLimit: 5000, // requests per hour
  dailyQuota: 100000, // requests per day
  monthlyQuota: 2000000, // requests per month
  rotationPolicy: ApiKeyRotationPolicy.QUARTERLY,
  rotationRemindersEnabled: true,
  rotationReminderDays: 30, // remind 30 days before expiration
}, userId);

// The key is only shown once
console.log(apiKey.key); // "sk_lx_..."
```

### Validating API Keys with Options

```typescript
// Validate with scope and IP checking
const validatedKey = await this.apiKeyService.validate(apiKey, {
  requiredScopes: [ApiKeyScope.DOCUMENTS_READ],
  clientIp: '203.0.113.0',
});
```

### Rotating API Keys

```typescript
// Rotate an API key
const rotatedKey = await this.apiKeyService.rotate(keyId, userId);
console.log(rotatedKey.key); // New key is returned
```

### Getting Usage Statistics

```typescript
const stats = await this.apiKeyService.getUsageStats(keyId, userId);
console.log(stats);
// {
//   id: 'key_...',
//   name: 'Production API Key',
//   totalRequests: 150000,
//   currentHourRequests: 45,
//   todayRequests: 1200,
//   monthRequests: 45000,
//   rateLimit: 5000,
//   dailyQuota: 100000,
//   monthlyQuota: 2000000,
//   rateLimitUsagePercentage: 0.9,
//   dailyQuotaUsagePercentage: 1.2,
//   monthlyQuotaUsagePercentage: 2.25
// }
```

---

## Rate Limiting

### Using the Rate Limit Service

```typescript
import { RateLimitService, UserRole } from './api-security/services';

constructor(private readonly rateLimitService: RateLimitService) {}

// Check role-based rate limit
const result = await this.rateLimitService.checkRoleBased(userId, UserRole.ENTERPRISE);
if (!result.allowed) {
  throw new Error(`Rate limit exceeded. Retry after ${result.retryAfter} seconds`);
}

// Check endpoint-specific rate limit
const endpointResult = await this.rateLimitService.checkEndpointLimit(
  '/api/v1/documents/upload',
  userId
);

// Check IP-based rate limit
const ipResult = await this.rateLimitService.checkIpLimit(clientIp);

// Check burst protection
const burstResult = await this.rateLimitService.checkBurst(userId, UserRole.PROFESSIONAL);
```

### Custom Rate Limits

```typescript
// Set custom endpoint limit
this.rateLimitService.setEndpointLimit('/api/v1/custom-endpoint', {
  limit: 50,
  windowMs: 60000, // 50 requests per minute
  burstLimit: 10,
});

// Set custom role limit
this.rateLimitService.setRoleLimit(UserRole.ENTERPRISE, {
  limit: 1000,
  windowMs: 60000, // 1000 requests per minute
  burstLimit: 150,
});
```

---

## API Key Scope Guard

### Protecting Endpoints with API Key Authentication

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiKeyScopeGuard, RequiredScopes, SkipApiKeyAuth } from './api-security/guards';
import { ApiKeyScope } from './api-security/dto';

@Controller('documents')
@UseGuards(ApiKeyScopeGuard)
export class DocumentsController {
  // Require specific scopes
  @Get()
  @RequiredScopes(ApiKeyScope.DOCUMENTS_READ)
  async findAll() {
    // This endpoint requires DOCUMENTS_READ scope
    // IP whitelist and quotas are automatically checked
  }

  @Post()
  @RequiredScopes(ApiKeyScope.DOCUMENTS_WRITE)
  async create() {
    // This endpoint requires DOCUMENTS_WRITE scope
  }

  @Delete(':id')
  @RequiredScopes(ApiKeyScope.DOCUMENTS_DELETE, ApiKeyScope.ADMIN)
  async delete() {
    // This endpoint requires DOCUMENTS_DELETE OR ADMIN scope
  }

  @Get('public')
  @SkipApiKeyAuth()
  async getPublic() {
    // This endpoint skips API key authentication
  }
}
```

### Accessing API Key Info in Controllers

```typescript
@Get('info')
@RequiredScopes(ApiKeyScope.READ)
async getInfo(@Request() req) {
  // API key info is attached to the request
  console.log(req.apiKey);
  // {
  //   id: 'key_...',
  //   name: 'Production API Key',
  //   scopes: ['documents:read', 'documents:write'],
  //   userId: 'user_...'
  // }
}
```

---

## Request Validation

### Deep Validation and Sanitization

```typescript
import { RequestValidationService } from './api-security/services';

constructor(private readonly validationService: RequestValidationService) {}

// Validate and sanitize user input
const sanitized = this.validationService.validateAndSanitize(userInput, {
  maxDepth: 10,
  maxArrayLength: 1000,
  maxStringLength: 10000,
});
// Automatically checks for SQL injection, XSS, path traversal, and command injection
```

### Schema Validation with Joi

```typescript
import * as Joi from 'joi';

// Create a schema
const schema = this.validationService.createJoiSchema({
  name: { type: 'string', required: true, min: 3, max: 100 },
  email: { type: 'string', required: true, email: true },
  age: { type: 'number', required: false, min: 18, max: 120, integer: true },
  roles: { type: 'array', required: true, min: 1 },
});

// Validate with schema
const result = this.validationService.validateWithSchema(data, schema);
if (!result.valid) {
  throw new BadRequestException(result.errors?.join(', '));
}
```

### Security Checks

```typescript
// Check for SQL injection
if (this.validationService.detectSqlInjection(userInput)) {
  throw new BadRequestException('SQL injection detected');
}

// Check for XSS
if (this.validationService.detectXss(userInput)) {
  throw new BadRequestException('XSS attempt detected');
}

// Sanitize HTML
const safe = this.validationService.sanitizeHtml(userInput);
```

### Business Rule Validation

```typescript
import { BusinessRule } from './api-security/services';

const rules: BusinessRule[] = [
  {
    name: 'ValidDateRange',
    validate: (data) => {
      if (data.startDate > data.endDate) {
        return { valid: false, message: 'Start date must be before end date' };
      }
      return { valid: true };
    },
  },
];

const result = this.validationService.validateBusinessRules(data, rules);
```

---

## Request Signing

### Protecting Endpoints with Request Signing

```typescript
import { Controller, Post, UseInterceptors } from '@nestjs/common';
import { RequireSignature, SkipSignature } from './api-security/interceptors';

@Controller('webhooks')
export class WebhooksController {
  @Post('receive')
  @RequireSignature()
  async receiveWebhook(@Body() payload: any) {
    // This endpoint requires valid HMAC-SHA256 signature
    // Headers required: X-Signature, X-Timestamp, X-Nonce
    // Automatically prevents replay attacks
  }

  @Post('public')
  @SkipSignature()
  async publicEndpoint() {
    // This endpoint skips signature verification
  }
}
```

### Client-Side Request Signing

```typescript
import { RequestSigningInterceptor } from './api-security/interceptors';

// Generate signature headers for a request
const headers = interceptor.createSignatureHeaders(
  'POST',
  '/api/v1/webhooks/receive',
  { event: 'document.created', data: { id: '123' } },
  '',
  'your-secret-key'
);

// Make request with headers
axios.post('/api/v1/webhooks/receive', payload, {
  headers: {
    'X-Signature': headers.signature,
    'X-Timestamp': headers.timestamp,
    'X-Nonce': headers.nonce,
  },
});
```

---

## Webhook Security

### Setting Up Webhooks

```typescript
import { WebhookSecurityService, WebhookConfig } from './api-security/services';

constructor(private readonly webhookService: WebhookSecurityService) {}

// Register a webhook
const config: WebhookConfig = {
  id: 'webhook_1',
  url: 'https://example.com/webhooks',
  secret: 'your-webhook-secret',
  events: ['document.created', 'document.updated', 'case.created'],
  active: true,
  maxRetries: 3,
  timeoutMs: 10000,
};

this.webhookService.registerWebhook(config);
```

### Sending Webhooks

```typescript
// Send a webhook with automatic retry and delivery tracking
const delivery = await this.webhookService.sendWebhook(
  'webhook_1',
  'document.created',
  { id: '123', name: 'Contract.pdf' },
  { userId: 'user_456' }
);

console.log(delivery.status); // 'delivered', 'failed', 'retrying', or 'pending'
```

### Tracking Webhook Deliveries

```typescript
// Get delivery stats
const stats = this.webhookService.getDeliveryStats('webhook_1');
console.log(stats);
// {
//   total: 150,
//   delivered: 145,
//   failed: 2,
//   pending: 1,
//   retrying: 2,
//   successRate: 96.67
// }

// Get recent deliveries
const deliveries = this.webhookService.getRecentDeliveries(50);

// Retry a failed delivery
await this.webhookService.retryDelivery(deliveryId);
```

### Verifying Incoming Webhooks

```typescript
@Post('receive')
async receiveWebhook(@Body() payload: any, @Headers() headers: any) {
  const signature = headers['x-webhook-signature'];
  const timestamp = headers['x-webhook-timestamp'];
  const payloadString = JSON.stringify(payload);

  const isValid = this.webhookService.verifyWebhookRequest(
    payloadString,
    signature,
    'your-secret',
    timestamp
  );

  if (!isValid) {
    throw new UnauthorizedException('Invalid webhook signature');
  }

  // Process webhook
}
```

---

## Module Integration

### Import the API Security Module

```typescript
import { Module } from '@nestjs/common';
import { ApiSecurityModule } from './api-security/api.security.module';

@Module({
  imports: [
    ApiSecurityModule,
    // ... other modules
  ],
})
export class AppModule {}
```

---

## Environment Variables

Make sure to set these environment variables:

```bash
# Redis (required for distributed rate limiting and nonce tracking)
REDIS_URL=redis://localhost:6379

# Webhook signing secret
WEBHOOK_SIGNING_SECRET=your-secret-key-here
```

---

## Security Best Practices

1. **API Keys**:
   - Always use scoped API keys with minimum required permissions
   - Enable IP whitelisting for production keys
   - Set appropriate rate limits and quotas
   - Enable rotation policies and reminders

2. **Rate Limiting**:
   - Use tiered rate limits based on user roles
   - Set stricter limits on sensitive endpoints (auth, delete, bulk operations)
   - Monitor rate limit usage to detect abuse

3. **Request Validation**:
   - Always validate and sanitize user input
   - Use schema validation for complex objects
   - Enable SQL injection and XSS detection

4. **Request Signing**:
   - Use request signing for webhook endpoints
   - Verify timestamps to prevent replay attacks
   - Track nonces to prevent duplicate requests

5. **Webhooks**:
   - Always verify webhook signatures
   - Use HTTPS for webhook URLs
   - Monitor delivery success rates
   - Implement exponential backoff for retries

---

## Production Deployment Notes

1. **Redis**: Ensure Redis is properly configured and highly available
2. **Secrets**: Store API key secrets and webhook signing secrets securely
3. **Monitoring**: Monitor rate limit usage, API key quotas, and webhook delivery rates
4. **Logging**: Enable comprehensive logging for security events
5. **Alerts**: Set up alerts for suspicious activity (rate limit violations, invalid signatures)

---

## Support

For issues or questions, contact the LexiFlow development team.
