import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { CACHE_KEY, CacheOptions } from '../decorators/cache.decorator';
import { CacheManagerService } from '../services/cache-manager.service';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CacheInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly cacheManager: CacheManagerService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const cacheOptions = this.reflector.get<CacheOptions>(
      CACHE_KEY,
      context.getHandler(),
    );

    if (!cacheOptions) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const cacheKey =
      cacheOptions.key ||
      `${request.method}:${request.url}:${JSON.stringify(request.query)}`;

    try {
      const cachedData = await this.cacheManager.get(cacheKey);

      if (cachedData) {
        this.logger.debug(`Cache hit for key: ${cacheKey}`);
        return of(cachedData);
      }

      this.logger.debug(`Cache miss for key: ${cacheKey}`);

      return next.handle().pipe(
        tap(async (data) => {
          await this.cacheManager.set(cacheKey, data, cacheOptions.ttl);
          this.logger.debug(`Cached data for key: ${cacheKey}`);
        }),
      );
    } catch (error) {
      this.logger.error(`Cache error: ${error.message}`, error.stack);
      return next.handle();
    }
  }
}
