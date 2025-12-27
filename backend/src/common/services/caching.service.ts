import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Jurisdiction } from '../../jurisdictions/entities/jurisdiction.entity';

@Injectable()
export class CachingService implements OnModuleDestroy {
  private readonly logger = new Logger(CachingService.name);
  private cache = new Map<string, { value: any; expiry: number }>();
  private cleanupInterval: NodeJS.Timeout;
  private readonly MAX_CACHE_SIZE = 5000;

  constructor() {
    // Cleanup expired cache entries every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  private cleanup() {
    const now = Date.now();
    let removedCount = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiry <= now) {
        this.cache.delete(key);
        removedCount++;
      }
    }
    if (removedCount > 0) {
      this.logger.debug(`Cleaned up ${removedCount} expired cache entries`);
    }
    
    // Enforce max size
    if (this.cache.size > this.MAX_CACHE_SIZE) {
      const entries = Array.from(this.cache.entries());
      // Sort by expiry (remove soonest to expire first) or just remove oldest inserted?
      // Maps preserve insertion order, so first items are oldest.
      // Let's remove the first 10%
      const toRemove = Math.ceil(this.MAX_CACHE_SIZE * 0.1);
      for (let i = 0; i < toRemove; i++) {
        if (entries[i]) {
          this.cache.delete(entries[i][0]);
        }
      }
      this.logger.warn(`Cache size limit reached. Evicted ${toRemove} entries.`);
    }
  }

  /**
   * Get value from cache or fetch from database
   */
  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 3600, // 1 hour default
  ): Promise<T> {
    // Check cache first
    const cached = this.cache.get(key);
    if (cached && cached.expiry > Date.now()) {
      return cached.value as T;
    }

    // Fetch from database
    const value = await fetcher();

    // Store in cache
    if (value !== undefined && value !== null) {
      this.cache.set(key, {
        value,
        expiry: Date.now() + ttl * 1000,
      });
    }

    return value;
  }

  /**
   * Invalidate cache by key pattern
   */
  async invalidate(keyPattern: string): Promise<void> {
    // Simple exact key deletion (pattern matching can be added if needed)
    this.cache.delete(keyPattern);
  }

  /**
   * Invalidate multiple keys
   */
  async invalidateMultiple(keys: string[]): Promise<void> {
    keys.forEach(key => this.cache.delete(key));
  }

  /**
   * Clear all cache
   */
  async clearAll(): Promise<void> {
    this.cache.clear();
  }
}

@Injectable()
export class StaticDataCachingService {
  constructor(
    @InjectRepository(Jurisdiction)
    private jurisdictionRepo: Repository<Jurisdiction>,
    private cachingService: CachingService,
  ) {}

  async getJurisdictions(): Promise<Jurisdiction[]> {
    return this.cachingService.getOrFetch(
      'static:jurisdictions:all',
      () => this.jurisdictionRepo.find({ order: { name: 'ASC' } }),
      86400, // 24 hours
    );
  }

  async getJurisdictionById(id: string): Promise<Jurisdiction | null> {
    return this.cachingService.getOrFetch(
      `static:jurisdiction:${id}`,
      () => this.jurisdictionRepo.findOne({ where: { id } }),
      86400,
    );
  }

  async invalidateJurisdictions(): Promise<void> {
    await this.cachingService.invalidate('static:jurisdictions:all');
  }
}
