import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { RealtimeGateway } from './realtime.gateway';
import { NotificationsGateway } from './gateways/notifications.gateway';
import { DashboardGateway } from './gateways/dashboard.gateway';
import { PresenceService } from './services/presence.service';
import { WebSocketMonitorService } from './services/websocket-monitor.service';
import { WsRateLimitGuard } from '@common/guards/ws-rate-limit.guard';
import { WsRoomLimitGuard } from '@common/guards/ws-room-limit.guard';

/**
 * Realtime Module
 *
 * Comprehensive WebSocket module for real-time features:
 *
 * Gateways:
 * - RealtimeGateway (/events) - Main event gateway for cases, documents, etc.
 * - NotificationsGateway (/notifications) - Real-time notification delivery
 * - DashboardGateway (/dashboard) - Live dashboard metrics and updates
 *
 * Services:
 * - PresenceService - User online/offline status tracking
 * - WebSocketMonitorService - Connection monitoring and health checks
 *
 * Security:
 * - JWT authentication required
 * - Rate limiting on all events
 * - Room-based access control
 * - Connection limits per user
 *
 * Uses Socket.IO for bi-directional WebSocket communication
 */
@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jwt.secret') || 'your-secret-key',
        signOptions: {
          expiresIn: configService.get('jwt.expiresIn') || '1d',
        },
      }),
    }),
  ],
  providers: [
    // Gateways
    RealtimeGateway,
    NotificationsGateway,
    DashboardGateway,

    // Services
    PresenceService,
    WebSocketMonitorService,

    // Guards
    WsRateLimitGuard,
    WsRoomLimitGuard,
  ],
  exports: [
    RealtimeGateway,
    NotificationsGateway,
    DashboardGateway,
    PresenceService,
    WebSocketMonitorService,
  ],
})
export class RealtimeModule {}
