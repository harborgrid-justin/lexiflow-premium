import { SetMetadata } from '@nestjs/common';

export const CACHE_KEY_METADATA = 'cache:key';
export const CACHE_TTL_METADATA = 'cache:ttl';

/**
 * Decorator to cache method results
 * @param keyPrefix Prefix for cache key
 * @param ttl Time to live in seconds (optional)
 *
 * @example
 * @Cacheable('user', 3600)
 * async findOne(id: string): Promise<User> {
 *   return await this.userRepository.findOne({ where: { id } });
 * }
 */
export const Cacheable = (keyPrefix: string, ttl?: number) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata(CACHE_KEY_METADATA, keyPrefix)(target, propertyKey, descriptor);
    if (ttl) {
      SetMetadata(CACHE_TTL_METADATA, ttl)(target, propertyKey, descriptor);
    }
    return descriptor;
  };
};

/**
 * Decorator to invalidate cache on method execution
 * @param keyPattern Pattern to match cache keys for invalidation
 *
 * @example
 * @CacheEvict('user:*')
 * async update(id: string, updateData: UpdateUserDto): Promise<User> {
 *   return await this.userRepository.save({ id, ...updateData });
 * }
 */
export const CacheEvict = (keyPattern: string) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = await originalMethod.apply(this, args);

      // Invalidate cache after method execution
      if (this.cacheService) {
        await this.cacheService.delPattern(keyPattern);
      }

      return result;
    };

    return descriptor;
  };
};

/**
 * Decorator to update cache on method execution
 * @param keyPrefix Prefix for cache key
 * @param ttl Time to live in seconds (optional)
 *
 * @example
 * @CachePut('user', 3600)
 * async update(id: string, updateData: UpdateUserDto): Promise<User> {
 *   const updated = await this.userRepository.save({ id, ...updateData });
 *   return updated;
 * }
 */
export const CachePut = (keyPrefix: string, ttl?: number) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = await originalMethod.apply(this, args);

      // Update cache after method execution
      if (this.cacheService && result && result.id) {
        const cacheKey = `${keyPrefix}:${result.id}`;
        await this.cacheService.set(cacheKey, result, ttl);
      }

      return result;
    };

    return descriptor;
  };
};

/**
 * Generate cache key from method arguments
 * @param prefix Key prefix
 * @param args Method arguments
 */
export function generateCacheKey(prefix: string, ...args: any[]): string {
  const argsKey = args
    .filter(arg => arg !== undefined && arg !== null)
    .map(arg => {
      if (typeof arg === 'object') {
        return JSON.stringify(arg);
      }
      return String(arg);
    })
    .join(':');

  return argsKey ? `${prefix}:${argsKey}` : prefix;
}
