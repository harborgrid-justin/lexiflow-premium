import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Socket } from 'socket.io';

/**
 * WebSocket Connection Limit Guard
 *
 * Prevents resource exhaustion by limiting:
 * 1. Maximum connections per user
 * 2. Maximum global connections
 *
 * This guard should be used on WebSocket gateway connection handlers
 * to protect against DoS attacks.
 */
@Injectable()
export class WsConnectionLimitGuard implements CanActivate {
  private readonly logger = new Logger(WsConnectionLimitGuard.name);
  private globalConnectionCount = 0;
  private userConnectionCounts = new Map<string, number>();

  private readonly maxConnectionsPerUser: number;
  private readonly maxGlobalConnections: number;

  constructor(private configService: ConfigService) {
    this.maxConnectionsPerUser = this.configService.get<number>(
      'resourceLimits.websocket.maxConnectionsPerUser',
      5,
    );
    this.maxGlobalConnections = this.configService.get<number>(
      'resourceLimits.websocket.maxGlobalConnections',
      10000,
    );
  }

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient<Socket>();
    const userId = this.extractUserId(client);

    // Check global connection limit
    if (this.globalConnectionCount >= this.maxGlobalConnections) {
      this.logger.warn(
        `Global connection limit reached (${this.maxGlobalConnections}). Rejecting connection.`,
      );
      client.emit('error', {
        code: 'CONNECTION_LIMIT_EXCEEDED',
        message: 'Server connection limit reached. Please try again later.',
      });
      return false;
    }

    // Check per-user connection limit if user is identified
    if (userId) {
      const userConnections = this.userConnectionCounts.get(userId) || 0;
      if (userConnections >= this.maxConnectionsPerUser) {
        this.logger.warn(
          `User ${userId} exceeded connection limit (${this.maxConnectionsPerUser})`,
        );
        client.emit('error', {
          code: 'USER_CONNECTION_LIMIT_EXCEEDED',
          message: `Maximum ${this.maxConnectionsPerUser} concurrent connections allowed per user.`,
        });
        return false;
      }

      // Increment user connection count
      this.userConnectionCounts.set(userId, userConnections + 1);
    }

    // Increment global connection count
    this.globalConnectionCount++;

    // Setup disconnect handler to decrement counts
    client.on('disconnect', () => {
      this.handleDisconnect(userId);
    });

    this.logger.debug(
      `Connection allowed. Global: ${this.globalConnectionCount}/${this.maxGlobalConnections}, User ${userId}: ${this.userConnectionCounts.get(userId) || 0}/${this.maxConnectionsPerUser}`,
    );

    return true;
  }

  private handleDisconnect(userId: string | null): void {
    // Decrement global count
    if (this.globalConnectionCount > 0) {
      this.globalConnectionCount--;
    }

    // Decrement user count
    if (userId) {
      const count = this.userConnectionCounts.get(userId) || 0;
      if (count <= 1) {
        this.userConnectionCounts.delete(userId);
      } else {
        this.userConnectionCounts.set(userId, count - 1);
      }
    }
  }

  private extractUserId(client: Socket): string | null {
    // Extract userId from handshake (will be set by auth middleware)
    return (client as any).userId || client.handshake.query.userId as string || null;
  }

  /**
   * Get current connection statistics
   */
  getStats() {
    return {
      globalConnections: this.globalConnectionCount,
      maxGlobalConnections: this.maxGlobalConnections,
      uniqueUsers: this.userConnectionCounts.size,
      userConnectionCounts: Object.fromEntries(this.userConnectionCounts),
    };
  }
}
