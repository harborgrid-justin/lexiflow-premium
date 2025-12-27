import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import Redis from 'ioredis';

/**
 * Configuration issue severity levels
 */
export enum ConfigIssueSeverity {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

/**
 * Configuration validation issue
 */
export interface ConfigIssue {
  severity: ConfigIssueSeverity;
  category: string;
  message: string;
  key?: string;
  recommendation?: string;
}

/**
 * Configuration validation result
 */
export interface ConfigValidationResult {
  valid: boolean;
  issues: ConfigIssue[];
  errors: ConfigIssue[];
  warnings: ConfigIssue[];
  info: ConfigIssue[];
}

/**
 * Configuration Validator Service
 * Validates all required environment variables and system configurations
 * Checks database and Redis connectivity
 * Validates secret strength and security settings
 */
@Injectable()
export class ConfigurationValidatorService implements OnModuleInit {
  private readonly logger = new Logger(ConfigurationValidatorService.name);
  private readonly issues: ConfigIssue[] = [];

  constructor(
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    this.logger.log('Initializing configuration validator...');
  }

  /**
   * Validate all configuration settings
   */
  async validateAll(): Promise<ConfigValidationResult> {
    this.issues.length = 0;

    this.logger.log('Starting comprehensive configuration validation...');

    // Run all validation checks
    this.validateEnvironment();
    this.validateSecrets();
    this.validateDatabase();
    await this.validateDatabaseConnection();
    this.validateRedis();
    await this.validateRedisConnection();
    this.validateSecurity();
    this.validateRateLimiting();
    this.validateFileStorage();

    // Categorize issues
    const errors = this.issues.filter(i => i.severity === ConfigIssueSeverity.ERROR);
    const warnings = this.issues.filter(i => i.severity === ConfigIssueSeverity.WARNING);
    const info = this.issues.filter(i => i.severity === ConfigIssueSeverity.INFO);

    const valid = errors.length === 0;

    // Log results
    this.logValidationResults({ valid, issues: this.issues, errors, warnings, info });

    return {
      valid,
      issues: this.issues,
      errors,
      warnings,
      info,
    };
  }

  /**
   * Validate environment configuration
   */
  private validateEnvironment(): void {
    const nodeEnv = this.configService.get<string>('nodeEnv');

    if (!nodeEnv) {
      this.addIssue(
        ConfigIssueSeverity.ERROR,
        'environment',
        'NODE_ENV is not set',
        'NODE_ENV',
        'Set NODE_ENV to one of: development, staging, production'
      );
    } else if (!['development', 'production', 'test', 'staging'].includes(nodeEnv)) {
      this.addIssue(
        ConfigIssueSeverity.WARNING,
        'environment',
        `NODE_ENV has unexpected value: ${nodeEnv}`,
        'NODE_ENV',
        'Use one of: development, staging, production, test'
      );
    }

    if (nodeEnv === 'production') {
      // Production-specific validations
      const demoMode = this.configService.get<boolean>('DEMO_MODE');
      if (demoMode) {
        this.addIssue(
          ConfigIssueSeverity.WARNING,
          'environment',
          'DEMO_MODE is enabled in production',
          'DEMO_MODE',
          'Disable DEMO_MODE in production environments'
        );
      }
    }

    const port = this.configService.get<number>('port');
    if (!port || port < 1 || port > 65535) {
      this.addIssue(
        ConfigIssueSeverity.ERROR,
        'environment',
        'Invalid or missing PORT configuration',
        'PORT',
        'Set PORT to a valid port number (1-65535)'
      );
    }
  }

