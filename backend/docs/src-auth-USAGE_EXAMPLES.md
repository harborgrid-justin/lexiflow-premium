# JWT Token Blacklist - Usage Examples

## Quick Start

### 1. Apply Guard to Protected Routes

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, TokenBlacklistGuard } from './auth/guards';
import { CurrentUser } from './auth/decorators';

@Controller('api/cases')
export class CasesController {
  // Apply both guards - ORDER MATTERS!
  // JwtAuthGuard first validates token, then TokenBlacklistGuard checks blacklist
  @UseGuards(JwtAuthGuard, TokenBlacklistGuard)
  @Get()
  async findAll(@CurrentUser('id') userId: string) {
    return { message: 'Protected route with blacklist check' };
  }
}
```

### 2. User Logout (Automatic Blacklisting)

```typescript
// Frontend
const logout = async () => {
  try {
    const response = await fetch('/api/v1/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (response.ok) {
      // Token is now blacklisted
      // Clear local storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  } catch (error) {
    console.error('Logout failed:', error);
  }
};
```

### 3. Password Change (All Tokens Invalidated)

```typescript
// Frontend
const changePassword = async (currentPassword: string, newPassword: string) => {
  try {
    const response = await fetch('/api/v1/auth/change-password', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });

    if (response.ok) {
      // All tokens for this user are now blacklisted
      // User must re-authenticate
      window.location.href = '/login';
    }
  } catch (error) {
    console.error('Password change failed:', error);
  }
};
```

## Admin Operations

### 1. View Blacklist Statistics

```typescript
// GET /api/v1/admin/blacklist/stats
// Requires: SUPER_ADMIN or ADMINISTRATOR role

const getBlacklistStats = async () => {
  const response = await fetch('/api/v1/admin/blacklist/stats', {
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });

  const data = await response.json();
  console.log(data);
  // Output:
  // {
  //   message: 'Blacklist statistics retrieved successfully',
  //   data: {
  //     storage: 'redis',
  //     size: 1250,
  //     useRedis: true
  //   }
  // }
};
```

### 2. Revoke All User Tokens (Emergency)

```typescript
// POST /api/v1/admin/blacklist/user/:userId/revoke
// Use case: Compromised account, forced logout

const revokeUserTokens = async (userId: string) => {
  const response = await fetch(`/api/v1/admin/blacklist/user/${userId}/revoke`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });

  const data = await response.json();
  console.log(data);
  // Output:
  // {
  //   message: 'All tokens for user abc-123 have been revoked',
  //   userId: 'abc-123',
  //   timestamp: '2024-12-16T12:00:00Z'
  // }
};
```

### 3. Blacklist Specific Token

```typescript
// POST /api/v1/admin/blacklist/token/revoke
// Use case: Revoke a specific compromised token

const blacklistSpecificToken = async (jti: string, expiresAt: string) => {
  const response = await fetch('/api/v1/admin/blacklist/token/revoke', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ jti, expiresAt })
  });

  const data = await response.json();
  console.log(data);
  // Output:
  // {
  //   message: 'Token blacklisted successfully',
  //   jti: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  //   expiresAt: '2024-12-16T12:15:00Z',
  //   timestamp: '2024-12-16T12:00:00Z'
  // }
};
```

### 4. Check Token Status

```typescript
// GET /api/v1/admin/blacklist/token/:jti/status
// Use case: Verify if a token is blacklisted

const checkTokenStatus = async (jti: string) => {
  const response = await fetch(`/api/v1/admin/blacklist/token/${jti}/status`, {
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });

  const data = await response.json();
  console.log(data);
  // Output:
  // {
  //   jti: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  //   isBlacklisted: true,
  //   checkedAt: '2024-12-16T12:00:00Z'
  // }
};
```

### 5. Manual Cleanup Trigger

```typescript
// POST /api/v1/admin/blacklist/cleanup
// Use case: Force cleanup of expired entries (in-memory only)

