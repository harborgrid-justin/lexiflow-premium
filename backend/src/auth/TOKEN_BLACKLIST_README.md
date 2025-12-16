# JWT Token Blacklist Implementation

## Overview

This implementation adds secure JWT token revocation capabilities to LexiFlow Premium through token blacklisting. When a user logs out, changes their password, or an admin revokes access, their tokens are immediately invalidated.

## Architecture

### Components

1. **TokenBlacklistService** (`token-blacklist.service.ts`)
   - Manages blacklisted tokens
   - Supports Redis (preferred) and in-memory fallback
   - Handles both individual token and user-level blacklisting
   - Automatic TTL-based cleanup

2. **TokenBlacklistGuard** (`guards/token-blacklist.guard.ts`)
   - Checks if tokens are blacklisted before granting access
   - Validates both individual token JTI and user-level blacklist timestamps
   - Backwards compatible with tokens without JTI

3. **TokenBlacklistCleanupService** (`token-blacklist-cleanup.service.ts`)
   - Scheduled cleanup job (runs every hour)
   - Removes expired entries from in-memory storage
   - Redis handles cleanup automatically via TTL

## Storage Strategy

### Redis (Production)
- **Recommended for production use**
- Distributed storage across multiple instances
- Automatic TTL-based expiration
- Fast O(1) lookups
- Persistent across server restarts

```bash
# Redis keys structure
blacklist:token:{jti}      # Individual token blacklist
blacklist:user:{userId}    # User-level blacklist timestamp
```

### In-Memory (Development/Fallback)
- **Development and testing only**
- Lost on server restart
- Does not scale across multiple instances
- Periodic cleanup required

## Usage

### 1. Apply the Guard

#### Option A: Apply to Specific Routes (Recommended)
```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard, TokenBlacklistGuard } from './auth/guards';

@Controller('api/protected')
export class ProtectedController {
  @UseGuards(JwtAuthGuard, TokenBlacklistGuard)
  @Get('sensitive')
  sensitiveRoute() {
    return { message: 'This route checks token blacklist' };
  }
}
```

#### Option B: Apply Globally
```typescript
// In main.ts
import { TokenBlacklistGuard } from './auth/guards/token-blacklist.guard';
import { TokenBlacklistService } from './auth/token-blacklist.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get services from DI container
  const tokenBlacklistService = app.get(TokenBlacklistService);
  const jwtService = app.get(JwtService);
  const configService = app.get(ConfigService);

  // Apply globally
  app.useGlobalGuards(
    new TokenBlacklistGuard(tokenBlacklistService, jwtService, configService)
  );

  await app.listen(3000);
}
```

### 2. User Logout (Token Invalidation)

```typescript
// POST /api/v1/auth/logout
// Automatically blacklists the current access token
const response = await fetch('/api/v1/auth/logout', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

### 3. Password Change (All Tokens Invalidated)

```typescript
// POST /api/v1/auth/change-password
// Automatically invalidates all user tokens
await authService.changePassword(userId, currentPassword, newPassword);
// All existing tokens are now blacklisted
```

### 4. Manual Token Revocation

```typescript
// Blacklist a specific token
await tokenBlacklistService.blacklistToken(jti, expiresAt);

// Blacklist all tokens for a user
await tokenBlacklistService.blacklistUserTokens(userId);
```

## Configuration

### Environment Variables

```bash
# Redis Configuration (Optional - falls back to in-memory if not available)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password  # Optional

