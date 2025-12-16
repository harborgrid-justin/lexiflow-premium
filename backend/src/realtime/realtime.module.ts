import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RealtimeGateway } from './realtime.gateway';
import { WsRateLimitGuard } from '../common/guards/ws-rate-limit.guard';
import { WsRoomLimitGuard } from '../common/guards/ws-room-limit.guard';

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
