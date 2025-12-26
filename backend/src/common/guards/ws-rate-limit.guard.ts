import { Injectable, CanActivate, ExecutionContext, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Socket } from 'socket.io';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

/**
 * WebSocket Rate Limit Guard
 *
 * Prevents abuse by limiting the number of events a client can send
 * within a time window (default: 100 events per minute).
 *
 * Uses a sliding window algorithm to track event rates per client.
 */
@Injectable()
export class WsRateLimitGuard implements CanActivate, OnModuleDestroy {
  private readonly logger = new Logger(WsRateLimitGuard.name);
  private rateLimitMap = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout;

  private readonly maxEventsPerMinute: number;
  private readonly windowMs: number;

  constructor(private configService: ConfigService) {
    this.maxEventsPerMinute = this.configService.get<number>(
      'resourceLimits.websocket.rateLimit.maxEventsPerMinute',
      100,
    );
    this.windowMs = this.configService.get<number>(
      'resourceLimits.websocket.rateLimit.windowMs',
      60000,
    );

    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient<Socket>();
    const clientId = this.getClientIdentifier(client);
    const now = Date.now();

    // Get or create rate limit entry
    let entry = this.rateLimitMap.get(clientId);

    // Reset if window has expired
    if (!entry || now >= entry.resetAt) {
      entry = {
        count: 0,
        resetAt: now + this.windowMs,
      };
      this.rateLimitMap.set(clientId, entry);
    }

    // Increment count
    entry.count++;

    // Check if limit exceeded
    if (entry.count > this.maxEventsPerMinute) {
      const remainingMs = entry.resetAt - now;
      this.logger.warn(
        `Rate limit exceeded for client ${clientId}: ${entry.count}/${this.maxEventsPerMinute} events`,
      );

      client.emit('error', {
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Rate limit exceeded. Maximum ${this.maxEventsPerMinute} events per minute allowed.`,
        retryAfter: Math.ceil(remainingMs / 1000),
      });

      return false;
    }

    // Log warning when approaching limit
    if (entry.count > this.maxEventsPerMinute * 0.8) {
      this.logger.debug(
        `Client ${clientId} approaching rate limit: ${entry.count}/${this.maxEventsPerMinute}`,
      );
    }

    return true;
  }

  /**
   * Get unique identifier for client (prefer userId, fallback to socketId)
   */
  private getClientIdentifier(client: Socket): string {
    const userId = (client as any).userId || client.handshake.query.userId;
    return userId ? `user:${userId}` : `socket:${client.id}`;
  }

  /**
   * Clean up expired entries to prevent memory leaks
   */
  private cleanup(): void {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.rateLimitMap.entries()) {
      if (now >= entry.resetAt) {
        this.rateLimitMap.delete(key);
        removed++;
      }
    }

    if (removed > 0) {
      this.logger.debug(`Cleaned up ${removed} expired rate limit entries`);
    }
  }

  /**
   * Get rate limit statistics
   */
  getStats() {
    const stats = {
      totalClients: this.rateLimitMap.size,
      maxEventsPerMinute: this.maxEventsPerMinute,
      clientStats: [] as Array<{ id: string; count: number; remaining: number }>,
    };

    const now = Date.now();
    for (const [clientId, entry] of this.rateLimitMap.entries()) {
      if (now < entry.resetAt) {
        stats.clientStats.push({
          id: clientId,
          count: entry.count,
          remaining: this.maxEventsPerMinute - entry.count,
        });
      }
    }

    return stats;
  }

  /**
   * Reset rate limits for a specific client (for testing or admin purposes)
   */
  resetClient(clientId: string): void {
    this.rateLimitMap.delete(clientId);
    this.logger.log(`Rate limit reset for client: ${clientId}`);
  }

  /**
   * Clear all rate limits (for testing purposes)
   */
  resetAll(): void {
    this.rateLimitMap.clear();
    this.logger.log('All rate limits reset');
  }
}