const triggerCleanup = async () => {
  const response = await fetch('/api/v1/admin/blacklist/cleanup', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });

  const data = await response.json();
  console.log(data);
  // Output:
  // {
  //   message: 'Cleanup completed successfully',
  //   data: {
  //     cleanedCount: 42,
  //     stats: {
  //       storage: 'memory',
  //       size: 108,
  //       useRedis: false
  //     }
  //   }
  // }
};
```

## Backend Service Usage

### 1. Direct Service Usage in Controllers

```typescript
import { Injectable } from '@nestjs/common';
import { TokenBlacklistService } from './auth/token-blacklist.service';

@Injectable()
export class SecurityService {
  constructor(private tokenBlacklist: TokenBlacklistService) {}

  // Revoke all tokens after detecting suspicious activity
  async handleSecurityIncident(userId: string): Promise<void> {
    await this.tokenBlacklist.blacklistUserTokens(userId);
    console.log(`Security incident: All tokens revoked for user ${userId}`);
    // Send notification, log event, etc.
  }

  // Check if a token should be trusted
  async validateTokenTrust(jti: string): Promise<boolean> {
    const isBlacklisted = await this.tokenBlacklist.isBlacklisted(jti);
    return !isBlacklisted;
  }
}
```

### 2. Custom Guard with Additional Checks

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { TokenBlacklistService } from '../auth/token-blacklist.service';

@Injectable()
export class EnhancedSecurityGuard implements CanActivate {
  constructor(private tokenBlacklist: TokenBlacklistService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const jti = request.user?.jti;

    if (!jti) {
      return true; // Let other guards handle this
    }

    // Check blacklist
    const isBlacklisted = await this.tokenBlacklist.isBlacklisted(jti);
    if (isBlacklisted) {
      return false;
    }

    // Additional custom checks
    // e.g., IP address validation, device fingerprinting, etc.

    return true;
  }
}
```

### 3. Scheduled Task Integration

```typescript
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TokenBlacklistService } from './auth/token-blacklist.service';

@Injectable()
export class SecurityMaintenanceService {
  constructor(private tokenBlacklist: TokenBlacklistService) {}

  // Daily security audit
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async performSecurityAudit() {
    const stats = await this.tokenBlacklist.getStats();

    if (stats.size > 10000) {
      console.warn(`High blacklist size detected: ${stats.size} entries`);
      // Alert security team
    }

    if (!stats.useRedis) {
      console.warn('Token blacklist is using in-memory storage (not production-ready)');
      // Alert DevOps team
    }
  }
}
```

## Error Handling

### 1. Handling Blacklisted Token Errors

```typescript
// Frontend interceptor
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      const message = error.response?.data?.message;

      if (message?.includes('revoked')) {
        // Token was blacklisted
        console.log('Token has been revoked');
        // Clear tokens and redirect to login
        localStorage.clear();
        window.location.href = '/login?reason=token_revoked';
      }
    }

    return Promise.reject(error);
  }
);
```

### 2. Backend Error Response

```typescript
// When a blacklisted token is detected, the guard returns:
{
  statusCode: 401,
  message: 'Token has been revoked',
  error: 'Unauthorized'
}

// Or for user-level blacklist:
{
  statusCode: 401,
  message: 'Token has been revoked due to security event',
  error: 'Unauthorized'
}
```

## Integration with Existing Systems

### 1. WebSocket Authentication

```typescript
import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { TokenBlacklistService } from './auth/token-blacklist.service';

@Injectable()
export class WsAuthService {
  constructor(
    private jwtService: JwtService,
    private tokenBlacklist: TokenBlacklistService
  ) {}

  async validateConnection(client: Socket): Promise<boolean> {
    try {
      const token = client.handshake.auth.token;
      const payload = this.jwtService.verify(token);

      // Check if token is blacklisted
      const isBlacklisted = await this.tokenBlacklist.isBlacklisted(payload.jti);
      if (isBlacklisted) {
        throw new WsException('Token has been revoked');
      }

      return true;
    } catch (error) {
      client.disconnect();
      return false;
    }
  }
}
```

### 2. GraphQL Context Authentication

```typescript
import { Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { TokenBlacklistService } from './auth/token-blacklist.service';

@Injectable()
export class GqlAuthGuard {
  constructor(private tokenBlacklist: TokenBlacklistService) {}

  async canActivate(context: GqlExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const user = request.user;

    if (!user?.jti) {
      return true;
    }

    // Check blacklist
    const isBlacklisted = await this.tokenBlacklist.isBlacklisted(user.jti);
    if (isBlacklisted) {
      return false;
    }

    return true;
  }
}
```

