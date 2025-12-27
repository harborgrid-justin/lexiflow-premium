import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthController } from './auth.controller';
import { TokenBlacklistAdminController } from './token-blacklist-admin.controller';
import { AuthService } from './auth.service';
import { TokenStorageService } from './token-storage.service';
import { UsersModule } from '../users/users.module';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshStrategy } from './strategies/refresh.strategy';
import { TokenBlacklistService } from './token-blacklist.service';
import { TokenBlacklistCleanupService } from './token-blacklist-cleanup.service';
import { TokenBlacklistGuard } from './guards/token-blacklist.guard';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    // Configure JWT globally with async configuration for proper dependency injection
    // @see https://docs.nestjs.com/techniques/configuration#async-configuration
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('app.jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('app.jwt.expiresIn'),
        },
      }),
    }),
    UsersModule,
    ScheduleModule.forRoot(), // Enable scheduled tasks
  ],
  controllers: [AuthController, TokenBlacklistAdminController],
  providers: [
    AuthService,
    TokenStorageService,
    LocalStrategy,
    JwtStrategy,
    RefreshStrategy,
    TokenBlacklistService,
    TokenBlacklistCleanupService,
    TokenBlacklistGuard,
  ],
  exports: [
    JwtModule,
    PassportModule,
    AuthService,
    TokenStorageService,
    TokenBlacklistService,
    TokenBlacklistGuard,
  ],
})
export class AuthModule {}
