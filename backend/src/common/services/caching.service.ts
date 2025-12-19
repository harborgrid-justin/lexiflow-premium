import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Jurisdiction } from '../entities/jurisdiction.entity';
import { PracticeArea } from '../../practice-areas/entities/practice-area.entity';

@Injectable()
export class CachingService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Get value from cache or fetch from database
   */
  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 3600, // 1 hour default
  ): Promise<T> {
    // Check cache first
    let value = await this.cacheManager.get<T>(key);

    if (value !== undefined && value !== null) {
      return value;
    }

    // Fetch from database
    value = await fetcher();

    // Store in cache
    if (value !== undefined && value !== null) {
      await this.cacheManager.set(key, value, ttl);
    }

    return value;
  }

  /**
   * Invalidate cache by key pattern
   */
  async invalidate(keyPattern: string): Promise<void> {
    // For simple implementation with cache-manager
    await this.cacheManager.del(keyPattern);
  }

  /**
   * Invalidate multiple keys
   */
  async invalidateMultiple(keys: string[]): Promise<void> {
    await Promise.all(keys.map(key => this.cacheManager.del(key)));
  }

  /**
   * Clear all cache
   */
  async clearAll(): Promise<void> {
    await this.cacheManager.reset();
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

  async getJurisdictionById(id: string): Promise<Jurisdiction> {
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
