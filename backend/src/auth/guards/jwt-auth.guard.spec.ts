import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { Observable, of, throwError } from 'rxjs';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  beforeEach(() => {
    reflector = mockReflector as any;
    guard = new JwtAuthGuard(reflector);
  });

  describe('canActivate', () => {
    it('should allow public routes without authentication', () => {
      const mockContext = createMockExecutionContext();
      mockReflector.getAllAndOverride.mockReturnValue(true); // IS_PUBLIC_KEY = true

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith('isPublic', [
        mockContext.getHandler(),
        mockContext.getClass(),
      ]);
    });

    it('should call parent canActivate for protected routes', async () => {
      const mockContext = createMockExecutionContext();
      mockReflector.getAllAndOverride.mockReturnValue(false); // IS_PUBLIC_KEY = false

      jest
        .spyOn(AuthGuard('jwt').prototype, 'canActivate')
        .mockReturnValue(true);

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should throw UnauthorizedException for invalid tokens', async () => {
      const mockContext = createMockExecutionContext();
      mockReflector.getAllAndOverride.mockReturnValue(false);

      jest
        .spyOn(AuthGuard('jwt').prototype, 'canActivate')
        .mockReturnValue(Promise.resolve(false));

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should extract user from request after successful authentication', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'ATTORNEY',
      };
      const mockRequest = {
        headers: { authorization: 'Bearer valid-token' },
        user: mockUser,
      };
      const mockContext = createMockExecutionContext(mockRequest);

      mockReflector.getAllAndOverride.mockReturnValue(false);
      jest
        .spyOn(AuthGuard('jwt').prototype, 'canActivate')
        .mockReturnValue(true);

      await guard.canActivate(mockContext);

      expect(mockContext.switchToHttp().getRequest().user).toEqual(mockUser);
    });

    it('should handle expired tokens', async () => {
      const mockContext = createMockExecutionContext();
      mockReflector.getAllAndOverride.mockReturnValue(false);

      jest
        .spyOn(AuthGuard('jwt').prototype, 'canActivate')
        .mockImplementation(() => {
          throw new UnauthorizedException('Token expired');
        });

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle missing authorization header', async () => {
      const mockRequest = { headers: {} };
      const mockContext = createMockExecutionContext(mockRequest);
      mockReflector.getAllAndOverride.mockReturnValue(false);

      jest
        .spyOn(AuthGuard('jwt').prototype, 'canActivate')
        .mockReturnValue(Promise.resolve(false));

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle malformed authorization header', async () => {
      const mockRequest = {
        headers: { authorization: 'InvalidFormat' },
      };
      const mockContext = createMockExecutionContext(mockRequest);
      mockReflector.getAllAndOverride.mockReturnValue(false);

      jest
        .spyOn(AuthGuard('jwt').prototype, 'canActivate')
        .mockReturnValue(Promise.resolve(false));

      await expect(guard.canActivate(mockContext)).rejects.toThrow();
    });

    it('should support WebSocket contexts', () => {
      const mockWsContext = {
        getType: jest.fn().mockReturnValue('ws'),
        switchToWs: jest.fn().mockReturnValue({
          getClient: jest.fn().mockReturnValue({
            handshake: {
              auth: { token: 'valid-token' },
            },
          }),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
        getArgs: jest.fn(),
        getArgByIndex: jest.fn(),
        switchToHttp: jest.fn(),
        switchToRpc: jest.fn(),
      };

      mockReflector.getAllAndOverride.mockReturnValue(true);

      const result = guard.canActivate(mockWsContext as any);

      expect(result).toBe(true);
    });

    it('should support GraphQL contexts', () => {
      const mockGqlContext = {
        getType: jest.fn().mockReturnValue('graphql'),
        getHandler: jest.fn(),
        getClass: jest.fn(),
        getArgs: jest.fn().mockReturnValue([
          null,
          null,
          {
            req: {
              headers: { authorization: 'Bearer valid-token' },
            },
          },
        ]),
        getArgByIndex: jest.fn(),
        switchToHttp: jest.fn(),
        switchToRpc: jest.fn(),
        switchToWs: jest.fn(),
      };

      mockReflector.getAllAndOverride.mockReturnValue(false);
      jest
        .spyOn(AuthGuard('jwt').prototype, 'canActivate')
        .mockReturnValue(true);

      guard.canActivate(mockGqlContext as any);

      expect(mockReflector.getAllAndOverride).toHaveBeenCalled();
    });
  });

  describe('handleRequest', () => {
    it('should return user on successful authentication', () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'ATTORNEY',
      };
      const mockInfo = null;
      const mockContext = createMockExecutionContext();

      const result = guard.handleRequest(null, mockUser, mockInfo, mockContext);

      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException on authentication error', () => {
      const mockError = new Error('Invalid token');
      const mockInfo = null;
      const mockContext = createMockExecutionContext();

      expect(() =>
        guard.handleRequest(mockError, null, mockInfo, mockContext),
      ).toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user is null', () => {
      const mockInfo = null;
      const mockContext = createMockExecutionContext();

      expect(() =>
        guard.handleRequest(null, null, mockInfo, mockContext),
      ).toThrow(UnauthorizedException);
    });

    it('should include error message in exception', () => {
      const mockError = new Error('Token signature invalid');
      const mockContext = createMockExecutionContext();

      expect(() =>
        guard.handleRequest(mockError, null, null, mockContext),
      ).toThrow('Token signature invalid');
    });

    it('should handle blacklisted tokens', () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'ATTORNEY',
      };
      const mockInfo = { message: 'Token blacklisted' };
      const mockContext = createMockExecutionContext();

      expect(() =>
        guard.handleRequest(null, mockUser, mockInfo, mockContext),
      ).toThrow(UnauthorizedException);
    });
  });

  describe('getRequest', () => {
    it('should extract request from HTTP context', () => {
      const mockRequest = {
        headers: { authorization: 'Bearer token' },
      };
      const mockContext = createMockExecutionContext(mockRequest);

      const request = guard.getRequest(mockContext);

      expect(request).toEqual(mockRequest);
    });

    it('should extract request from GraphQL context', () => {
      const mockRequest = {
        headers: { authorization: 'Bearer token' },
      };
      const mockGqlContext = {
        getType: jest.fn().mockReturnValue('graphql'),
        getArgs: jest.fn().mockReturnValue([null, null, { req: mockRequest }]),
        getHandler: jest.fn(),
        getClass: jest.fn(),
        getArgByIndex: jest.fn(),
        switchToHttp: jest.fn(),
        switchToRpc: jest.fn(),
        switchToWs: jest.fn(),
      };

      const request = guard.getRequest(mockGqlContext as any);

      expect(request).toEqual(mockRequest);
    });

    it('should handle WebSocket client', () => {
      const mockClient = {
        handshake: {
          auth: { token: 'valid-token' },
        },
      };
      const mockWsContext = {
        getType: jest.fn().mockReturnValue('ws'),
        switchToWs: jest.fn().mockReturnValue({
          getClient: jest.fn().mockReturnValue(mockClient),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
        getArgs: jest.fn(),
        getArgByIndex: jest.fn(),
        switchToHttp: jest.fn(),
        switchToRpc: jest.fn(),
      };

      const client = guard.getRequest(mockWsContext as any);

      expect(client).toEqual(mockClient);
    });
  });

  describe('Edge Cases', () => {
    it('should handle concurrent requests with same token', async () => {
      const mockContext = createMockExecutionContext();
      mockReflector.getAllAndOverride.mockReturnValue(false);
      jest
        .spyOn(AuthGuard('jwt').prototype, 'canActivate')
        .mockReturnValue(true);

      const results = await Promise.all([
        guard.canActivate(mockContext),
        guard.canActivate(mockContext),
        guard.canActivate(mockContext),
      ]);

      expect(results).toEqual([true, true, true]);
    });

    it('should handle rate-limited authentication attempts', async () => {
      const mockContext = createMockExecutionContext();
      mockReflector.getAllAndOverride.mockReturnValue(false);

      let attemptCount = 0;
      jest
        .spyOn(AuthGuard('jwt').prototype, 'canActivate')
        .mockImplementation(() => {
          attemptCount++;
          if (attemptCount > 5) {
            throw new UnauthorizedException('Rate limit exceeded');
          }
          return Promise.resolve(false);
        });

      for (let i = 0; i < 5; i++) {
        await expect(guard.canActivate(mockContext)).rejects.toThrow();
      }

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        'Rate limit exceeded',
      );
    });

    it('should handle null or undefined context', () => {
      mockReflector.getAllAndOverride.mockReturnValue(false);

      expect(() => guard.canActivate(null as any)).toThrow();
      expect(() => guard.canActivate(undefined as any)).toThrow();
    });
  });
});

function createMockExecutionContext(request?: any): ExecutionContext {
  const mockRequest = request || {
    headers: { authorization: 'Bearer valid-token' },
    user: null,
  };

  return {
    getType: jest.fn().mockReturnValue('http'),
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue(mockRequest),
      getResponse: jest.fn().mockReturnValue({}),
      getNext: jest.fn(),
    }),
    switchToWs: jest.fn().mockReturnValue({
      getClient: jest.fn(),
      getData: jest.fn(),
    }),
    switchToRpc: jest.fn().mockReturnValue({
      getContext: jest.fn(),
      getData: jest.fn(),
    }),
    getHandler: jest.fn(),
    getClass: jest.fn(),
    getArgs: jest.fn(),
    getArgByIndex: jest.fn(),
  } as any;
}
