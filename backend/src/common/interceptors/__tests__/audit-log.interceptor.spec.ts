import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { AuditLogInterceptor } from '../audit-log.interceptor';
import { AuditLogsService } from '../../../compliance/audit-logs/audit-logs.service';
import { Reflector } from '@nestjs/core';

describe('AuditLogInterceptor', () => {
  let interceptor: AuditLogInterceptor;
  let auditLogsService: AuditLogsService;
  let reflector: Reflector;

  const mockAuditLogsService = {
    createLog: jest.fn().mockResolvedValue({
      id: 'audit-123',
      action: 'CREATE',
      resource: 'INVOICE',
      userId: 'user-123',
      timestamp: new Date(),
    }),
  };

  const mockReflector = {
    get: jest.fn(),
    getAllAndOverride: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogInterceptor,
        {
          provide: AuditLogsService,
          useValue: mockAuditLogsService,
        },
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    interceptor = module.get<AuditLogInterceptor>(AuditLogInterceptor);
    auditLogsService = module.get<AuditLogsService>(AuditLogsService);
    reflector = module.get<Reflector>(Reflector);

    jest.clearAllMocks();
  });

  describe('intercept', () => {
    it('should create audit log for successful request', async () => {
      const mockContext = createMockExecutionContext({
        method: 'POST',
        url: '/billing/invoices',
        body: { caseId: 'case-123', amount: 5000 },
        user: { id: 'user-123', email: 'test@example.com', role: 'ATTORNEY' },
      });

      const mockCallHandler: CallHandler = {
        handle: jest.fn().mockReturnValue(
          of({
            id: 'invoice-123',
            amount: 5000,
            status: 'DRAFT',
          }),
        ),
      };

      mockReflector.get.mockReturnValue(true);

      const result$ = interceptor.intercept(mockContext, mockCallHandler);

      await new Promise((resolve) => {
        result$.subscribe({
          next: (data) => {
            expect(data).toEqual({
              id: 'invoice-123',
              amount: 5000,
              status: 'DRAFT',
            });
            resolve(null);
          },
        });
      });

      expect(auditLogsService.createLog).toHaveBeenCalledWith({
        action: 'CREATE',
        resource: 'INVOICE',
        resourceId: 'invoice-123',
        userId: 'user-123',
        method: 'POST',
        path: '/billing/invoices',
        statusCode: 200,
        requestBody: { caseId: 'case-123', amount: 5000 },
        responseBody: { id: 'invoice-123', amount: 5000, status: 'DRAFT' },
        ipAddress: expect.any(String),
        userAgent: expect.any(String),
        timestamp: expect.any(Date),
      });
    });

    it('should skip audit logging when disabled by decorator', async () => {
      const mockContext = createMockExecutionContext({
        method: 'GET',
        url: '/health',
      });

      const mockCallHandler: CallHandler = {
        handle: jest.fn().mockReturnValue(of({ status: 'ok' })),
      };

      mockReflector.get.mockReturnValue(false);

      const result$ = interceptor.intercept(mockContext, mockCallHandler);

      await new Promise((resolve) => {
        result$.subscribe({
          next: () => resolve(null),
        });
      });

      expect(auditLogsService.createLog).not.toHaveBeenCalled();
    });

    it('should create audit log for UPDATE operations', async () => {
      const mockContext = createMockExecutionContext({
        method: 'PATCH',
        url: '/cases/case-123',
        params: { id: 'case-123' },
        body: { status: 'CLOSED' },
        user: { id: 'user-456', email: 'attorney@example.com', role: 'ATTORNEY' },
      });

      const mockCallHandler: CallHandler = {
        handle: jest.fn().mockReturnValue(
          of({
            id: 'case-123',
            status: 'CLOSED',
            updatedAt: new Date(),
          }),
        ),
      };

      mockReflector.get.mockReturnValue(true);

      const result$ = interceptor.intercept(mockContext, mockCallHandler);

      await new Promise((resolve) => {
        result$.subscribe({
          next: () => resolve(null),
        });
      });

      expect(auditLogsService.createLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'UPDATE',
          resource: 'CASE',
          resourceId: 'case-123',
          userId: 'user-456',
        }),
      );
    });

    it('should create audit log for DELETE operations', async () => {
      const mockContext = createMockExecutionContext({
        method: 'DELETE',
        url: '/documents/doc-123',
        params: { id: 'doc-123' },
        user: { id: 'user-789', email: 'admin@example.com', role: 'ADMIN' },
      });

      const mockCallHandler: CallHandler = {
        handle: jest.fn().mockReturnValue(of({ success: true })),
      };

      mockReflector.get.mockReturnValue(true);

      const result$ = interceptor.intercept(mockContext, mockCallHandler);

      await new Promise((resolve) => {
        result$.subscribe({
          next: () => resolve(null),
        });
      });

      expect(auditLogsService.createLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'DELETE',
          resource: 'DOCUMENT',
          resourceId: 'doc-123',
          userId: 'user-789',
        }),
      );
    });

    it('should sanitize sensitive data before logging', async () => {
      const mockContext = createMockExecutionContext({
        method: 'POST',
        url: '/auth/register',
        body: {
          email: 'newuser@example.com',
          password: 'supersecret123',
          firstName: 'John',
          lastName: 'Doe',
        },
        user: null,
      });

      const mockCallHandler: CallHandler = {
        handle: jest.fn().mockReturnValue(
          of({
            id: 'user-new',
            email: 'newuser@example.com',
            firstName: 'John',
            lastName: 'Doe',
          }),
        ),
      };

      mockReflector.get.mockReturnValue(true);

      const result$ = interceptor.intercept(mockContext, mockCallHandler);

      await new Promise((resolve) => {
        result$.subscribe({
          next: () => resolve(null),
        });
      });

      expect(auditLogsService.createLog).toHaveBeenCalledWith(
        expect.objectContaining({
          requestBody: expect.not.objectContaining({
            password: 'supersecret123',
          }),
        }),
      );

      const logCall = (auditLogsService.createLog as jest.Mock).mock.calls[0][0];
      expect(logCall.requestBody.password).toBe('[REDACTED]');
    });

    it('should log error details when request fails', async () => {
      const mockContext = createMockExecutionContext({
        method: 'POST',
        url: '/billing/invoices',
        body: { caseId: 'invalid-case' },
        user: { id: 'user-123', email: 'test@example.com', role: 'ATTORNEY' },
      });

      const error = new Error('Case not found');
      const mockCallHandler: CallHandler = {
        handle: jest.fn().mockReturnValue(throwError(() => error)),
      };

      mockReflector.get.mockReturnValue(true);

      const result$ = interceptor.intercept(mockContext, mockCallHandler);

      await expect(
        new Promise((resolve, reject) => {
          result$.subscribe({
            next: resolve,
            error: reject,
          });
        }),
      ).rejects.toThrow('Case not found');

      expect(auditLogsService.createLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'CREATE',
          resource: 'INVOICE',
          userId: 'user-123',
          statusCode: 500,
          error: {
            message: 'Case not found',
            stack: expect.any(String),
          },
        }),
      );
    });

    it('should extract IP address from request', async () => {
      const mockContext = createMockExecutionContext({
        method: 'GET',
        url: '/cases',
        ip: '192.168.1.100',
        headers: {
          'x-forwarded-for': '203.0.113.45',
        },
        user: { id: 'user-123', email: 'test@example.com', role: 'ATTORNEY' },
      });

      const mockCallHandler: CallHandler = {
        handle: jest.fn().mockReturnValue(of([])),
      };

      mockReflector.get.mockReturnValue(true);

      const result$ = interceptor.intercept(mockContext, mockCallHandler);

      await new Promise((resolve) => {
        result$.subscribe({
          next: () => resolve(null),
        });
      });

      expect(auditLogsService.createLog).toHaveBeenCalledWith(
        expect.objectContaining({
          ipAddress: '203.0.113.45',
        }),
      );
    });

    it('should extract user agent from request', async () => {
      const mockContext = createMockExecutionContext({
        method: 'GET',
        url: '/cases',
        headers: {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        },
        user: { id: 'user-123', email: 'test@example.com', role: 'ATTORNEY' },
      });

      const mockCallHandler: CallHandler = {
        handle: jest.fn().mockReturnValue(of([])),
      };

      mockReflector.get.mockReturnValue(true);

      const result$ = interceptor.intercept(mockContext, mockCallHandler);

      await new Promise((resolve) => {
        result$.subscribe({
          next: () => resolve(null),
        });
      });

      expect(auditLogsService.createLog).toHaveBeenCalledWith(
        expect.objectContaining({
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        }),
      );
    });

    it('should handle requests without authenticated user', async () => {
      const mockContext = createMockExecutionContext({
        method: 'POST',
        url: '/auth/login',
        body: { email: 'test@example.com', password: '[REDACTED]' },
        user: null,
      });

      const mockCallHandler: CallHandler = {
        handle: jest.fn().mockReturnValue(
          of({
            access_token: 'jwt-token',
            user: { id: 'user-123' },
          }),
        ),
      };

      mockReflector.get.mockReturnValue(true);

      const result$ = interceptor.intercept(mockContext, mockCallHandler);

      await new Promise((resolve) => {
        result$.subscribe({
          next: () => resolve(null),
        });
      });

      expect(auditLogsService.createLog).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: null,
          action: 'LOGIN_ATTEMPT',
        }),
      );
    });

    it('should measure request duration', async () => {
      const mockContext = createMockExecutionContext({
        method: 'GET',
        url: '/cases',
        user: { id: 'user-123', email: 'test@example.com', role: 'ATTORNEY' },
      });

      const mockCallHandler: CallHandler = {
        handle: jest.fn().mockReturnValue(
          of([]).pipe(
            async () =>
              new Promise((resolve) =>
                setTimeout(() => resolve([]), 100),
              ),
          ),
        ),
      };

      mockReflector.get.mockReturnValue(true);

      const result$ = interceptor.intercept(mockContext, mockCallHandler);

      await new Promise((resolve) => {
        result$.subscribe({
          next: () => resolve(null),
        });
      });

      expect(auditLogsService.createLog).toHaveBeenCalledWith(
        expect.objectContaining({
          duration: expect.any(Number),
        }),
      );

      const logCall = (auditLogsService.createLog as jest.Mock).mock.calls[0][0];
      expect(logCall.duration).toBeGreaterThan(0);
    });

    it('should handle GraphQL context', async () => {
      const mockGqlContext = {
        getType: jest.fn().mockReturnValue('graphql'),
        getArgs: jest.fn().mockReturnValue([
          null,
          { input: { title: 'New Case' } },
          {
            req: {
              method: 'POST',
              url: '/graphql',
              user: { id: 'user-123', email: 'test@example.com' },
              headers: {},
              ip: '127.0.0.1',
            },
          },
        ]),
        getHandler: jest.fn(),
        getClass: jest.fn(),
        getArgByIndex: jest.fn(),
        switchToHttp: jest.fn(),
        switchToRpc: jest.fn(),
        switchToWs: jest.fn(),
      };

      const mockCallHandler: CallHandler = {
        handle: jest.fn().mockReturnValue(
          of({
            id: 'case-123',
            title: 'New Case',
          }),
        ),
      };

      mockReflector.get.mockReturnValue(true);

      const result$ = interceptor.intercept(mockGqlContext as any, mockCallHandler);

      await new Promise((resolve) => {
        result$.subscribe({
          next: () => resolve(null),
        });
      });

      expect(auditLogsService.createLog).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/graphql',
          userId: 'user-123',
        }),
      );
    });

    it('should handle WebSocket context', async () => {
      const mockWsContext = {
        getType: jest.fn().mockReturnValue('ws'),
        switchToWs: jest.fn().mockReturnValue({
          getClient: jest.fn().mockReturnValue({
            handshake: {
              headers: { 'user-agent': 'WebSocket Client' },
              address: '127.0.0.1',
            },
            id: 'socket-123',
          }),
          getData: jest.fn().mockReturnValue({ action: 'JOIN_ROOM' }),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
        getArgs: jest.fn(),
        getArgByIndex: jest.fn(),
        switchToHttp: jest.fn(),
        switchToRpc: jest.fn(),
      };

      const mockCallHandler: CallHandler = {
        handle: jest.fn().mockReturnValue(of({ success: true })),
      };

      mockReflector.get.mockReturnValue(true);

      const result$ = interceptor.intercept(mockWsContext as any, mockCallHandler);

      await new Promise((resolve) => {
        result$.subscribe({
          next: () => resolve(null),
        });
      });

      expect(auditLogsService.createLog).toHaveBeenCalledWith(
        expect.objectContaining({
          resource: 'WEBSOCKET',
          action: 'JOIN_ROOM',
        }),
      );
    });
  });

  describe('Performance', () => {
    it('should not significantly delay request processing', async () => {
      const mockContext = createMockExecutionContext({
        method: 'GET',
        url: '/cases',
        user: { id: 'user-123', email: 'test@example.com', role: 'ATTORNEY' },
      });

      const mockCallHandler: CallHandler = {
        handle: jest.fn().mockReturnValue(of([])),
      };

      mockReflector.get.mockReturnValue(true);

      const startTime = Date.now();
      const result$ = interceptor.intercept(mockContext, mockCallHandler);

      await new Promise((resolve) => {
        result$.subscribe({
          next: () => resolve(null),
        });
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(100);
    });

    it('should handle concurrent requests efficiently', async () => {
      const requests = Array.from({ length: 100 }, (_, i) => {
        const mockContext = createMockExecutionContext({
          method: 'GET',
          url: `/cases/${i}`,
          user: { id: 'user-123', email: 'test@example.com', role: 'ATTORNEY' },
        });

        const mockCallHandler: CallHandler = {
          handle: jest.fn().mockReturnValue(of({ id: i })),
        };

        mockReflector.get.mockReturnValue(true);

        return new Promise((resolve) => {
          interceptor.intercept(mockContext, mockCallHandler).subscribe({
            next: () => resolve(null),
          });
        });
      });

      const startTime = Date.now();
      await Promise.all(requests);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000);
      expect(auditLogsService.createLog).toHaveBeenCalledTimes(100);
    });
  });
});

function createMockExecutionContext(options: {
  method?: string;
  url?: string;
  body?: any;
  params?: any;
  query?: any;
  headers?: any;
  user?: any;
  ip?: string;
}): ExecutionContext {
  const {
    method = 'GET',
    url = '/',
    body = {},
    params = {},
    query = {},
    headers = {},
    user = null,
    ip = '127.0.0.1',
  } = options;

  const mockRequest = {
    method,
    url,
    body,
    params,
    query,
    headers,
    user,
    ip,
  };

  return {
    getType: jest.fn().mockReturnValue('http'),
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue(mockRequest),
      getResponse: jest.fn().mockReturnValue({
        statusCode: 200,
      }),
      getNext: jest.fn(),
    }),
    switchToWs: jest.fn(),
    switchToRpc: jest.fn(),
    getHandler: jest.fn(),
    getClass: jest.fn(),
    getArgs: jest.fn(),
    getArgByIndex: jest.fn(),
  } as any;
}
