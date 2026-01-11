import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Logger, Injectable, UseGuards } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as MasterConfig from "@config/master.config";
import { WsRateLimitGuard } from "@common/guards/ws-rate-limit.guard";

/**
 * Dashboard Analytics Data Types
 */
export interface DashboardMetrics {
  activeCases: number;
  pendingTasks: number;
  upcomingDeadlines: number;
  recentActivity: number;
  totalRevenue?: number;
  billableHours?: number;
  timestamp: string;
}

export interface ActivityFeedItem {
  id: string;
  type:
    | "case_update"
    | "document_filed"
    | "task_completed"
    | "deadline_approaching"
    | "message";
  title: string;
  description: string;
  userId?: string;
  userName?: string;
  caseId?: string;
  caseName?: string;
  timestamp: string;
  priority?: "low" | "medium" | "high" | "urgent";
}

export interface CaseStats {
  caseId: string;
  status: string;
  progress: number;
  activeTasks: number;
  upcomingDeadlines: number;
  recentUpdates: number;
  timestamp: string;
}

/**
 * Dashboard WebSocket Gateway
 *
 * Provides real-time dashboard updates with:
 * - Live metrics and KPIs
 * - Activity feed updates
 * - Case statistics
 * - Team activity tracking
 * - Performance metrics
 * - Resource utilization
 *
 * Events:
 * - dashboard:metrics - Updated dashboard metrics
 * - dashboard:activity - New activity feed item
 * - dashboard:case-stats - Case statistics update
 * - dashboard:team-activity - Team member activity
 * - dashboard:refresh - Request full dashboard refresh
 *
 * Security:
 * - JWT authentication required
 * - Role-based metric visibility
 * - Rate limiting on subscriptions
 *
 * @class DashboardGateway
 */
