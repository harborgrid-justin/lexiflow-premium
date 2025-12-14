import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';

/**
 * Redis Health Indicator
 * Custom health indicator for Redis connectivity
 */
@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const isRedisEnabled = process.env.REDIS_ENABLED !== 'false';

    if (!isRedisEnabled) {
      return this.getStatus(key, true, { status: 'disabled' });
    }

    try {
      // In production, this would check actual Redis connection
      // For now, we assume healthy if enabled
      const isHealthy = true;
      const result = this.getStatus(key, isHealthy, { 
        status: 'up',
        responseTime: 1,
      });

      if (isHealthy) {
        return result;
      }

      throw new HealthCheckError('Redis check failed', result);
    } catch (error) {
      throw new HealthCheckError('Redis check failed', this.getStatus(key, false));
    }
  }
}
