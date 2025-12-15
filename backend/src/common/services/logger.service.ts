import { Injectable, Logger as NestLogger, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import * as path from 'path';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService {
  private logger: winston.Logger;
  private context: string;

  constructor(private readonly configService: ConfigService) {
    const logLevel = this.configService.get('LOG_LEVEL', 'info');
    const logDir = this.configService.get('LOG_DIR', 'logs');

    this.logger = winston.createLogger({
      level: logLevel,
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json(),
      ),
      defaultMeta: { service: 'lexiflow-backend' },
      transports: [
        // Console transport
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, context, ...metadata }) => {
              let msg = `${timestamp} [${level}] ${context ? `[${context}]` : ''} ${message}`;
              
              if (Object.keys(metadata).length > 0) {
                msg += ` ${JSON.stringify(metadata)}`;
              }
              
              return msg;
            }),
          ),
        }),
        // File transport - errors
        new winston.transports.File({
          filename: path.join(logDir, 'error.log'),
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
        // File transport - combined
        new winston.transports.File({
          filename: path.join(logDir, 'combined.log'),
          maxsize: 5242880,
          maxFiles: 5,
        }),
      ],
    });
  }

  setContext(context: string) {
    this.context = context;
  }

  log(message: string, metadata?: any) {
    this.logger.info(message, { context: this.context, ...metadata });
  }

  error(message: string, trace?: string, metadata?: any) {
    this.logger.error(message, { context: this.context, trace, ...metadata });
  }

  warn(message: string, metadata?: any) {
    this.logger.warn(message, { context: this.context, ...metadata });
  }

  debug(message: string, metadata?: any) {
    this.logger.debug(message, { context: this.context, ...metadata });
  }

  verbose(message: string, metadata?: any) {
    this.logger.verbose(message, { context: this.context, ...metadata });
  }
}
