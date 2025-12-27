import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { UserFactory } from '../factories/userFactory';

describe('Authentication Flow (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let refreshToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('User Registration Flow', () => {
    it('should register a new user successfully', async () => {
      const registerDto = {
        email: `test-${Date.now()}@example.com`,
        password: 'SecurePassword123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user.email).toBe(registerDto.email);
      expect(response.body.user.firstName).toBe(registerDto.firstName);
      expect(response.body.user.lastName).toBe(registerDto.lastName);
      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body.user).not.toHaveProperty('passwordHash');

      accessToken = response.body.accessToken;
      refreshToken = response.body.refreshToken;
      userId = response.body.user.id;
    });

    it('should reject registration with invalid email', async () => {
      const registerDto = {
        email: 'invalid-email',
        password: 'SecurePassword123!',
        firstName: 'Jane',
        lastName: 'Doe',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(400);
    });

    it('should reject registration with weak password', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: '123',
        firstName: 'Jane',
        lastName: 'Doe',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it('should reject duplicate email registration', async () => {
      const registerDto = {
        email: `duplicate-${Date.now()}@example.com`,
        password: 'SecurePassword123!',
        firstName: 'Test',
        lastName: 'User',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(400);
    });
  });

  describe('User Login Flow', () => {
    let testEmail: string;
    const testPassword = 'TestPassword123!';

    beforeAll(async () => {
      testEmail = `login-test-${Date.now()}@example.com`;
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: testEmail,
          password: testPassword,
          firstName: 'Login',
          lastName: 'Test',
        });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        })
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user.email).toBe(testEmail);
    });

    it('should reject login with invalid email', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testPassword,
        })
        .expect(401);
    });

    it('should reject login with invalid password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
          password: 'WrongPassword123!',
        })
        .expect(401);
    });

    it('should reject login with missing credentials', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
        })
        .expect(400);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          password: testPassword,
        })
        .expect(400);
    });
  });

  describe('Token Refresh Flow', () => {
    let userRefreshToken: string;

    beforeAll(async () => {
      const email = `refresh-test-${Date.now()}@example.com`;
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email,
          password: 'TestPassword123!',
          firstName: 'Refresh',
          lastName: 'Test',
        });

      userRefreshToken = response.body.refreshToken;
    });

    it('should refresh tokens with valid refresh token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken: userRefreshToken,
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.accessToken).not.toBe(userRefreshToken);
    });

    it('should reject refresh with invalid token', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken: 'invalid.refresh.token',
        })
        .expect(401);
    });

    it('should reject refresh with access token instead of refresh token', async () => {
      const email = `access-token-test-${Date.now()}@example.com`;
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email,
          password: 'TestPassword123!',
          firstName: 'Access',
          lastName: 'Test',
        });

      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken: response.body.accessToken,
        })
        .expect(401);
    });
  });

  describe('Protected Route Access', () => {
    let userAccessToken: string;

    beforeAll(async () => {
      const email = `protected-test-${Date.now()}@example.com`;
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email,
          password: 'TestPassword123!',
          firstName: 'Protected',
          lastName: 'Test',
        });

      userAccessToken = response.body.accessToken;
    });

    it('should access protected route with valid token', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(200);
    });

    it('should reject protected route without token', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);
    });

    it('should reject protected route with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);
    });

    it('should reject protected route with malformed authorization header', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', userAccessToken)
        .expect(401);
    });
  });

  describe('Logout Flow', () => {
    let logoutAccessToken: string;
    let logoutRefreshToken: string;

    beforeAll(async () => {
      const email = `logout-test-${Date.now()}@example.com`;
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email,
          password: 'TestPassword123!',
          firstName: 'Logout',
          lastName: 'Test',
        });

      logoutAccessToken = response.body.accessToken;
      logoutRefreshToken = response.body.refreshToken;
    });

    it('should logout successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${logoutAccessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Logged out successfully');
    });

    it('should reject using refresh token after logout', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken: logoutRefreshToken,
        })
        .expect(401);
    });
  });

  describe('Password Management Flow', () => {
    let passwordEmail: string;
    const originalPassword = 'OriginalPassword123!';
    const newPassword = 'NewPassword123!';
    let passwordAccessToken: string;

    beforeAll(async () => {
      passwordEmail = `password-test-${Date.now()}@example.com`;
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: passwordEmail,
          password: originalPassword,
          firstName: 'Password',
          lastName: 'Test',
        });

      passwordAccessToken = response.body.accessToken;
    });

    it('should change password with valid current password', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${passwordAccessToken}`)
        .send({
          currentPassword: originalPassword,
          newPassword: newPassword,
        })
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Password changed successfully');
    });

    it('should login with new password after change', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: passwordEmail,
          password: newPassword,
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
    });

    it('should reject login with old password after change', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: passwordEmail,
          password: originalPassword,
        })
        .expect(401);
    });

    it('should reject password change with wrong current password', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: passwordEmail,
          password: newPassword,
        });

      const token = response.body.accessToken;

      await request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'WrongPassword123!',
          newPassword: 'AnotherNewPassword123!',
        })
        .expect(401);
    });
  });

  describe('Forgot Password Flow', () => {
    let forgotPasswordEmail: string;

    beforeAll(async () => {
      forgotPasswordEmail = `forgot-${Date.now()}@example.com`;
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: forgotPasswordEmail,
          password: 'TestPassword123!',
          firstName: 'Forgot',
          lastName: 'Test',
        });
    });

    it('should request password reset', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({
          email: forgotPasswordEmail,
        })
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });

    it('should not reveal if email does not exist', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({
          email: 'nonexistent@example.com',
        })
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Session Management', () => {
    it('should handle multiple concurrent sessions', async () => {
      const email = `multi-session-${Date.now()}@example.com`;
      const password = 'TestPassword123!';

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email,
          password,
          firstName: 'Multi',
          lastName: 'Session',
        });

      const session1 = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password })
        .expect(200);

      const session2 = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password })
        .expect(200);

      expect(session1.body.accessToken).toBeDefined();
      expect(session2.body.accessToken).toBeDefined();
      expect(session1.body.accessToken).not.toBe(session2.body.accessToken);

      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${session1.body.accessToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${session2.body.accessToken}`)
        .expect(200);
    });
  });

  describe('Input Validation', () => {
    it('should reject registration with XSS attempts', async () => {
      const xssEmail = `<script>alert('xss')</script>@example.com`;

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: xssEmail,
          password: 'TestPassword123!',
          firstName: 'XSS',
          lastName: 'Test',
        })
        .expect(400);
    });

    it('should reject registration with SQL injection attempts', async () => {
      const sqlInjection = "admin'--";

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: sqlInjection,
          firstName: 'SQL',
          lastName: 'Injection',
        })
        .expect(400);
    });

    it('should sanitize and validate all input fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `sanitize-${Date.now()}@example.com`,
          password: 'TestPassword123!',
          firstName: '   John   ',
          lastName: '   Doe   ',
          extraField: 'should be stripped',
        })
        .expect(201);

      expect(response.body.user).not.toHaveProperty('extraField');
    });
  });

  describe('Rate Limiting and Security', () => {
    it('should enforce rate limits on login attempts', async () => {
      const email = `ratelimit-${Date.now()}@example.com`;

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email,
          password: 'TestPassword123!',
          firstName: 'Rate',
          lastName: 'Limit',
        });

      const requests = [];
      for (let i = 0; i < 20; i++) {
        requests.push(
          request(app.getHttpServer())
            .post('/auth/login')
            .send({
              email,
              password: 'WrongPassword',
            })
        );
      }

      const responses = await Promise.all(requests);
      const rateLimited = responses.some(r => r.status === 429);

      expect(rateLimited).toBe(true);
    });
  });
});
