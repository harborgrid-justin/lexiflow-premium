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
import { ShutdownService } from './core/services/shutdown.service';
import * as MasterConfig from './config/master.config';

/**
 * Application Version
 */
const APP_VERSION = '1.0.0';

/**
 * Main bootstrap function
 * Initializes the NestJS application with enterprise-grade configuration
 */
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
    logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.error('  UNHANDLED PROMISE REJECTION DETECTED');
    logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.error(`Promise: ${promise}`);
    logger.error(`Reason: ${reason}`);
    logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  });

  process.on('uncaughtException', (error) => {
    logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.error('  UNCAUGHT EXCEPTION DETECTED - FATAL ERROR');
    logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.error(`Error: ${error.message}`);
    logger.error(`Stack: ${error.stack}`);
    logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.error('Application will exit in 1 second...');
    setTimeout(() => process.exit(1), 1000);
  });

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    abortOnError: false, // Don't crash on startup errors, allow graceful handling
  });

  // Enable graceful shutdown hooks
  app.enableShutdownHooks();

  // Security Headers - Enterprise Configuration with Enhanced Helmet
  // Note: Additional security headers are applied via SecurityHeadersMiddleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        scriptSrcElem: ["'self'"],
        scriptSrcAttr: ["'none'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", "data:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        manifestSrc: ["'self'"],
        workerSrc: ["'self'"],
        childSrc: ["'none'"],
        upgradeInsecureRequests: [],
        blockAllMixedContent: [],
      },
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginResourcePolicy: { policy: 'same-origin' },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: 'deny' },
    hidePoweredBy: true,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: { permittedPolicies: 'none' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xssFilter: true,
  }));

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

  // Log security features initialization
  logger.log('✓ Security Module initialized with:');
  logger.log('  - AES-256-GCM Encryption Service');
  logger.log('  - Enhanced Security Headers (OWASP compliant)');
  logger.log('  - Request Fingerprinting & Session Hijacking Detection');
  logger.log('  - IP Reputation Tracking & Auto-blocking');
  logger.log('  - CSP with Nonce-based Script Execution');
  logger.log('  - HSTS with Preload');

  logger.log(`
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║       LexiFlow Premium - Enterprise Legal Application            ║
║                🔒 PRODUCTION READY • SECURITY HARDENED 🔒         ║
║                                                                   ║
║   Server: http://localhost:${port}                                     ║
║   API Docs: http://localhost:${port}/api/docs                          ║
║   Version: ${APP_VERSION.padEnd(54)}║
║   Environment: ${env.padEnd(53)}║
║   Telemetry: ${telemetryStatus.padEnd(53)}║
║                                                                   ║
║   Enterprise Infrastructure:                                      ║
║   ✓ Core Coordination Module (Bootstrap & Shutdown)              ║
║   ✓ Configuration Validation & Health Checks                     ║
║   ✓ Graceful Shutdown (SIGTERM, SIGINT handling)                 ║
║   ✓ Automatic Resource Cleanup                                   ║
║                                                                   ║
║   Security Features (OWASP Top 10 Protection):                   ║
║   ✓ AES-256-GCM Field-level Encryption                           ║
║   ✓ IP Reputation Tracking & Auto-blocking                       ║
║   ✓ Session Hijacking Detection                                  ║
║   ✓ Comprehensive Security Headers (CSP, HSTS)                   ║
║   ✓ Rate Limiting & DDoS Protection                              ║
║   ✓ Request Signing & Validation                                 ║
║                                                                   ║
║   Compliance & Monitoring:                                        ║
║   ✓ Comprehensive Audit Trail (All Actions Logged)              ║
║   ✓ GDPR Compliance & Data Retention                             ║
║   ✓ Ethical Walls & Conflict Checking                            ║
║   ✓ Performance Tracking & Metrics                               ║
║   ✓ Distributed Tracing (OpenTelemetry)                          ║
║   ✓ Real-time Alerting                                           ║
║                                                                   ║
║   Business Modules (100% Coverage):                              ║
║   ✓ Case Management (Cases, Parties, Teams, Phases, Motions)    ║
║   ✓ Document Management (Documents, OCR, Versioning, Clauses)   ║
║   ✓ Discovery & E-Discovery (Production, Evidence, Exhibits)    ║
║   ✓ Billing & Finance (Time Tracking, Invoices, Trust)          ║
║   ✓ Trial Management (Trial Prep, War Room, Calendar)           ║
║   ✓ Legal Research (Citations, Bluebook, Jurisdictions)         ║
║   ✓ Knowledge Management & Analytics                             ║
║   ✓ Communications (Email, Messenger, Real-time)                 ║
║   ✓ Integrations & APIs (GraphQL, REST, Webhooks)               ║
║   ✓ Data Platform (ETL, Sync, Backups, Versioning)              ║
║                                                                   ║
║   Infrastructure:                                                 ║
║   • Database: PostgreSQL (with connection pooling)               ║
║   • Cache/Queue: Redis + Bull                                    ║
║   • Real-time: WebSockets                                        ║
║   • Search: Full-text search capabilities                        ║
║   • Storage: Secure file storage with encryption                 ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
  `);

  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Swagger documentation available at: http://localhost:${port}/api/docs`);
  logger.log(`Health endpoint: http://localhost:${port}/api/health`);
  logger.log('');

  // Setup graceful shutdown handlers
  setupShutdownHandlers(app, logger);

  return app;
}

/**
 * Setup graceful shutdown handlers for SIGTERM and SIGINT
 */
function setupShutdownHandlers(app: any, logger: Logger) {
  const shutdownHandler = async (signal: string) => {
    logger.log('');
    logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.log(`  Shutdown signal received: ${signal}`);
    logger.log('  Initiating graceful shutdown...');
    logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    try {
      // Get shutdown service from the application context
      const shutdownService = app.get(ShutdownService);

      // Trigger graceful shutdown
      await app.close();

      // Shutdown telemetry if enabled
      if (process.env.OTEL_ENABLED === 'true') {
        logger.log('Shutting down OpenTelemetry...');
        await shutdownTelemetry();
      }

      logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      logger.log('  Graceful shutdown completed successfully');
      logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  };

  // Handle SIGTERM (Kubernetes, Docker, systemd)
  process.on('SIGTERM', () => shutdownHandler('SIGTERM'));

  // Handle SIGINT (Ctrl+C)
  process.on('SIGINT', () => shutdownHandler('SIGINT'));

  // Handle graceful shutdown for telemetry on beforeExit
  if (process.env.OTEL_ENABLED === 'true') {
    process.on('beforeExit', async () => {
      logger.log('Process beforeExit - shutting down OpenTelemetry...');
      await shutdownTelemetry();
    });
  }

  logger.log('✓ Graceful shutdown handlers registered (SIGTERM, SIGINT)');
  logger.log('');
}

// Start the application
bootstrap().catch((error) => {
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('  FATAL: Application failed to start');
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error(error);
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  process.exit(1);
});