@Injectable()
@WebSocketGateway({
  cors: {
    origin: MasterConfig.REALTIME_CORS_ORIGIN,
    credentials: true,
  },
  namespace: "/dashboard",
  maxHttpBufferSize: MasterConfig.REALTIME_MAX_HTTP_BUFFER_SIZE,
  pingTimeout: MasterConfig.REALTIME_PING_TIMEOUT_MS,
  pingInterval: MasterConfig.REALTIME_PING_INTERVAL_MS,
  transports: ["websocket", "polling"],
})
export class DashboardGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(DashboardGateway.name);
  private userConnections = new Map<string, Set<string>>(); // userId -> Set<socketId>
  private socketToUser = new Map<string, string>(); // socketId -> userId
  private subscriptions = new Map<string, Set<string>>(); // userId -> Set<subscription types>
  private cachedMetrics = new Map<string, DashboardMetrics>(); // userId -> latest metrics

  constructor(private jwtService: JwtService) {}

  /**
   * Handle client connection with authentication
   */
  async handleConnection(client: Socket) {
    try {
      this.logger.log(`Dashboard client attempting to connect: ${client.id}`);

      // Extract and verify JWT token
      const token = this.extractToken(client);
      if (!token) {
        this.logger.warn(`Client ${client.id} connection rejected: No token`);
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync<{
        sub?: string;
        userId?: string;
      }>(token);
      const userId = payload.sub || payload.userId;

      if (!userId) {
        this.logger.warn(
          `Client ${client.id} connection rejected: Invalid token`
        );
        client.disconnect();
        return;
      }

      // Store connection mapping
      if (!this.userConnections.has(userId)) {
        this.userConnections.set(userId, new Set());
        this.subscriptions.set(userId, new Set());
      }
      const userConns = this.userConnections.get(userId);
      if (userConns) {
        userConns.add(client.id);
      }
      this.socketToUser.set(client.id, userId);

      // Join user's dashboard room
      client.join(`dashboard:${userId}`);

      this.logger.log(
        `Dashboard client connected: ${client.id} (User: ${userId}, Total connections: ${
          userConns?.size ?? 0
        })`
      );

      // Send cached metrics if available
      const cachedMetrics = this.cachedMetrics.get(userId);
      if (cachedMetrics) {
        client.emit("dashboard:metrics", cachedMetrics);
      }

      // Send connection acknowledgment
      client.emit("connected", {
        userId,
        socketId: client.id,
        namespace: "dashboard",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      this.logger.error(
        `Authentication failed for client ${client.id}: ${message}`
      );
      client.disconnect();
    }
  }

  /**
   * Handle client disconnection with cleanup
   */
  handleDisconnect(client: Socket) {
    const userId = this.socketToUser.get(client.id);

    if (userId) {
      const connections = this.userConnections.get(userId);
      if (connections) {
        connections.delete(client.id);
        if (connections.size === 0) {
          this.userConnections.delete(userId);
          this.subscriptions.delete(userId);
          this.logger.log(`User ${userId} fully disconnected from dashboard`);
        } else {
          this.logger.log(
            `Dashboard client ${client.id} disconnected (User: ${userId}, Remaining: ${connections.size})`
          );
        }
      }
      this.socketToUser.delete(client.id);
    } else {
      this.logger.log(
        `Dashboard client ${client.id} disconnected (no user mapping)`
      );
    }
  }

  /**
   * Subscribe to specific dashboard updates
   */
  @UseGuards(WsRateLimitGuard)
  @SubscribeMessage("dashboard:subscribe")
  handleSubscribe(
    @MessageBody() data: { types: string[] },
    @ConnectedSocket() client: Socket
  ) {
    const userId = this.socketToUser.get(client.id);
    if (!userId || !data.types || !Array.isArray(data.types)) {
      return { success: false, error: "Invalid request" };
    }

    // Add subscriptions
    const userSubs = this.subscriptions.get(userId);
    if (userSubs) {
      data.types.forEach((type) => userSubs.add(type));
    }

    this.logger.log(`User ${userId} subscribed to: ${data.types.join(", ")}`);
    return { success: true, subscriptions: Array.from(userSubs || []) };
  }

  /**
   * Unsubscribe from dashboard updates
   */
  @UseGuards(WsRateLimitGuard)
  @SubscribeMessage("dashboard:unsubscribe")
  handleUnsubscribe(
    @MessageBody() data: { types: string[] },
    @ConnectedSocket() client: Socket
  ) {
    const userId = this.socketToUser.get(client.id);
    if (!userId || !data.types || !Array.isArray(data.types)) {
      return { success: false, error: "Invalid request" };
    }

    // Remove subscriptions
    const userSubs = this.subscriptions.get(userId);
    if (userSubs) {
      data.types.forEach((type) => userSubs.delete(type));
    }

    this.logger.log(
      `User ${userId} unsubscribed from: ${data.types.join(", ")}`
    );
    return { success: true, subscriptions: Array.from(userSubs || []) };
  }

  /**
   * Request dashboard refresh
   */
  @UseGuards(WsRateLimitGuard)
  @SubscribeMessage("dashboard:request-refresh")
  handleRequestRefresh(@ConnectedSocket() client: Socket) {
    const userId = this.socketToUser.get(client.id);
    if (!userId) {
      return { success: false, error: "User not found" };
    }

    // Send cached metrics
    const cachedMetrics = this.cachedMetrics.get(userId);
    if (cachedMetrics) {
      client.emit("dashboard:metrics", cachedMetrics);
    }

    this.logger.log(`Dashboard refresh requested by user ${userId}`);
    return { success: true };
  }

  /**
   * Update dashboard metrics for user (called by services)
   */
  updateMetrics(userId: string, metrics: DashboardMetrics) {
    // Cache metrics
    this.cachedMetrics.set(userId, metrics);

    // Broadcast to all user's connected devices
    this.server.to(`dashboard:${userId}`).emit("dashboard:metrics", metrics);

    this.logger.debug(`Dashboard metrics updated for user ${userId}`);
  }

  /**
   * Broadcast dashboard metrics to multiple users
   */
  broadcastMetrics(userIds: string[], metrics: DashboardMetrics) {
    for (const userId of userIds) {
      this.updateMetrics(userId, metrics);
    }
  }

  /**
   * Send activity feed item to user
   */
  sendActivity(userId: string, activity: ActivityFeedItem) {
    this.server.to(`dashboard:${userId}`).emit("dashboard:activity", {
      ...activity,
      timestamp: activity.timestamp || new Date().toISOString(),
    });

    this.logger.debug(`Activity sent to user ${userId}: ${activity.type}`);
  }

  /**
   * Broadcast activity to multiple users
   */
  broadcastActivity(userIds: string[], activity: ActivityFeedItem) {
    for (const userId of userIds) {
      this.sendActivity(userId, activity);
    }
  }

  /**
   * Update case statistics for user
   */
  updateCaseStats(userId: string, caseStats: CaseStats) {
    this.server.to(`dashboard:${userId}`).emit("dashboard:case-stats", {
      ...caseStats,
      timestamp: caseStats.timestamp || new Date().toISOString(),
    });

    this.logger.debug(
      `Case stats updated for user ${userId}: Case ${caseStats.caseId}`
    );
  }

  /**
   * Broadcast case statistics to multiple users
   */
  broadcastCaseStats(userIds: string[], caseStats: CaseStats) {
    for (const userId of userIds) {
      this.updateCaseStats(userId, caseStats);
    }
  }

  /**
   * Send team activity update
   */
  sendTeamActivity(
    teamId: string,
    activity: {
      userId: string;
      userName: string;
      action: string;
      details: string;
      timestamp: string;
    }
  ) {
    this.server.to(`team:${teamId}`).emit("dashboard:team-activity", {
      ...activity,
      timestamp: activity.timestamp || new Date().toISOString(),
    });

    this.logger.debug(
      `Team activity sent to team ${teamId}: ${activity.action}`
    );
  }

  /**
   * Alert user of critical update
   */
  sendAlert(
    userId: string,
    alert: {
      type: "deadline" | "task" | "system" | "security";
      severity: "info" | "warning" | "error" | "critical";
      title: string;
      message: string;
      actionRequired?: boolean;
      actionUrl?: string;
    }
  ) {
    this.server.to(`dashboard:${userId}`).emit("dashboard:alert", {
      ...alert,
      timestamp: new Date().toISOString(),
    });

    this.logger.warn(
      `Alert sent to user ${userId}: [${alert.severity}] ${alert.title}`
    );
  }

  /**
   * Get connection statistics
   */
  getStats() {
    const totalConnections = Array.from(this.userConnections.values()).reduce(
      (sum, sockets) => sum + sockets.size,
      0
    );

    return {
      totalUsers: this.userConnections.size,
      totalConnections,
      totalSubscriptions: Array.from(this.subscriptions.values()).reduce(
        (sum, subs) => sum + subs.size,
        0
      ),
      userDetails: Array.from(this.userConnections.entries()).map(
        ([userId, sockets]) => ({
          userId,
          connectionCount: sockets.size,
          subscriptions: Array.from(this.subscriptions.get(userId) || []),
        })
      ),
    };
  }

  /**
   * Extract JWT token from socket handshake
   */
  private extractToken(client: Socket): string | null {
    // Try auth object first (recommended)
    if (client.handshake.auth.token) {
      return client.handshake.auth.token as string;
    }

    // Try Authorization header
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.substring(7);
    }

    // Try query parameter (fallback)
    if (client.handshake.query.token) {
      return client.handshake.query.token as string;
    }

    return null;
  }
}
