import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { UserRole } from '../../src/shared-types/enums/user.enums';
import { Role } from '../../src/common/enums/role.enum';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole | Role;
  type?: 'access' | 'refresh' | 'mfa' | 'reset';
  jti?: string;
  iat?: number;
  exp?: number;
}

export interface TestTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthenticatedRequest {
  headers: {
    authorization: string;
    [key: string]: string;
  };
}

export class TestAuthHelper {
  private jwtService: JwtService;
  private jwtSecret: string;
  private jwtRefreshSecret: string;

  constructor(
    jwtSecret?: string,
    jwtRefreshSecret?: string
  ) {
    this.jwtSecret = jwtSecret || process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing-only';
    this.jwtRefreshSecret = jwtRefreshSecret || process.env.JWT_REFRESH_SECRET || 'test-refresh-secret-key-for-testing-only';
    this.jwtService = new JwtService({
      secret: this.jwtSecret,
    });
  }

  async generateAccessToken(userId: string, email: string, role: UserRole | Role = UserRole.CLIENT_USER): Promise<string> {
    const payload: JwtPayload = {
      sub: userId,
      email,
      role,
      type: 'access',
      jti: this.generateJti(),
    };

    return await this.jwtService.signAsync(payload, {
      secret: this.jwtSecret,
      expiresIn: '15m',
    });
  }

  async generateRefreshToken(userId: string, email: string, role: UserRole | Role = UserRole.CLIENT_USER): Promise<string> {
    const payload: JwtPayload = {
      sub: userId,
      email,
      role,
      type: 'refresh',
      jti: this.generateJti(),
    };

    return await this.jwtService.signAsync(payload, {
      secret: this.jwtRefreshSecret,
      expiresIn: '7d',
    });
  }

  async generateMfaToken(userId: string): Promise<string> {
    const payload: JwtPayload = {
      sub: userId,
      email: '',
      role: UserRole.CLIENT_USER,
      type: 'mfa',
    };

    return await this.jwtService.signAsync(payload, {
      secret: this.jwtSecret,
      expiresIn: '5m',
    });
  }

  async generateResetToken(userId: string): Promise<string> {
    const payload: JwtPayload = {
      sub: userId,
      email: '',
      role: UserRole.CLIENT_USER,
      type: 'reset',
    };

    return await this.jwtService.signAsync(payload, {
      secret: this.jwtSecret,
      expiresIn: '1h',
    });
  }

