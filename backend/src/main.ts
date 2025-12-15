import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { EnterpriseExceptionFilter } from './common/filters/enterprise-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';
import { validationPipeConfig } from './config/validation';
import { setupSwagger } from './config/swagger.config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

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

  // Global Filters (Exception Handling) - Use enterprise filter for structured error responses
  app.useGlobalFilters(new EnterpriseExceptionFilter());

  // Global Interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TimeoutInterceptor(30000), // 30 second timeout
  );

  // Global Validation Pipe
  app.useGlobalPipes(new ValidationPipe(validationPipeConfig));

  // Swagger API Documentation
  setupSwagger(app);

  // Start server
  const port = configService.get('port');
  await app.listen(port);

  const env = configService.get('nodeEnv');
  logger.log(`
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║          LexiFlow Enterprise Backend - API Server                ║
║                                                                   ║
║   Server: http://localhost:${port}                                     ║
║   API Docs: http://localhost:${port}/api/docs                          ║
║   Environment: ${env.padEnd(53)}║
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
║                                                                   ║
║   Database: PostgreSQL                                            ║
║   Queue System: Redis + Bull                                      ║
║   Real-time: WebSockets                                           ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
  `);

  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Swagger documentation available at: http://localhost:${port}/api/docs`);
}

bootstrap();
