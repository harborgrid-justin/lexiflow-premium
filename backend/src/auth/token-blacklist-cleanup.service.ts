import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TokenBlacklistService } from './token-blacklist.service';

/**
 * TokenBlacklistCleanupService
 *
 * Scheduled service to clean up expired entries from the token blacklist.
 * Only needed for in-memory storage; Redis handles TTL automatically.
 *
 * Runs every hour to remove expired blacklist entries and prevent memory leaks.
 */
/**
 * ╔=================================================================================================================╗
 * ║TOKENBLACKLISTCLEANUP                                                                                            ║
 * ╠=================================================================================================================╣
 * ║                                                                                                                 ║
 * ║  External Request                   Controller                            Service                                ║
 * ║       │                                   │                                     │                                ║
 * ║       │  HTTP Endpoints                  │                                     │                                ║
 * ║       └───────────────────────────────────►                                     │                                ║
 * ║                                                                                                                 ║
 * ║                                                                 ┌───────────────┴───────────────┐                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          Repository                    Database                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          PostgreSQL                                          ║
 * ║                                                                                                                 ║
 * ║  DATA IN:  Data input                                                                                         ║

 * ║                                                                                                                 ║
 * ║  DATA OUT: Data output                                                                                        ║

 * ║                                                                                                                 ║

 * ╚=================================================================================================================╝
 */

@Injectable()
export class TokenBlacklistCleanupService {
  private readonly logger = new Logger(TokenBlacklistCleanupService.name);

  constructor(private tokenBlacklistService: TokenBlacklistService) {}

  /**
   * Clean up expired blacklist entries every hour
   * This is only necessary for in-memory storage
   * Redis automatically handles TTL expiration
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleCleanup() {
    try {
      this.logger.debug('Starting token blacklist cleanup...');
      const cleanedCount = await this.tokenBlacklistService.cleanupExpired();

      if (cleanedCount > 0) {
        this.logger.log(`Cleaned up ${cleanedCount} expired blacklist entries`);
      } else {
        this.logger.debug('No expired entries to clean up');
      }

      // Log current blacklist stats
      const stats = await this.tokenBlacklistService.getStats();
      this.logger.debug(
        `Blacklist stats: ${stats.size} entries in ${stats.storage} storage`,
      );
    } catch (error) {
      this.logger.error('Error during blacklist cleanup:', error);
    }
  }

  /**
   * Manual cleanup trigger (can be called via admin endpoint)
   */
  async triggerManualCleanup(): Promise<{ cleanedCount: number; stats: { storage: string; size: number; useRedis: boolean } }> {
    this.logger.log('Manual cleanup triggered');
    const cleanedCount = await this.tokenBlacklistService.cleanupExpired();
    const stats = await this.tokenBlacklistService.getStats();

    return {
      cleanedCount,
      stats,
    };
  }
}
