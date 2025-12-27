import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

/**
 * Redis health indicator for @nestjs/terminus
 * Checks connectivity and response time of Redis
 * Based on NestJS health check best practices
 * @see https://docs.nestjs.com/recipes/terminus#custom-health-indicator
 */
@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  private redisClient: Redis | null = null;

  constructor(private readonly configService: ConfigService) {
    super();
    this.initializeRedis();
  }

  private initializeRedis() {
    const redisEnabled = this.configService.get<boolean>('app.redis.enabled');
    if (!redisEnabled) {
      return;
    }

    const redisUrl = this.configService.get<string>('app.redis.url');
    if (redisUrl) {
      this.redisClient = new Redis(redisUrl);
    } else {
      this.redisClient = new Redis({
        host: this.configService.get<string>('app.redis.host'),
        port: this.configService.get<number>('app.redis.port'),
        password: this.configService.get<string>('app.redis.password'),
        username: this.configService.get<string>('app.redis.username'),
      });
    }
  }

  /**
   * Check Redis health by pinging the server
   */
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    if (!this.redisClient) {
      return this.getStatus(key, true, { message: 'Redis disabled' });
    }

    try {
      const startTime = Date.now();
      await this.redisClient.ping();
      const responseTime = Date.now() - startTime;

      return this.getStatus(key, true, {
        responseTime: `${responseTime}ms`,
        status: 'connected',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new HealthCheckError(
        'Redis check failed',
        this.getStatus(key, false, { message: errorMessage }),
      );
    }
  }

  /**
   * Clean up Redis connection on module destroy
   */
  async onModuleDestroy() {
    if (this.redisClient) {
      await this.redisClient.quit();
    }
  }
}
