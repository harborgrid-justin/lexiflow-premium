import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { EnterpriseExceptionFilter } from './common/filters/enterprise-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';
import { validationPipeConfig } from './config/validation';
import { setupSwagger } from './config/swagger.config';
import { initTelemetry, shutdownTelemetry } from './telemetry';
import * as MasterConfig from './config/master.config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Initialize OpenTelemetry BEFORE creating NestJS application
  // This ensures all auto-instrumentation is set up before any application code runs
  if (process.env.OTEL_ENABLED === 'true') {
    logger.log('Initializing OpenTelemetry...');
    initTelemetry();
  }

  // Process-level error handlers for production stability
  process.on('unhandledRejection', (reason, promise) => {
    logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  });

  process.on('uncaughtException', (error) => {
    logger.error(`Uncaught Exception: ${error.message}`, error.stack);
    process.exit(1);
  });

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Security Headers
  app.use(helmet());

  // Compression
  app.use(compression.default());

  const configService = app.get(ConfigService);

  // CORS Configuration
  app.enableCors({
    origin: configService.get('cors.origin'),
    credentials: configService.get('cors.credentials'),
  });

  // Global API Prefix - All routes will be prefixed with /api
  app.setGlobalPrefix('api');

  // API Versioning - Enable URI-based versioning (e.g., /api/v1/...)
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1', // Default to v1 if no version specified
    prefix: 'api/v', // Results in /api/v1/, /api/v2/, etc.
  });

  // Global Filters (Exception Handling) - Use enterprise filter for structured error responses
  app.useGlobalFilters(new EnterpriseExceptionFilter());

  // Global Interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TimeoutInterceptor(MasterConfig.REQUEST_TIMEOUT_MS),
  );

  // Global Validation Pipe
  app.useGlobalPipes(new ValidationPipe(validationPipeConfig));

  // Swagger API Documentation
  setupSwagger(app);

  // Start server on all interfaces (0.0.0.0) to accept connections from any IP
  const port = configService.get('port');
  await app.listen(port, '0.0.0.0');

  const env = configService.get('nodeEnv');
  const telemetryStatus = process.env.OTEL_ENABLED === 'true' ? 'Enabled' : 'Disabled';
  logger.log(`
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║          LexiFlow Enterprise Backend - API Server                ║
║                                                                   ║
║   Server: http://localhost:${port}                                     ║
║   API Docs: http://localhost:${port}/api/docs                          ║
║   Environment: ${env.padEnd(53)}║
║   Telemetry: ${telemetryStatus.padEnd(53)}║
║                                                                   ║
║   Active Modules:                                                 ║
║   - Authentication & Authorization (JWT, RBAC)                    ║
║   - User Management                                               ║
║   - Case Management (Cases, Parties, Teams, Phases)              ║
║   - Document Management (Documents, Versions, OCR)               ║
║   - Discovery & E-Discovery                                       ║
║   - Billing & Finance (Time, Invoices, Trust Accounts)           ║
║   - Compliance & Audit (Conflict Checks, Ethical Walls)          ║
║   - Communications (Messaging, Email, Notifications)             ║
║   - Analytics & Search                                            ║
║   - GraphQL API & Integrations                                    ║
║   - Telemetry & Observability (OpenTelemetry)                    ║
║                                                                   ║
║   Database: PostgreSQL                                            ║
║   Queue System: Redis + Bull                                      ║
║   Real-time: WebSockets                                           ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
  `);

  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Swagger documentation available at: http://localhost:${port}/api/docs`);

  // Handle graceful shutdown for telemetry
  if (process.env.OTEL_ENABLED === 'true') {
    process.on('beforeExit', async () => {
      logger.log('Shutting down OpenTelemetry...');
      await shutdownTelemetry();
    });
  }
}

bootstrap();
