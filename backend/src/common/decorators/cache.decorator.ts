import { SetMetadata } from '@nestjs/common';

export const CACHE_KEY = 'CACHE';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  key?: string; // Custom cache key
  tags?: string[]; // Tags for cache invalidation
}

export const Cacheable = (options: CacheOptions = {}) =>
  SetMetadata(CACHE_KEY, { ttl: 300, ...options });

// Alias for backward compatibility
export const Cache = Cacheable;
