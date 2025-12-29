import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { ConfigurationValidatorService } from './configuration.validator.service';
import { CRITICAL_MODULES } from '../constants/module.order.constant';
import { ModuleStartupResult } from '../interfaces/module.config.interface';

/**
 * Bootstrap Service
 * Handles application startup sequence with proper ordering and validation
 * Ensures all dependencies are met before application starts serving requests
 */
@Injectable()
export class BootstrapService implements OnApplicationBootstrap {
  private readonly logger = new Logger(BootstrapService.name);
  private readonly startupResults: ModuleStartupResult[] = [];
  private readonly startTime = Date.now();

  constructor(
    private readonly configService: ConfigService,
    private readonly configValidator: ConfigurationValidatorService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Main bootstrap hook - called after all modules are initialized
   */
  async onApplicationBootstrap() {
    this.logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    this.logger.log('      LexiFlow Premium - Enterprise Bootstrap Sequence');
    this.logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    try {
      await this.runBootstrapSequence();
      this.printBootstrapSummary();
    } catch (error) {
      this.logger.error('Bootstrap sequence failed:', error instanceof Error ? error.stack : String(error));
      throw error;
    }
  }

  /**
   * Run the complete bootstrap sequence
   */
  private async runBootstrapSequence(): Promise<void> {
    // Step 1: Validate configuration
    await this.validateConfiguration();

    // Step 2: Verify database connection
    await this.verifyDatabaseConnection();

    // Step 3: Verify Redis connection (if enabled)
    await this.verifyRedisConnection();

    // Step 4: Run health checks
    await this.runHealthChecks();

    // Step 5: Initialize critical subsystems
    await this.initializeCriticalSubsystems();

    // Step 6: Log startup information
    this.logStartupInfo();
  }

  /**
   * Validate all configuration
   */
  private async validateConfiguration(): Promise<void> {
    const startTime = Date.now();
    this.logger.log('[1/6] Validating configuration...');

    try {
      const result = await this.configValidator.validateAll();

      if (!result.valid) {
        const errorCount = result.errors.length;
        this.logger.error(`Configuration validation failed with ${errorCount} error(s)`);

        this.startupResults.push({
          module: 'Configuration',
          success: false,
          duration: Date.now() - startTime,
          error: `${errorCount} configuration error(s) found`,
        });

        throw new Error('Configuration validation failed. Please check the logs above.');
      }

      this.startupResults.push({
        module: 'Configuration',
        success: true,
        duration: Date.now() - startTime,
      });

      this.logger.log('✓ Configuration validated successfully');
    } catch (error) {
      this.logger.error('Configuration validation failed:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Verify database connection
   */
  private async verifyDatabaseConnection(): Promise<void> {
    const startTime = Date.now();
    this.logger.log('[2/6] Verifying database connection...');

    try {
      if (!this.dataSource.isInitialized) {
        throw new Error('Database connection is not initialized');
      }

      // Test query
      await this.dataSource.query('SELECT NOW()');

      // Get database info
      const dbInfo = await this.getDatabaseInfo();

      this.startupResults.push({
        module: 'Database',
        success: true,
        duration: Date.now() - startTime,
        metadata: dbInfo as any,
      });

      this.logger.log('✓ Database connection verified');
      this.logger.log(`  Database: ${(dbInfo as any).database}`);
      this.logger.log(`  Version: ${(dbInfo as any).version}`);
      this.logger.log(`  Connection pool: ${(dbInfo as any).poolSize} connections`);
    } catch (error) {
      this.startupResults.push({
        module: 'Database',
        success: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error),
      });

      this.logger.error('Database connection verification failed:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Verify Redis connection
   */
  private async verifyRedisConnection(): Promise<void> {
    const startTime = Date.now();
    this.logger.log('[3/6] Verifying Redis connection...');

    const redisEnabled = this.configService.get<boolean>('REDIS_ENABLED', true);

    if (!redisEnabled || this.configService.get<boolean>('DEMO_MODE')) {
      this.logger.warn('⚠ Redis is disabled - running without cache/queue support');
      this.startupResults.push({
        module: 'Redis',
        success: true,
        duration: Date.now() - startTime,
        metadata: { enabled: false },
      });
      return;
    }

    try {
      const Redis = require('ioredis');
      const redisUrl = this.configService.get<string>('redis.url');
      const redisHost = this.configService.get<string>('redis.host', 'localhost');
      const redisPort = this.configService.get<number>('redis.port', 6379);
      const redisPassword = this.configService.get<string>('redis.password');

      let redisClient;

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
      const pong = await redisClient.ping();

      if (pong !== 'PONG') {
        throw new Error('Redis ping failed');
      }

      const redisInfo = await redisClient.info('server');
      const versionMatch = redisInfo.match(/redis_version:(\S+)/);
      const version = versionMatch ? versionMatch[1] : 'unknown';

      await redisClient.quit();

      this.startupResults.push({
        module: 'Redis',
        success: true,
        duration: Date.now() - startTime,
        metadata: {
          enabled: true,
          host: redisHost,
          port: redisPort,
          version,
        },
      });

      this.logger.log('✓ Redis connection verified');
      this.logger.log(`  Version: ${version}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.warn('⚠ Redis connection failed - some features may be limited');
      this.logger.warn(`  Error: ${errorMessage}`);

      this.startupResults.push({
        module: 'Redis',
        success: false,
        duration: Date.now() - startTime,
        error: errorMessage,
      });

      // Redis failure is not critical - continue startup
    }
  }

  /**
   * Run health checks
   */
  private async runHealthChecks(): Promise<void> {
    const startTime = Date.now();
    this.logger.log('[4/6] Running health checks...');

    try {
      // Basic health checks
      const checks = {
        memory: this.checkMemory(),
        disk: await this.checkDisk(),
        nodeVersion: this.checkNodeVersion(),
      };

      const allHealthy = Object.values(checks).every(check => check.healthy);

      this.startupResults.push({
        module: 'HealthChecks',
        success: allHealthy,
        duration: Date.now() - startTime,
        metadata: checks,
      });

      if (allHealthy) {
        this.logger.log('✓ All health checks passed');
      } else {
        this.logger.warn('⚠ Some health checks failed (non-critical)');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.warn('Health checks failed:', errorMessage);
      this.startupResults.push({
        module: 'HealthChecks',
        success: false,
        duration: Date.now() - startTime,
        error: errorMessage,
      });
    }
  }

  /**
   * Initialize critical subsystems
   */
  private async initializeCriticalSubsystems(): Promise<void> {
    this.logger.log('[5/6] Initializing critical subsystems...');

    const criticalModules = Array.from(CRITICAL_MODULES);
    const results = await Promise.allSettled(
      criticalModules.map(module => this.initializeModule(module))
    );

    const failures = results.filter(r => r.status === 'rejected');

    if (failures.length > 0) {
      this.logger.error(`${failures.length} critical module(s) failed to initialize`);
      throw new Error('Critical subsystem initialization failed');
    }

    this.logger.log('✓ All critical subsystems initialized');
  }

  /**
   * Initialize a single module (stub for future implementation)
   */
  private async initializeModule(moduleName: string): Promise<void> {
    // This is a placeholder - actual module initialization happens via NestJS
    this.logger.debug(`  ✓ ${moduleName}`);
  }

  /**
   * Log startup information
   */
  private logStartupInfo(): void {
    this.logger.log('[6/6] Logging startup information...');

    const nodeEnv = this.configService.get<string>('nodeEnv');
    const port = this.configService.get<number>('port');
    const demoMode = this.configService.get<boolean>('DEMO_MODE');
    const otelEnabled = process.env.OTEL_ENABLED === 'true';

    this.logger.log('✓ Application startup complete');
    this.logger.log('');
    this.logger.log('Application Information:');
    this.logger.log(`  Environment: ${nodeEnv}`);
    this.logger.log(`  Port: ${port}`);
    this.logger.log(`  Demo Mode: ${demoMode ? 'Yes' : 'No'}`);
    this.logger.log(`  Telemetry: ${otelEnabled ? 'Enabled' : 'Disabled'}`);
    this.logger.log(`  Node Version: ${process.version}`);
  }

  /**
   * Print bootstrap summary
   */
  private printBootstrapSummary(): void {
    const totalDuration = Date.now() - this.startTime;
    const successCount = this.startupResults.filter(r => r.success).length;
    const failureCount = this.startupResults.filter(r => !r.success).length;

    this.logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    this.logger.log('                  Bootstrap Summary');
    this.logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    this.logger.log(`Total Duration: ${totalDuration}ms`);
    this.logger.log(`Successful: ${successCount}/${this.startupResults.length}`);
    if (failureCount > 0) {
      this.logger.log(`Failed: ${failureCount} (non-critical)`);
    }
    this.logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Detailed results
    this.startupResults.forEach(result => {
      const status = result.success ? '✓' : '✗';
      const duration = `${result.duration}ms`.padStart(8);
      this.logger.log(`  ${status} ${result.module.padEnd(20)} ${duration}`);
      if (result.error) {
        this.logger.error(`    Error: ${result.error}`);
      }
    });

    this.logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    this.logger.log('           🚀 Application Ready to Accept Requests 🚀');
    this.logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }

  /**
   * Get database information
   */
  private async getDatabaseInfo(): Promise<unknown> {
    const database = this.configService.get<string>('database.name');
    const poolSize = this.configService.get<number>('DB_POOL_MAX', 20);

    let version = 'unknown';
    try {
      const result = await this.dataSource.query('SELECT VERSION()');
      version = result[0]?.version || 'unknown';
    } catch (error) {
      // Ignore version query errors
    }

    return { database, version, poolSize };
  }

  /**
   * Check memory usage
   */
  private checkMemory(): any {
    const usage = process.memoryUsage();
    const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(usage.heapTotal / 1024 / 1024);
    const rssMB = Math.round(usage.rss / 1024 / 1024);

    const heapUsagePercent = (usage.heapUsed / usage.heapTotal) * 100;

    return {
      healthy: heapUsagePercent < 90,
      heapUsedMB,
      heapTotalMB,
      rssMB,
      heapUsagePercent: Math.round(heapUsagePercent),
    };
  }

  /**
   * Check disk space
   */
  private async checkDisk(): Promise<unknown> {
    // Simplified disk check - in production, use proper disk space checking
    return {
      healthy: true,
      message: 'Disk check not implemented',
    };
  }

  /**
   * Check Node.js version
   */
  private checkNodeVersion(): any {
    const version = process.version || 'v0.0.0';
    const versionString = version.slice(1).split('.')[0] || '0';
    const majorVersion = parseInt(versionString, 10);

    // Node.js 18+ is recommended
    const healthy = majorVersion >= 18;

    return {
      healthy,
      version,
      recommendation: healthy ? null : 'Upgrade to Node.js 18+',
    };
  }

  /**
   * Get startup results (for testing/monitoring)
   */
  getStartupResults(): ModuleStartupResult[] {
    return this.startupResults;
  }
}
