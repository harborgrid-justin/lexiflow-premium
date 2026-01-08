import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { ExecutiveDashboardService } from './executive-dashboard.service';
import { FirmAnalyticsService } from './firm-analytics.service';
import { AttorneyPerformanceService } from './attorney-performance.service';

interface AnalyticsSubscription {
  dashboardType: 'executive' | 'firm' | 'practice_group' | 'attorney' | 'client' | 'financial';
  filters: {
    organizationId?: string;
    startDate: string;
    endDate: string;
  };
}

@WebSocketGateway({
  namespace: 'analytics',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class AnalyticsWebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(AnalyticsWebSocketGateway.name);
  private activeConnections = new Map<string, Set<string>>(); // userId -> Set of socketIds
  private subscriptions = new Map<string, AnalyticsSubscription>(); // socketId -> subscription

  constructor(
    private readonly executiveDashboardService: ExecutiveDashboardService,
    private readonly firmAnalyticsService: FirmAnalyticsService,
    private readonly attorneyPerformanceService: AttorneyPerformanceService,
  ) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);

    // Extract user ID from handshake (assumes authentication middleware)
    const userId = (client.handshake.query.userId as string) || 'anonymous';

    if (!this.activeConnections.has(userId)) {
      this.activeConnections.set(userId, new Set());
    }
    this.activeConnections.get(userId)!.add(client.id);

    client.emit('connection:established', {
      socketId: client.id,
      timestamp: new Date(),
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    // Remove from active connections
    for (const [userId, socketIds] of this.activeConnections.entries()) {
      if (socketIds.has(client.id)) {
        socketIds.delete(client.id);
        if (socketIds.size === 0) {
          this.activeConnections.delete(userId);
        }
        break;
      }
    }

    // Remove subscriptions
    this.subscriptions.delete(client.id);
  }

  @SubscribeMessage('analytics:subscribe')
  async handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: AnalyticsSubscription,
  ) {
    this.logger.log(`Client ${client.id} subscribing to ${data.dashboardType} analytics`);

    // Store subscription
    this.subscriptions.set(client.id, data);

    // Join room for this dashboard type
    await client.join(`analytics:${data.dashboardType}`);

    // Send initial data
    const initialData = await this.getAnalyticsData(data);
    client.emit('analytics:data', {
      type: data.dashboardType,
      data: initialData,
      timestamp: new Date(),
    });

    return { success: true, message: 'Subscribed to analytics updates' };
  }

  @SubscribeMessage('analytics:unsubscribe')
  async handleUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { dashboardType: string },
  ) {
    this.logger.log(`Client ${client.id} unsubscribing from ${data.dashboardType} analytics`);

    await client.leave(`analytics:${data.dashboardType}`);
    this.subscriptions.delete(client.id);

    return { success: true, message: 'Unsubscribed from analytics updates' };
  }

  @SubscribeMessage('analytics:refresh')
  async handleRefresh(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { dashboardType: string },
  ) {
    this.logger.log(`Client ${client.id} requesting refresh for ${data.dashboardType}`);

    const subscription = this.subscriptions.get(client.id);
    if (!subscription) {
      return { success: false, message: 'No active subscription' };
    }

    const analyticsData = await this.getAnalyticsData(subscription);
    client.emit('analytics:data', {
      type: subscription.dashboardType,
      data: analyticsData,
      timestamp: new Date(),
    });

    return { success: true, message: 'Data refreshed' };
  }

  /**
   * Broadcast analytics update to all subscribers of a dashboard type
   */
  async broadcastUpdate(
    dashboardType: string,
    data: any,
    organizationId?: string,
  ) {
    this.logger.log(`Broadcasting ${dashboardType} analytics update`);

    this.server.to(`analytics:${dashboardType}`).emit('analytics:update', {
      type: dashboardType,
      data,
      organizationId,
      timestamp: new Date(),
    });
  }

  /**
   * Send update to specific user
   */
  async sendToUser(userId: string, event: string, data: any) {
    const socketIds = this.activeConnections.get(userId);
    if (socketIds) {
      socketIds.forEach(socketId => {
        this.server.to(socketId).emit(event, data);
      });
    }
  }

  /**
   * Get analytics data based on subscription
   */
  private async getAnalyticsData(subscription: AnalyticsSubscription): Promise<any> {
    const { dashboardType, filters } = subscription;
    const startDate = new Date(filters.startDate);
    const endDate = new Date(filters.endDate);

    switch (dashboardType) {
      case 'executive':
        return this.executiveDashboardService.getExecutiveOverview({
          organizationId: filters.organizationId,
          startDate,
          endDate,
        });

      case 'firm':
        if (!filters.organizationId) {
          throw new Error('Organization ID required for firm analytics');
        }
        return this.firmAnalyticsService.getFirmAnalytics(
          filters.organizationId,
          startDate,
          endDate,
        );

      case 'attorney':
        if (!filters.organizationId) {
          throw new Error('Organization ID required for attorney performance');
        }
        return this.attorneyPerformanceService.getAttorneyPerformance(
          filters.organizationId,
          startDate,
          endDate,
        );

      default:
        return { message: 'Dashboard type not yet implemented' };
    }
  }

  /**
   * Get connection statistics
   */
  getConnectionStats() {
    return {
      totalConnections: Array.from(this.activeConnections.values()).reduce(
        (sum, set) => sum + set.size,
        0,
      ),
      uniqueUsers: this.activeConnections.size,
      subscriptions: this.subscriptions.size,
    };
  }
}
