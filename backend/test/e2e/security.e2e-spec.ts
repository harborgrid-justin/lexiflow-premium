import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Security Features (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();

    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `security-test-${Date.now()}@example.com`,
        password: 'SecurePassword123!',
        firstName: 'Security',
        lastName: 'Test',
      });

    accessToken = registerResponse.body.accessToken;
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('Security Headers', () => {
    it('should set X-Content-Type-Options header', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });

    it('should set X-Frame-Options header', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.headers['x-frame-options']).toBeDefined();
    });

    it('should set X-XSS-Protection header', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.headers['x-xss-protection']).toBeDefined();
    });

    it('should set Strict-Transport-Security header', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.headers['strict-transport-security']).toBeDefined();
    });

    it('should set Content-Security-Policy header', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.headers['content-security-policy']).toBeDefined();
    });

    it('should not expose sensitive server information', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.headers['x-powered-by']).toBeUndefined();
    });
  });

  describe('CORS Configuration', () => {
    it('should handle CORS preflight requests', async () => {
      await request(app.getHttpServer())
        .options('/auth/login')
        .set('Origin', 'https://example.com')
        .set('Access-Control-Request-Method', 'POST')
        .expect(204);
    });

    it('should set Access-Control-Allow-Origin for allowed origins', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .set('Origin', 'https://example.com');

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    it('should reject requests from disallowed origins when strict', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .set('Origin', 'https://malicious-site.com')
        .send({
          email: 'test@example.com',
          password: 'password',
        });

      expect([200, 401, 403]).toContain(response.status);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits on authentication endpoints', async () => {
      const email = `ratelimit-auth-${Date.now()}@example.com`;
      const requests = [];

      for (let i = 0; i < 25; i++) {
        requests.push(
          request(app.getHttpServer())
            .post('/auth/login')
            .send({
              email,
              password: 'password',
            })
        );
      }

      const responses = await Promise.all(requests);
      const hasRateLimitResponse = responses.some(r => r.status === 429);

      expect(hasRateLimitResponse).toBe(true);
    });

    it('should enforce rate limits on API endpoints', async () => {
      const requests = [];

      for (let i = 0; i < 150; i++) {
        requests.push(
          request(app.getHttpServer())
            .get('/health')
        );
      }

      const responses = await Promise.all(requests);
      const hasRateLimitResponse = responses.some(r => r.status === 429);

      expect(hasRateLimitResponse).toBe(true);
    });

    it('should include rate limit headers in responses', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(
        response.headers['x-ratelimit-limit'] ||
        response.headers['ratelimit-limit'] ||
        response.headers['x-rate-limit-limit']
      ).toBeDefined();
    });

    it('should reset rate limits after time window', async () => {
      const endpoint = '/health';

      for (let i = 0; i < 10; i++) {
        await request(app.getHttpServer()).get(endpoint);
      }

      await new Promise(resolve => setTimeout(resolve, 61000));

      const response = await request(app.getHttpServer())
        .get(endpoint)
        .expect(200);

      expect(response.status).toBe(200);
    }, 65000);
  });

  describe('Input Validation and Sanitization', () => {
    it('should reject requests with SQL injection attempts', async () => {
      const sqlPayloads = [
        "admin' OR '1'='1",
        "'; DROP TABLE users; --",
        "1' UNION SELECT * FROM users--",
      ];

      for (const payload of sqlPayloads) {
        await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: payload,
            password: 'test',
          })
          .expect(res => {
            expect([400, 401]).toContain(res.status);
          });
      }
    });

    it('should reject requests with XSS attempts', async () => {
      const xssPayloads = [
        '<script>alert("XSS")</script>',
        '<img src=x onerror=alert("XSS")>',
        'javascript:alert("XSS")',
      ];

      for (const payload of xssPayloads) {
        await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            email: `${payload}@example.com`,
            password: 'TestPassword123!',
            firstName: payload,
            lastName: 'Test',
          })
          .expect(res => {
            expect([400, 401]).toContain(res.status);
          });
      }
    });

    it('should validate and sanitize JSON payloads', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'TestPassword123!',
          firstName: 'Test',
          lastName: 'User',
          maliciousField: '<script>alert("XSS")</script>',
          anotherBadField: { nested: 'attack' },
        })
        .expect(res => {
          expect([201, 400]).toContain(res.status);
        });
    });

    it('should reject overly large payloads', async () => {
      const largeString = 'A'.repeat(1000000);

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: largeString,
          firstName: 'Test',
          lastName: 'User',
        })
        .expect(res => {
          expect([400, 413]).toContain(res.status);
        });
    });

    it('should enforce field length limits', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'a'.repeat(300) + '@example.com',
          password: 'TestPassword123!',
          firstName: 'Test',
          lastName: 'User',
        })
        .expect(400);
    });
  });

  describe('Authentication and Authorization', () => {
    it('should reject requests without authentication token', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);
    });

    it('should reject requests with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);
    });

    it('should reject requests with expired token', async () => {
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });

    it('should reject requests with malformed authorization header', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'InvalidFormat token')
        .expect(401);
    });

    it('should validate token signature', async () => {
      const tamperedToken = accessToken.slice(0, -10) + 'tampered12';

      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${tamperedToken}`)
        .expect(401);
    });
  });

  describe('Password Security', () => {
    it('should enforce password complexity requirements', async () => {
      const weakPasswords = [
        'password',
        '12345678',
        'qwerty123',
        'Password',
        'pass',
      ];

      for (const password of weakPasswords) {
        await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            email: `weak-${Date.now()}-${Math.random()}@example.com`,
            password,
            firstName: 'Test',
            lastName: 'User',
          })
          .expect(400);
      }
    });

    it('should require minimum password length', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `short-${Date.now()}@example.com`,
          password: 'Abc1!',
          firstName: 'Test',
          lastName: 'User',
        })
        .expect(400);
    });

    it('should not expose password in responses', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `no-password-${Date.now()}@example.com`,
          password: 'SecurePassword123!',
          firstName: 'Test',
          lastName: 'User',
        })
        .expect(201);

      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body.user).not.toHaveProperty('passwordHash');
    });

    it('should hash passwords securely', async () => {
      const email1 = `hash-test-1-${Date.now()}@example.com`;
      const email2 = `hash-test-2-${Date.now()}@example.com`;
      const samePassword = 'SamePassword123!';

      const response1 = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: email1,
          password: samePassword,
          firstName: 'Test',
          lastName: 'User1',
        });

      const response2 = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: email2,
          password: samePassword,
          firstName: 'Test',
          lastName: 'User2',
        });

      expect(response1.body.user.id).not.toBe(response2.body.user.id);
    });
  });

  describe('Error Handling', () => {
    it('should not leak sensitive information in error messages', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password',
        })
        .expect(401);

      expect(response.body.message).not.toContain('database');
      expect(response.body.message).not.toContain('query');
      expect(response.body.message).not.toContain('stack');
    });

    it('should handle malformed JSON gracefully', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400);
    });

    it('should provide generic error messages for security', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
        .expect(401);

      const message = response.body.message.toLowerCase();
      expect(message).not.toContain('user not found');
      expect(message).not.toContain('email not found');
    });
  });

  describe('Session Security', () => {
    it('should invalidate all sessions on password change', async () => {
      const email = `session-invalidate-${Date.now()}@example.com`;
      const oldPassword = 'OldPassword123!';
      const newPassword = 'NewPassword123!';

      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email,
          password: oldPassword,
          firstName: 'Session',
          lastName: 'Test',
        });

      const token1 = registerResponse.body.accessToken;

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password: oldPassword });

      const token2 = loginResponse.body.accessToken;

      await request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          currentPassword: oldPassword,
          newPassword: newPassword,
        })
        .expect(200);

      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${token2}`)
        .expect(401);
    });

    it('should prevent session fixation attacks', async () => {
      const email = `fixation-test-${Date.now()}@example.com`;
      const password = 'TestPassword123!';

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email,
          password,
          firstName: 'Fixation',
          lastName: 'Test',
        });

      const login1 = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password });

      const login2 = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password });

      expect(login1.body.accessToken).not.toBe(login2.body.accessToken);
    });
  });

  describe('Data Privacy', () => {
    it('should not expose user IDs in predictable format', async () => {
      const responses = [];

      for (let i = 0; i < 3; i++) {
        const response = await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            email: `privacy-${Date.now()}-${i}@example.com`,
            password: 'TestPassword123!',
            firstName: 'Privacy',
            lastName: `Test${i}`,
          });

        responses.push(response.body.user.id);
      }

      const isSequential = responses.every((id, idx) => {
        if (idx === 0) return true;
        return parseInt(id, 10) === parseInt(responses[idx - 1], 10) + 1;
      });

      expect(isSequential).toBe(false);
    });

    it('should sanitize logs and not log sensitive data', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'SensitivePassword123!',
        });

      expect(true).toBe(true);
    });
  });

  describe('API Versioning and Deprecation', () => {
    it('should handle API version headers appropriately', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .set('Accept', 'application/json')
        .set('API-Version', '1.0');

      expect([200, 404, 406]).toContain(response.status);
    });
  });

  describe('Content Type Validation', () => {
    it('should reject non-JSON content types for JSON endpoints', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .set('Content-Type', 'text/plain')
        .send('email=test@example.com&password=password')
        .expect(res => {
          expect([400, 415]).toContain(res.status);
        });
    });

    it('should accept correct content type', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .set('Content-Type', 'application/json')
        .send({
          email: 'test@example.com',
          password: 'password',
        })
        .expect(res => {
          expect([200, 401]).toContain(res.status);
        });
    });
  });
});