  /**
   * Validate JWT secrets and strength
   */
  private validateSecrets(): void {
    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    const jwtRefreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');

    // JWT Secret validation
    if (!jwtSecret) {
      this.addIssue(
        ConfigIssueSeverity.ERROR,
        'security',
        'JWT_SECRET is not configured',
        'JWT_SECRET',
        'Generate a strong random secret (minimum 32 characters)'
      );
    } else {
      if (jwtSecret.length < 32) {
        this.addIssue(
          ConfigIssueSeverity.ERROR,
          'security',
          `JWT_SECRET is too short (${jwtSecret.length} characters)`,
          'JWT_SECRET',
          'Use a secret with at least 32 characters'
        );
      } else if (jwtSecret.length < 64) {
        this.addIssue(
          ConfigIssueSeverity.WARNING,
          'security',
          `JWT_SECRET should be longer for better security (current: ${jwtSecret.length} characters)`,
          'JWT_SECRET',
          'Consider using a 64+ character secret'
        );
      }

      // Check for weak patterns
      if (this.isWeakSecret(jwtSecret)) {
        this.addIssue(
          ConfigIssueSeverity.ERROR,
          'security',
          'JWT_SECRET appears to be weak or predictable',
          'JWT_SECRET',
          'Use a cryptographically random secret'
        );
      }
    }

    // JWT Refresh Secret validation
    if (!jwtRefreshSecret) {
      this.addIssue(
        ConfigIssueSeverity.ERROR,
        'security',
        'JWT_REFRESH_SECRET is not configured',
        'JWT_REFRESH_SECRET',
        'Generate a strong random secret (minimum 32 characters)'
      );
    } else if (jwtRefreshSecret.length < 32) {
      this.addIssue(
        ConfigIssueSeverity.ERROR,
        'security',
        `JWT_REFRESH_SECRET is too short (${jwtRefreshSecret.length} characters)`,
        'JWT_REFRESH_SECRET',
        'Use a secret with at least 32 characters'
      );
    }

    // Ensure secrets are different
    if (jwtSecret && jwtRefreshSecret && jwtSecret === jwtRefreshSecret) {
      this.addIssue(
        ConfigIssueSeverity.ERROR,
        'security',
        'JWT_SECRET and JWT_REFRESH_SECRET must be different',
        'JWT_REFRESH_SECRET',
        'Generate different secrets for access and refresh tokens'
      );
    }
  }

  /**
   * Validate database configuration
   */
  private validateDatabase(): void {
    const databaseUrl = this.configService.get<string>('DATABASE_URL');
    const databaseHost = this.configService.get<string>('database.host');
    const databaseName = this.configService.get<string>('database.name');

    if (!databaseUrl && !databaseHost) {
      this.addIssue(
        ConfigIssueSeverity.ERROR,
        'database',
        'No database connection configured',
        'DATABASE_URL',
        'Set DATABASE_URL or individual database connection parameters'
      );
    }

    if (!databaseName) {
      this.addIssue(
        ConfigIssueSeverity.WARNING,
        'database',
        'Database name not specified',
        'DATABASE_NAME',
        'Specify a database name'
      );
    }

    // Check SSL configuration in production
    const nodeEnv = this.configService.get<string>('nodeEnv');
    const dbSsl = this.configService.get<boolean>('DB_SSL');

    if (nodeEnv === 'production' && !dbSsl) {
      this.addIssue(
        ConfigIssueSeverity.WARNING,
        'database',
        'Database SSL is not enabled in production',
        'DB_SSL',
        'Enable SSL for production database connections'
      );
    }
  }

  /**
   * Validate database connection
   */
  private async validateDatabaseConnection(): Promise<void> {
    try {
      if (!this.dataSource.isInitialized) {
        this.addIssue(
          ConfigIssueSeverity.ERROR,
          'database',
          'Database is not initialized',
          undefined,
          'Check database connection parameters'
        );
        return;
      }

      await this.dataSource.query('SELECT 1');
      this.addIssue(
        ConfigIssueSeverity.INFO,
        'database',
        'Database connection successful',
      );
    } catch (error) {
      this.addIssue(
        ConfigIssueSeverity.ERROR,
        'database',
        `Database connection failed: ${error.message}`,
        undefined,
        'Verify database is running and credentials are correct'
      );
    }
  }

  /**
   * Validate Redis configuration
   */
  private validateRedis(): void {
    const redisEnabled = this.configService.get<boolean>('REDIS_ENABLED', true);

    if (!redisEnabled) {
      this.addIssue(
        ConfigIssueSeverity.WARNING,
        'redis',
        'Redis is disabled - some features may not work',
        'REDIS_ENABLED',
        'Enable Redis for full functionality (caching, queues, sessions)'
      );
      return;
    }

    const redisUrl = this.configService.get<string>('redis.url');
    const redisHost = this.configService.get<string>('redis.host');

    if (!redisUrl && !redisHost) {
      this.addIssue(
        ConfigIssueSeverity.WARNING,
        'redis',
        'No Redis connection configured',
        'REDIS_HOST',
        'Configure Redis for caching and queue management'
      );
    }
  }

  /**
   * Validate Redis connection
   */
  private async validateRedisConnection(): Promise<void> {
    const redisEnabled = this.configService.get<boolean>('REDIS_ENABLED', true);

    if (!redisEnabled) {
      return;
    }

    let redisClient: Redis | null = null;

    try {
      const redisUrl = this.configService.get<string>('redis.url');
      const redisHost = this.configService.get<string>('redis.host', 'localhost');
      const redisPort = this.configService.get<number>('redis.port', 6379);
      const redisPassword = this.configService.get<string>('redis.password');

      if (redisUrl) {
        redisClient = new Redis(redisUrl);
      } else {
        redisClient = new Redis({
          host: redisHost,
          port: redisPort,
          password: redisPassword || undefined,
          lazyConnect: true,
        });
      }

      await redisClient.connect();
      await redisClient.ping();

      this.addIssue(
        ConfigIssueSeverity.INFO,
        'redis',
        'Redis connection successful',
      );

      await redisClient.quit();
    } catch (error) {
      this.addIssue(
        ConfigIssueSeverity.WARNING,
        'redis',
        `Redis connection failed: ${error.message}`,
        undefined,
        'Verify Redis is running and credentials are correct'
      );
    } finally {
      if (redisClient) {
        await redisClient.quit().catch(() => {});
      }
    }
  }

