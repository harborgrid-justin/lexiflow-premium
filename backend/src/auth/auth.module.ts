import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { TokenBlacklistAdminController } from './token-blacklist-admin.controller';
import { AuthService } from './auth.service';
import { TokenStorageService } from './token-storage.service';
import { UsersModule } from '@users/users.module';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshStrategy } from './strategies/refresh.strategy';
import { TokenBlacklistService } from './token-blacklist.service';
import { TokenBlacklistCleanupService } from './token-blacklist-cleanup.service';
import { TokenBlacklistGuard } from './guards/token-blacklist.guard';
import { SessionManagementService } from './services/session.management.service';
import { BruteForceProtectionService } from './services/brute.force.protection.service';
import { PasswordPolicyService } from './services/password.policy.service';
import { TokenSecurityService } from './services/token.security.service';
import { DeviceFingerprintService } from './services/device.fingerprint.service';
import { EnterpriseSessionService } from './services/enterprise.session.service';
import { Session } from './entities/session.entity';
import { LoginAttempt } from './entities/login-attempt.entity';
import { RefreshToken } from './entities/refresh-token.entity';
// Import enterprise auth modules
import { SamlModule } from './sso/saml.module';
import { MfaModule } from './mfa/mfa.module';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    TypeOrmModule.forFeature([Session, LoginAttempt, RefreshToken]),
    // Configure JWT globally with async configuration for proper dependency injection
    // @see https://docs.nestjs.com/techniques/configuration#async-configuration
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const expiresIn = configService.get<string>('app.jwt.expiresIn') ?? '900';
        return {
          secret: configService.get<string>('app.jwt.secret') ?? 'default-jwt-secret',
          signOptions: {
            expiresIn: (isNaN(Number(expiresIn)) ? expiresIn : parseInt(expiresIn, 10)) as any,
          },
        };
      },
    }),
    UsersModule,
    ScheduleModule.forRoot(), // Enable scheduled tasks
    // Enterprise authentication modules
    SamlModule,
    MfaModule,
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
    SessionManagementService,
    BruteForceProtectionService,
    PasswordPolicyService,
    TokenSecurityService,
    DeviceFingerprintService,
    EnterpriseSessionService,
  ],
  exports: [
    JwtModule,
    PassportModule,
    AuthService,
    TokenStorageService,
    TokenBlacklistService,
    TokenBlacklistGuard,
    SessionManagementService,
    BruteForceProtectionService,
    PasswordPolicyService,
    TokenSecurityService,
    DeviceFingerprintService,
    EnterpriseSessionService,
    SamlModule,
    MfaModule,
  ],
})
export class AuthModule {}
