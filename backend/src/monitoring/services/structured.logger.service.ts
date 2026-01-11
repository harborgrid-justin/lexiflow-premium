import {
  Injectable,
  LoggerService as NestLoggerService,
  Scope,
} from "@nestjs/common";
import * as winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { AsyncLocalStorage } from "async_hooks";

export interface LogContext {
  correlationId?: string;
  userId?: string;
  requestId?: string;
  userEmail?: string;
  ip?: string;
  userAgent?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  duration?: number;
  context?: string;
  securityEvent?: string;
  businessEvent?: string;
  trace?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface HttpRequest {
  method: string;
  url: string;
  ip?: string;
  connection?: { remoteAddress?: string };
  headers?: Record<string, string | string[] | undefined>;
  correlationId?: string;
  user?: {
    id?: string;
    email?: string;
  };
  route?: {
    path?: string;
  };
}

export interface HttpResponse {
  statusCode: number;
  statusMessage?: string;
  get?: (name: string) => string | number | string[] | undefined;
}

export type QueryParam = string | number | boolean | Date | null | undefined;

export interface LogMetadata {
  [key: string]:
    | string
    | number
    | boolean
    | undefined
    | LogMetadata
    | LogMetadata[];
}

export type RedactableData =
  | string
  | number
  | boolean
  | null
  | undefined
  | RedactableData[]
  | { [key: string]: RedactableData };

/**
 * Structured Logger Service
 * Enterprise-grade structured logging with JSON output, PII redaction, and log rotation
 * Implements NestJS LoggerService interface for framework integration
 */
@Injectable({ scope: Scope.DEFAULT })
export class StructuredLoggerService implements NestLoggerService {
  private logger: winston.Logger;
  private contextStorage: AsyncLocalStorage<LogContext>;
  private readonly piiFields = [
    "password",
    "currentPassword",
    "newPassword",
    "confirmPassword",
    "token",
    "accessToken",
    "refreshToken",
    "secret",
    "apiKey",
    "ssn",
    "socialSecurityNumber",
    "creditCard",
    "cvv",
    "pin",
  ];

  constructor() {
    this.contextStorage = new AsyncLocalStorage<LogContext>();
    this.logger = this.createLogger();
  }

  private createLogger(): winston.Logger {
    const isProduction = process.env.NODE_ENV === "production";
    const logLevel = process.env.LOG_LEVEL || (isProduction ? "info" : "debug");

    const formats = [
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
      winston.format.errors({ stack: true }),
      winston.format.metadata(),
    ];

    // In development, use pretty-printed JSON; in production, use compact JSON
    if (isProduction) {
      formats.push(winston.format.json());
    } else {
      formats.push(
        winston.format.colorize(),
        winston.format.printf((info) => {
          const { timestamp, level, message, context, ...meta } = info;
          let log = `${timestamp} [${level}]`;
          if (context) {
            log += ` [${context}]`;
          }
          log += `: ${message}`;
          if (
            Object.keys(meta).length > 0 &&
            meta.metadata &&
            Object.keys(meta.metadata).length > 0
          ) {
            log += ` ${JSON.stringify(meta.metadata)}`;
          }
          return log;
        })
      );
    }

    const transports: winston.transport[] = [];

    // Console transport
    transports.push(
      new winston.transports.Console({
        level: logLevel,
        format: winston.format.combine(...formats),
      })
    );

    // File transports with rotation
    if (isProduction || process.env.ENABLE_FILE_LOGGING === "true") {
      // Error logs
      transports.push(
        new DailyRotateFile({
          filename: "logs/error-%DATE%.log",
          datePattern: "YYYY-MM-DD",
          level: "error",
          maxFiles: "30d",
          maxSize: "20m",
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
        })
      );

      // Combined logs
      transports.push(
        new DailyRotateFile({
          filename: "logs/combined-%DATE%.log",
          datePattern: "YYYY-MM-DD",
          maxFiles: "30d",
          maxSize: "20m",
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
        })
      );

      // Audit logs (info and above)
      transports.push(
        new DailyRotateFile({
          filename: "logs/audit-%DATE%.log",
          datePattern: "YYYY-MM-DD",
          level: "info",
          maxFiles: "2555d", // 7 years for compliance
          maxSize: "20m",
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
        })
      );
    }

    return winston.createLogger({
      level: logLevel,
      transports,
      exceptionHandlers: [
        new winston.transports.File({ filename: "logs/exceptions.log" }),
      ],
      rejectionHandlers: [
        new winston.transports.File({ filename: "logs/rejections.log" }),
      ],
    });
  }

  /**
   * Redact PII from log data
   */
  private redactPII(data: RedactableData): RedactableData {
    if (data === null || data === undefined) {
      return data;
    }

    if (
      typeof data === "string" ||
      typeof data === "number" ||
      typeof data === "boolean"
    ) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.redactPII(item));
    }

