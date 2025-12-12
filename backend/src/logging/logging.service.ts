import { Injectable, LoggerService, LogLevel } from '@nestjs/common';
import { FileTransport } from './transports/file.transport';
import { ConsoleTransport } from './transports/console.transport';

/**
 * Structured logging levels
 */
export enum LogCategory {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  SECURITY = 'security',
  AUDIT = 'audit',
  PERFORMANCE = 'performance',
}

/**
 * Log entry interface
 */
export interface LogEntry {
  level: LogLevel;
  category: LogCategory;
  message: string;
  timestamp: string;
  correlationId?: string;
  context?: Record<string, any>;
  stack?: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
}

/**
 * Logging Service
 * Provides structured logging with multiple transports and log levels
 */
@Injectable()
export class LoggingService implements LoggerService {
  private context: string = 'Application';

  constructor(
    private readonly fileTransport: FileTransport,
    private readonly consoleTransport: ConsoleTransport,
  ) {}

  /**
   * Set the context for subsequent log messages
   */
  setContext(context: string): void {
    this.context = context;
  }

  /**
   * Log general information
   */
  log(message: string, context?: string): void {
    this.writeLog('log', LogCategory.INFO, message, context);
  }

  /**
   * Log error messages
   */
  error(message: string, trace?: string, context?: string): void {
    this.writeLog('error', LogCategory.ERROR, message, context, trace);
  }

  /**
   * Log warning messages
   */
  warn(message: string, context?: string): void {
    this.writeLog('warn', LogCategory.WARN, message, context);
  }

  /**
   * Log debug messages
   */
  debug(message: string, context?: string): void {
    if (process.env.NODE_ENV === 'development') {
      this.writeLog('debug', LogCategory.DEBUG, message, context);
    }
  }

  /**
   * Log verbose messages
   */
  verbose(message: string, context?: string): void {
    if (process.env.NODE_ENV === 'development') {
      this.writeLog('verbose', LogCategory.DEBUG, message, context);
    }
  }

  /**
   * Log security-related events
   */
  security(
    message: string,
    details: {
      userId?: string;
      ip?: string;
      action: string;
      resource?: string;
    },
  ): void {
    const entry: LogEntry = {
      level: 'log',
      category: LogCategory.SECURITY,
      message,
      timestamp: new Date().toISOString(),
      context: {
        ...details,
        context: this.context,
      },
    };

    this.writeToTransports(entry);
  }

  /**
   * Log audit trail events
   */
  audit(
    action: string,
    userId: string,
    details: Record<string, any>,
  ): void {
    const entry: LogEntry = {
      level: 'log',
      category: LogCategory.AUDIT,
      message: `Audit: ${action}`,
      timestamp: new Date().toISOString(),
      userId,
      context: {
        action,
        ...details,
        context: this.context,
      },
    };

    this.writeToTransports(entry);
  }

  /**
   * Log performance metrics
   */
  performance(
    operation: string,
    duration: number,
    metadata?: Record<string, any>,
  ): void {
    const entry: LogEntry = {
      level: 'log',
      category: LogCategory.PERFORMANCE,
      message: `Performance: ${operation} completed in ${duration}ms`,
      timestamp: new Date().toISOString(),
      context: {
        operation,
        duration,
        ...metadata,
        context: this.context,
      },
    };

    this.writeToTransports(entry);
  }

  /**
   * Log structured error with correlation ID
   */
  logError(
    message: string,
    error: Error,
    correlationId?: string,
    context?: Record<string, any>,
  ): void {
    const entry: LogEntry = {
      level: 'error',
      category: LogCategory.ERROR,
      message,
      timestamp: new Date().toISOString(),
      correlationId,
      stack: error.stack,
      context: {
        errorName: error.name,
        errorMessage: error.message,
        ...context,
        context: this.context,
      },
    };

    this.writeToTransports(entry);
  }

  /**
   * Log HTTP request
   */
  logRequest(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    correlationId?: string,
    userId?: string,
  ): void {
    const entry: LogEntry = {
      level: statusCode >= 400 ? 'warn' : 'log',
      category: LogCategory.INFO,
      message: `${method} ${url} - ${statusCode} - ${duration}ms`,
      timestamp: new Date().toISOString(),
      correlationId,
      userId,
      context: {
        method,
        url,
        statusCode,
        duration,
        context: this.context,
      },
    };

    this.writeToTransports(entry);
  }

  /**
   * Write log entry to all transports
   */
  private writeLog(
    level: LogLevel,
    category: LogCategory,
    message: string,
    context?: string,
    stack?: string,
  ): void {
    const entry: LogEntry = {
      level,
      category,
      message,
      timestamp: new Date().toISOString(),
      stack,
      context: {
        context: context || this.context,
      },
    };

    this.writeToTransports(entry);
  }

  /**
   * Write to all configured transports
   */
  private writeToTransports(entry: LogEntry): void {
    // Write to console transport
    this.consoleTransport.write(entry);

    // Write to file transport (async, non-blocking)
    this.fileTransport.write(entry).catch((error) => {
      // If file logging fails, at least log to console
      console.error('Failed to write log to file:', error);
    });
  }
}