  /**
   * Validate security settings
   */
  private validateSecurity(): void {
    const corsOrigin = this.configService.get<string>('cors.origin');
    const nodeEnv = this.configService.get<string>('nodeEnv');

    if (nodeEnv === 'production' && corsOrigin === '*') {
      this.addIssue(
        ConfigIssueSeverity.ERROR,
        'security',
        'CORS is configured to allow all origins in production',
        'CORS_ORIGIN',
        'Restrict CORS to specific allowed origins'
      );
    }
  }

  /**
   * Validate rate limiting configuration
   */
  private validateRateLimiting(): void {
    const rateLimit = this.configService.get<number>('RATE_LIMIT_LIMIT');
    const rateLimitTtl = this.configService.get<number>('RATE_LIMIT_TTL');

    if (!rateLimit) {
      this.addIssue(
        ConfigIssueSeverity.WARNING,
        'security',
        'Rate limiting is not configured',
        'RATE_LIMIT_LIMIT',
        'Configure rate limiting to protect against abuse'
      );
    }

    if (!rateLimitTtl) {
      this.addIssue(
        ConfigIssueSeverity.WARNING,
        'security',
        'Rate limiting TTL is not configured',
        'RATE_LIMIT_TTL',
        'Set rate limit time window'
      );
    }
  }

  /**
   * Validate file storage configuration
   */
  private validateFileStorage(): void {
    const uploadDir = this.configService.get<string>('UPLOAD_DIR');

    if (!uploadDir) {
      this.addIssue(
        ConfigIssueSeverity.WARNING,
        'storage',
        'Upload directory is not configured',
        'UPLOAD_DIR',
        'Specify upload directory for file storage'
      );
    }
  }

  /**
   * Check if a secret appears to be weak
   */
  private isWeakSecret(secret: string): boolean {
    // Check for common weak patterns
    const weakPatterns = [
      /^(secret|password|test|demo|admin|changeme)/i,
      /^(12345|qwerty|abc)/i,
      /^(.)\1{5,}$/, // Repeated characters
    ];

    return weakPatterns.some(pattern => pattern.test(secret));
  }

  /**
   * Add a configuration issue
   */
  private addIssue(
    severity: ConfigIssueSeverity,
    category: string,
    message: string,
    key?: string,
    recommendation?: string,
  ): void {
    this.issues.push({
      severity,
      category,
      message,
      key,
      recommendation,
    });
  }

  /**
   * Log validation results
   */
  private logValidationResults(result: ConfigValidationResult): void {
    const { valid, errors, warnings, info } = result;

    this.logger.log('═══════════════════════════════════════════════════════');
    this.logger.log('         Configuration Validation Results');
    this.logger.log('═══════════════════════════════════════════════════════');

    if (valid) {
      this.logger.log('✓ Configuration is valid');
    } else {
      this.logger.error(`✗ Configuration has ${errors.length} error(s)`);
    }

    if (warnings.length > 0) {
      this.logger.warn(`⚠ ${warnings.length} warning(s) found`);
    }

    if (info.length > 0) {
      this.logger.log(`ℹ ${info.length} info message(s)`);
    }

    this.logger.log('═══════════════════════════════════════════════════════');

    // Log errors
    if (errors.length > 0) {
      this.logger.error('ERRORS:');
      errors.forEach(issue => {
        this.logger.error(`  [${issue.category}] ${issue.message}`);
        if (issue.recommendation) {
          this.logger.error(`    → ${issue.recommendation}`);
        }
      });
    }

    // Log warnings
    if (warnings.length > 0) {
      this.logger.warn('WARNINGS:');
      warnings.forEach(issue => {
        this.logger.warn(`  [${issue.category}] ${issue.message}`);
        if (issue.recommendation) {
          this.logger.warn(`    → ${issue.recommendation}`);
        }
      });
    }

    // Log info (only in debug mode)
    if (info.length > 0) {
      info.forEach(issue => {
        this.logger.debug(`[${issue.category}] ${issue.message}`);
      });
    }

    this.logger.log('═══════════════════════════════════════════════════════');
  }
}