    if (typeof data === "object") {
      const redacted: Record<string, RedactableData> = {};
      for (const [key, value] of Object.entries(data)) {
        const lowerKey = key.toLowerCase();
        if (
          this.piiFields.some((field) => lowerKey.includes(field.toLowerCase()))
        ) {
          redacted[key] = "***REDACTED***";
        } else if (typeof value === "object" && value !== null) {
          redacted[key] = this.redactPII(value);
        } else {
          redacted[key] = value;
        }
      }
      return redacted;
    }

    return data;
  }

  /**
   * Get current context from AsyncLocalStorage or create new one
   */
  private getContext(): LogContext {
    return this.contextStorage.getStore() || {};
  }

  /**
   * Set context for current execution
   */
  setContext(context: LogContext): void {
    const currentContext = this.getContext();
    this.contextStorage.enterWith({ ...currentContext, ...context });
  }

  /**
   * Run code with specific context
   */
  runWithContext<T>(context: LogContext, callback: () => T): T {
    return this.contextStorage.run(context, callback);
  }

  /**
   * Build log metadata with context enrichment
   */
  private buildMetadata(
    context?: string | LogContext,
    additionalMeta?: LogMetadata
  ): LogMetadata {
    const currentContext = this.getContext();
    let contextData: LogContext = {};

    if (typeof context === "string") {
      contextData.context = context;
    } else if (context) {
      contextData = context;
    }

    const metadata: LogMetadata = {
      ...currentContext,
      ...contextData,
      ...additionalMeta,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      service: "lexiflow-backend",
    };

    return this.redactPII(metadata) as LogMetadata;
  }

  /**
   * Log at ERROR level
   */
  error(message: string, trace?: string, context?: string | LogContext): void {
    const metadata = this.buildMetadata(context, { trace });
    this.logger.error(message, metadata);
  }

  /**
   * Log at WARN level
   */
  warn(message: string, context?: string | LogContext): void {
    const metadata = this.buildMetadata(context);
    this.logger.warn(message, metadata);
  }

  /**
   * Log at INFO level
   */
  log(message: string, context?: string | LogContext): void {
    const metadata = this.buildMetadata(context);
    this.logger.info(message, metadata);
  }

  /**
   * Log at DEBUG level
   */
  debug(message: string, context?: string | LogContext): void {
    const metadata = this.buildMetadata(context);
    this.logger.debug(message, metadata);
  }

  /**
   * Log at VERBOSE level (trace)
   */
  verbose(message: string, context?: string | LogContext): void {
    const metadata = this.buildMetadata(context);
    this.logger.verbose(message, metadata);
  }

  /**
   * Log with custom level and metadata
   */
  logWithMetadata(level: string, message: string, metadata: LogMetadata): void {
    const enrichedMetadata = this.buildMetadata(undefined, metadata);
    this.logger.log(level, message, enrichedMetadata);
  }

  /**
   * Log HTTP request
   */
  logRequest(req: HttpRequest): void {
    const userAgent = Array.isArray(req.headers?.["user-agent"])
      ? req.headers["user-agent"][0]
      : req.headers?.["user-agent"];

    const metadata = this.buildMetadata({
      method: req.method,
      url: req.url,
      ip: req.ip || req.connection?.remoteAddress,
      userAgent,
      correlationId: req.correlationId,
      userId: req.user?.id,
      userEmail: req.user?.email,
    });

    this.logger.info(`Incoming request: ${req.method} ${req.url}`, metadata);
  }

  /**
   * Log HTTP response
   */
  logResponse(req: HttpRequest, res: HttpResponse, duration: number): void {
    const metadata = this.buildMetadata({
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      correlationId: req.correlationId,
      userId: req.user?.id,
    });

    const level =
      res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";
    this.logger.log(
      level,
      `Request completed: ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`,
      metadata
    );
  }

  /**
   * Log database query
   */
  logQuery(query: string, params: QueryParam[], duration: number): void {
    const metadata = this.buildMetadata({
      query: query.substring(0, 200), // Truncate long queries
      paramCount: params.length,
      duration,
    });

    if (duration > 1000) {
      this.logger.warn(`Slow database query detected: ${duration}ms`, metadata);
    } else {
      this.logger.debug(`Database query executed: ${duration}ms`, metadata);
    }
  }

  /**
   * Log security event
   */
  logSecurityEvent(event: string, details: LogMetadata): void {
    const metadata = this.buildMetadata({
      securityEvent: event,
      ...details,
    });

    this.logger.warn(`Security event: ${event}`, metadata);
  }

  /**
   * Log business event
   */
  logBusinessEvent(event: string, details: LogMetadata): void {
    const metadata = this.buildMetadata({
      businessEvent: event,
      ...details,
    });

    this.logger.info(`Business event: ${event}`, metadata);
  }
}