  async generateTokens(userId: string, email: string, role: UserRole | Role = UserRole.CLIENT_USER): Promise<TestTokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(userId, email, role),
      this.generateRefreshToken(userId, email, role),
    ]);

    return { accessToken, refreshToken };
  }

  async generateExpiredToken(userId: string, email: string, role: UserRole | Role = UserRole.CLIENT_USER): Promise<string> {
    const payload: JwtPayload = {
      sub: userId,
      email,
      role,
      type: 'access',
      jti: this.generateJti(),
    };

    return await this.jwtService.signAsync(payload, {
      secret: this.jwtSecret,
      expiresIn: '-1h',
    });
  }

  async verifyToken(token: string, secret?: string): Promise<JwtPayload> {
    return await this.jwtService.verifyAsync<JwtPayload>(token, {
      secret: secret || this.jwtSecret,
    });
  }

  decodeToken(token: string): JwtPayload | null {
    return this.jwtService.decode(token) as JwtPayload | null;
  }

  createAuthHeader(token: string): string {
    return `Bearer ${token}`;
  }

  createAuthenticatedRequest(token: string): AuthenticatedRequest {
    return {
      headers: {
        authorization: this.createAuthHeader(token),
      },
    };
  }

  async createAuthenticatedTestRequest(
    app: INestApplication,
    userId: string,
    email: string,
    role: UserRole | Role = UserRole.CLIENT_USER
  ): Promise<{
    request: request.SuperTest<request.Test>;
    token: string;
    headers: { authorization: string };
  }> {
    const token = await this.generateAccessToken(userId, email, role);
    const authHeaders = { authorization: this.createAuthHeader(token) };

    return {
      request: request(app.getHttpServer()),
      token,
      headers: authHeaders,
    };
  }

  async authenticatedGet(
    app: INestApplication,
    url: string,
    userId: string,
    email: string,
    role?: UserRole | Role
  ): Promise<request.Test> {
    const token = await this.generateAccessToken(userId, email, role);
    return request(app.getHttpServer())
      .get(url)
      .set('Authorization', this.createAuthHeader(token));
  }

  async authenticatedPost(
    app: INestApplication,
    url: string,
    userId: string,
    email: string,
    body: any,
    role?: UserRole | Role
  ): Promise<request.Test> {
    const token = await this.generateAccessToken(userId, email, role);
    return request(app.getHttpServer())
      .post(url)
      .set('Authorization', this.createAuthHeader(token))
      .send(body);
  }

  async authenticatedPut(
    app: INestApplication,
    url: string,
    userId: string,
    email: string,
    body: any,
    role?: UserRole | Role
  ): Promise<request.Test> {
    const token = await this.generateAccessToken(userId, email, role);
    return request(app.getHttpServer())
      .put(url)
      .set('Authorization', this.createAuthHeader(token))
      .send(body);
  }

  async authenticatedPatch(
    app: INestApplication,
    url: string,
    userId: string,
    email: string,
    body: any,
    role?: UserRole | Role
  ): Promise<request.Test> {
    const token = await this.generateAccessToken(userId, email, role);
    return request(app.getHttpServer())
      .patch(url)
      .set('Authorization', this.createAuthHeader(token))
      .send(body);
  }

  async authenticatedDelete(
    app: INestApplication,
    url: string,
    userId: string,
    email: string,
    role?: UserRole | Role
  ): Promise<request.Test> {
    const token = await this.generateAccessToken(userId, email, role);
    return request(app.getHttpServer())
      .delete(url)
      .set('Authorization', this.createAuthHeader(token));
  }

  private generateJti(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
}

export const createTestAuthHelper = (jwtSecret?: string, jwtRefreshSecret?: string): TestAuthHelper => {
  return new TestAuthHelper(jwtSecret, jwtRefreshSecret);
};

export const mockAuthGuard = {
  canActivate: jest.fn(() => true),
};

export const mockRolesGuard = {
  canActivate: jest.fn(() => true),
};

export const mockJwtAuthGuard = {
  canActivate: jest.fn((context: any) => {
    const request = context.switchToHttp().getRequest();
    request.user = {
      id: 'test-user-id',
      email: 'test@example.com',
      role: UserRole.CLIENT_USER,
    };
    return true;
  }),
};

export const createMockUser = (overrides: Partial<any> = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: UserRole.CLIENT_USER,
  status: 'active',
  isActive: true,
  mfaEnabled: false,
  emailVerified: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockRequest = (user?: any, headers?: any) => ({
  user: user || createMockUser(),
  headers: headers || {},
  body: {},
  query: {},
  params: {},
  ip: '127.0.0.1',
  method: 'GET',
  url: '/',
});

export const createMockExecutionContext = (user?: any) => ({
  switchToHttp: () => ({
    getRequest: () => createMockRequest(user),
    getResponse: () => ({
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    }),
  }),
  getHandler: () => jest.fn(),
  getClass: () => jest.fn(),
});

export const withAuth = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

export const withBasicAuth = (username: string, password: string) => ({
  Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
});

export const extractTokenFromHeader = (authHeader: string): string | null => {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const helper = createTestAuthHelper();
    const decoded = helper.decodeToken(token);
    if (!decoded || !decoded.exp) {
      return true;
    }
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export default {
  TestAuthHelper,
  createTestAuthHelper,
  mockAuthGuard,
  mockRolesGuard,
  mockJwtAuthGuard,
  createMockUser,
  createMockRequest,
  createMockExecutionContext,
  withAuth,
  withBasicAuth,
  extractTokenFromHeader,
  isTokenExpired,
};
