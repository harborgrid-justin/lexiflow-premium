import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';
import { validationPipeConfig } from './config/validation';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Security Headers
  app.use(helmet());

  // Compression
  app.use(compression());

  const configService = app.get(ConfigService);

  // CORS Configuration
  app.enableCors({
    origin: configService.get('cors.origin'),
    credentials: configService.get('cors.credentials'),
  });

  // Global Filters (Exception Handling)
  app.useGlobalFilters(
    new AllExceptionsFilter(),
    new HttpExceptionFilter(),
  );

  // Global Interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TimeoutInterceptor(30000), // 30 second timeout
  );

  // Global Validation Pipe
  app.useGlobalPipes(new ValidationPipe(validationPipeConfig));

  // Swagger API Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('LexiFlow Enterprise API')
    .setDescription('Comprehensive Legal Practice Management System')
    .setVersion('1.0.0')
    .addTag('health', 'Health check and system status endpoints')
    .addTag('auth', 'Authentication and authorization endpoints')
    .addTag('users', 'User management endpoints')
    .addTag('cases', 'Case management endpoints')
    .addTag('parties', 'Party management endpoints')
    .addTag('case-teams', 'Case team management endpoints')
    .addTag('case-phases', 'Case phase tracking endpoints')
    .addTag('motions', 'Motion management endpoints')
    .addTag('docket', 'Docket entry management endpoints')
    .addTag('projects', 'Project management endpoints')
    .addTag('documents', 'Document management endpoints')
    .addTag('document-versions', 'Document version control endpoints')
    .addTag('clauses', 'Clause library management endpoints')
    .addTag('pleadings', 'Pleading document management endpoints')
    .addTag('processing-jobs', 'Document processing job endpoints')
    .addTag('discovery', 'Discovery and e-discovery endpoints')
    .addTag('billing', 'Billing and finance endpoints')
    .addTag('time-entries', 'Time tracking endpoints')
    .addTag('invoices', 'Invoice management endpoints')
    .addTag('compliance', 'Compliance and audit endpoints')
    .addTag('communications', 'Communication and messaging endpoints')
    .addTag('notifications', 'Notification management endpoints')
    .addTag('analytics', 'Analytics and reporting endpoints')
    .addTag('search', 'Search endpoints')
    .addTag('graphql', 'GraphQL API endpoints')
    .addTag('integrations', 'External integration endpoints')
    .addTag('webhooks', 'Webhook management endpoints')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  // Start server
  const port = configService.get('port');
  await app.listen(port);

  const env = configService.get('nodeEnv');
  logger.log(`
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║          LexiFlow Enterprise Backend - API Server                ║
║                                                                   ║
║   🚀 Server: http://localhost:${port}                                  ║
║   📚 API Docs: http://localhost:${port}/api/docs                       ║
║   🌍 Environment: ${env.padEnd(50)}║
║                                                                   ║
║   📦 Active Modules:                                              ║
║   ✅ Authentication & Authorization (JWT, RBAC)                   ║
║   ✅ User Management                                              ║
║   ✅ Case Management (Cases, Parties, Teams, Phases)             ║
║   ✅ Document Management (Documents, Versions, OCR)              ║
║   ✅ Discovery & E-Discovery                                      ║
║   ✅ Billing & Finance (Time, Invoices, Trust Accounts)          ║
║   ✅ Compliance & Audit (Conflict Checks, Ethical Walls)         ║
║   ✅ Communications (Messaging, Email, Notifications)            ║
║   ✅ Analytics & Search                                           ║
║   ✅ GraphQL API & Integrations                                   ║
║                                                                   ║
║   🔐 Default Admin Credentials:                                   ║
║   Email: admin@lexiflow.com                                      ║
║   Password: Admin123!                                            ║
║                                                                   ║
║   📊 Database: PostgreSQL                                         ║
║   🔄 Queue System: Redis + Bull                                   ║
║   📡 Real-time: WebSockets                                        ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
  `);

  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Swagger documentation available at: http://localhost:${port}/api/docs`);
}

bootstrap();
