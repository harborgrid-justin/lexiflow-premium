import { Injectable, Inject } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      // Try to set and get a test value
      const testKey = '__health_check__';
      const testValue = Date.now().toString();

      await this.cacheManager.set(testKey, testValue, 1000);
      const retrievedValue = await this.cacheManager.get(testKey);

      if (retrievedValue !== testValue) {
        throw new Error('Redis read/write verification failed');
      }

      // Clean up test key
      await this.cacheManager.del(testKey);

      const result = this.getStatus(key, true, {
        status: 'up',
        message: 'Redis connection is healthy',
      });

      return result;
    } catch (error) {
      const result = this.getStatus(key, false, {
        status: 'down',
        message: error.message || 'Redis connection failed',
      });
      throw new HealthCheckError('Redis health check failed', result);
    }
  }

  async checkConnection(key: string): Promise<HealthIndicatorResult> {
    try {
      const store = this.cacheManager.store as any;

      // Get Redis client info if available
      let info: any = {
        status: 'up',
        message: 'Redis connection is active',
      };

      // Try to get Redis server info if client supports it
      if (store.client && typeof store.client.info === 'function') {
        const redisInfo = await store.client.info();
        info.server = this.parseRedisInfo(redisInfo);
      }

      const result = this.getStatus(key, true, info);
      return result;
    } catch (error) {
      const result = this.getStatus(key, false, {
        status: 'down',
        message: error.message || 'Failed to check Redis connection',
      });
      throw new HealthCheckError('Redis connection check failed', result);
    }
  }

  async checkMemory(key: string): Promise<HealthIndicatorResult> {
    try {
      const store = this.cacheManager.store as any;

      if (!store.client || typeof store.client.info !== 'function') {
        throw new Error('Redis client does not support info command');
      }

      const info = await store.client.info('memory');
      const memoryInfo = this.parseRedisInfo(info);

      const usedMemory = parseInt(memoryInfo.used_memory || '0', 10);
      const maxMemory = parseInt(memoryInfo.maxmemory || '0', 10);

      const result = this.getStatus(key, true, {
        status: 'up',
        message: 'Redis memory usage is normal',
        memory: {
          used: usedMemory,
          max: maxMemory,
          usedHuman: memoryInfo.used_memory_human,
          maxHuman: memoryInfo.maxmemory_human,
        },
      });

      return result;
    } catch (error) {
      const result = this.getStatus(key, false, {
        status: 'down',
        message: error.message || 'Failed to check Redis memory',
      });
      throw new HealthCheckError('Redis memory check failed', result);
    }
  }

  private parseRedisInfo(info: string): Record<string, string> {
    const lines = info.split('\r\n');
    const result: Record<string, string> = {};

    for (const line of lines) {
      if (line && !line.startsWith('#')) {
        const [key, value] = line.split(':');
        if (key && value) {
          result[key.trim()] = value.trim();
        }
      }
    }

    return result;
  }
}