# JWT Configuration (Required)
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=900              # 15 minutes in seconds
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=604800   # 7 days in seconds
```

### Redis Connection

The system automatically attempts to connect to Redis on startup:
- ✅ Success: Uses Redis for distributed blacklist storage
- ⚠️  Failure: Falls back to in-memory storage with warning

## Security Considerations

### Token Format
All new tokens include:
- `jti`: Unique token identifier (UUID v4)
- `iat`: Issued at timestamp
- `exp`: Expiration timestamp
- `sub`: User ID
- `type`: Token type ('access' or 'refresh')

### Backwards Compatibility
Tokens issued before this implementation (without JTI):
- Still function normally
- Cannot be individually blacklisted
- User-level blacklisting still works

### Performance Impact
- **Redis lookup**: ~1-2ms overhead per request
- **In-memory lookup**: <1ms overhead per request
- **Recommendation**: Use Redis in production for minimal latency

## Monitoring

### Get Blacklist Statistics

```typescript
const stats = await tokenBlacklistService.getStats();
console.log(stats);
// Output: { storage: 'redis', size: 150, useRedis: true }
```

### Manual Cleanup Trigger

```typescript
const result = await tokenBlacklistCleanupService.triggerManualCleanup();
console.log(result);
// Output: { cleanedCount: 42, stats: { storage: 'memory', size: 108, useRedis: false } }
```

## Scheduled Jobs

The cleanup service runs automatically:
- **Frequency**: Every hour (`CronExpression.EVERY_HOUR`)
- **Purpose**: Remove expired entries from in-memory storage
- **Note**: Redis handles expiration automatically via TTL

## Testing

### Unit Tests
```typescript
describe('TokenBlacklistService', () => {
  it('should blacklist a token', async () => {
    const jti = 'test-jti-123';
    const expiresAt = new Date(Date.now() + 900000); // 15 minutes
    await service.blacklistToken(jti, expiresAt);
    expect(await service.isBlacklisted(jti)).toBe(true);
  });

  it('should blacklist all user tokens', async () => {
    const userId = 'user-123';
    await service.blacklistUserTokens(userId);
    // All tokens issued before this point are now invalid
  });
});
```

### E2E Tests
```typescript
describe('Authentication (e2e)', () => {
  it('should reject blacklisted tokens', async () => {
    // Login
    const { accessToken } = await login();

    // Logout (blacklists token)
    await logout(accessToken);

    // Try to access protected route
    const response = await request(app.getHttpServer())
      .get('/api/v1/auth/profile')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(401);
    expect(response.body.message).toContain('revoked');
  });
});
```

## Migration Path

### Phase 1: Deploy (Non-Breaking)
- All new tokens include JTI
- Old tokens without JTI continue to work
- Blacklist guard is lenient for backwards compatibility

### Phase 2: Monitor
- Track percentage of tokens with JTI
- Monitor Redis connection stability
- Review blacklist statistics

### Phase 3: Strict Mode (Future)
- Reject tokens without JTI
- Require token regeneration

## Troubleshooting

### Issue: Tokens not being blacklisted
**Check:**
1. TokenBlacklistGuard is applied to routes
2. JTI is present in token payload
3. Redis connection is active (check logs)

### Issue: Redis connection failures
**Solution:**
```typescript
// The system automatically falls back to in-memory storage
// Check logs for: "Token blacklist using in-memory storage"
// Fix Redis connection or accept in-memory for development
```

### Issue: High memory usage
**Solution:**
```typescript
// Check blacklist size
const stats = await tokenBlacklistService.getStats();

// Trigger manual cleanup
await cleanupService.triggerManualCleanup();

// Verify Redis is being used (not in-memory)
if (!stats.useRedis) {
  // Fix Redis connection
}
```

## API Reference

### TokenBlacklistService

```typescript
class TokenBlacklistService {
  // Blacklist a single token
  blacklistToken(jti: string, expiresAt: Date): Promise<void>

  // Check if token is blacklisted
  isBlacklisted(jti: string): Promise<boolean>

  // Blacklist all user tokens (password change, etc.)
  blacklistUserTokens(userId: string): Promise<void>

  // Check if token was issued before user-level blacklist
  isUserTokenBlacklisted(userId: string, tokenIssuedAt: number): Promise<boolean>

  // Clean expired entries (in-memory only)
  cleanupExpired(): Promise<number>

  // Get statistics
  getStats(): Promise<{ storage: string; size: number; useRedis: boolean }>
}
```

## Best Practices

1. **Always use Redis in production** for distributed deployments
2. **Apply TokenBlacklistGuard after JwtAuthGuard** for proper order
3. **Monitor blacklist size** to detect potential issues
4. **Set appropriate JWT expiration times** to minimize blacklist size
5. **Use shorter-lived tokens** (15 minutes) with refresh tokens
6. **Log security events** (logout, password change, token revocation)

## Future Enhancements

- [ ] Admin API endpoint for token management
- [ ] Blacklist all tokens before a certain date
- [ ] Rate limiting on blacklist checks
- [ ] Metrics and monitoring dashboards
- [ ] Support for Redis Cluster
- [ ] Blacklist analytics and reporting
