import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RealtimeGateway } from './realtime.gateway';
import { WsRateLimitGuard } from '@common/guards/ws-rate-limit.guard';
import { WsRoomLimitGuard } from '@common/guards/ws-room-limit.guard';

/**
 * Realtime Module
 * WebSocket gateway for real-time collaboration and notifications
 * Features:
 * - Real-time document collaboration
 * - Live case updates and notifications
 * - Presence detection (who's viewing what)
 * - Rate limiting and room-based access control
 * 
 * Uses Socket.IO for bi-directional WebSocket communication
 */
@Module({
  imports: [
    ConfigModule,
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
  providers: [RealtimeGateway, WsRateLimitGuard, WsRoomLimitGuard],
  exports: [RealtimeGateway],
})
export class RealtimeModule {}