## Testing Examples

### 1. Unit Test - TokenBlacklistService

```typescript
import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { TokenBlacklistService } from './token-blacklist.service';

describe('TokenBlacklistService', () => {
  let service: TokenBlacklistService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TokenBlacklistService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key, defaultValue) => defaultValue),
          },
        },
      ],
    }).compile();

    service = module.get<TokenBlacklistService>(TokenBlacklistService);
  });

  it('should blacklist a token', async () => {
    const jti = 'test-jti-123';
    const expiresAt = new Date(Date.now() + 900000); // 15 minutes

    await service.blacklistToken(jti, expiresAt);
    const isBlacklisted = await service.isBlacklisted(jti);

    expect(isBlacklisted).toBe(true);
  });

  it('should not return expired tokens as blacklisted', async () => {
    const jti = 'expired-jti-456';
    const expiresAt = new Date(Date.now() - 1000); // Already expired

    await service.blacklistToken(jti, expiresAt);
    const isBlacklisted = await service.isBlacklisted(jti);

    expect(isBlacklisted).toBe(false);
  });

  it('should blacklist all user tokens', async () => {
    const userId = 'user-789';
    await service.blacklistUserTokens(userId);

    // Verify by checking stats
    const stats = await service.getStats();
    expect(stats.size).toBeGreaterThan(0);
  });
});
```

### 2. E2E Test - Logout Flow

```typescript
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Authentication (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should reject blacklisted tokens after logout', async () => {
    // 1. Login
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      })
      .expect(200);

    accessToken = loginResponse.body.accessToken;

    // 2. Verify token works
    await request(app.getHttpServer())
      .get('/api/v1/auth/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    // 3. Logout (blacklist token)
    await request(app.getHttpServer())
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    // 4. Try to use token again
    const response = await request(app.getHttpServer())
      .get('/api/v1/auth/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(401);

    expect(response.body.message).toContain('revoked');
  });

  afterAll(async () => {
    await app.close();
  });
});
```

## Best Practices

### 1. Always Apply Guards in Correct Order

```typescript
// ✅ CORRECT - JwtAuthGuard validates first, then TokenBlacklistGuard checks blacklist
@UseGuards(JwtAuthGuard, TokenBlacklistGuard)
@Get('protected')
protectedRoute() { }

// ❌ WRONG - TokenBlacklistGuard runs before token is validated
@UseGuards(TokenBlacklistGuard, JwtAuthGuard)
@Get('protected')
protectedRoute() { }
```

### 2. Handle Token Revocation Gracefully

```typescript
// ✅ CORRECT - Clear tokens and notify user
if (error.response?.data?.message?.includes('revoked')) {
  localStorage.clear();
  showNotification('Your session has been revoked. Please log in again.');
  router.push('/login');
}

// ❌ WRONG - Silent failure confuses users
if (error.response?.status === 401) {
  // Do nothing
}
```

### 3. Use Short-Lived Tokens

```typescript
// ✅ CORRECT - Short access token, long refresh token
JWT_EXPIRES_IN=900              # 15 minutes
JWT_REFRESH_EXPIRES_IN=604800   # 7 days

// ❌ WRONG - Long-lived access tokens defeat blacklist purpose
JWT_EXPIRES_IN=86400            # 24 hours
```

### 4. Monitor Blacklist Size

```typescript
// ✅ CORRECT - Regular monitoring
@Cron(CronExpression.EVERY_HOUR)
async checkBlacklistHealth() {
  const stats = await this.tokenBlacklist.getStats();
  if (stats.size > 50000) {
    this.alertService.send('High blacklist size detected');
  }
}
```

## Troubleshooting Guide

### Issue: Token not blacklisted after logout
**Solution**: Verify guard is applied and JTI is present in token payload

### Issue: High latency on protected routes
**Solution**: Ensure Redis is used in production, not in-memory storage

### Issue: Tokens work after password change
**Solution**: Verify user-level blacklist is being checked in guard

### Issue: Redis connection failures
**Solution**: System automatically falls back to in-memory, but fix Redis ASAP
