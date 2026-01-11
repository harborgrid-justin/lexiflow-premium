import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersModule } from "@users/users.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { LoginAttempt } from "./entities/login-attempt.entity";
import { RefreshToken } from "./entities/refresh-token.entity";
import { Session } from "./entities/session.entity";
import { TokenBlacklistGuard } from "./guards/token-blacklist.guard";
import { BruteForceProtectionService } from "./services/brute.force.protection.service";
import { PasswordPolicyService } from "./services/password.policy.service";
import { SessionManagementService } from "./services/session.management.service";
import { TokenSecurityService } from "./services/token.security.service";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { LocalStrategy } from "./strategies/local.strategy";
import { RefreshStrategy } from "./strategies/refresh.strategy";
import { TokenBlacklistAdminController } from "./token-blacklist-admin.controller";
import { TokenBlacklistCleanupService } from "./token-blacklist-cleanup.service";
import { TokenBlacklistService } from "./token-blacklist.service";
import { TokenStorageService } from "./token-storage.service";

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
        const expiresIn =
          configService.get<string>("app.jwt.expiresIn") ?? "900";
        return {
          secret:
            configService.get<string>("app.jwt.secret") ?? "default-jwt-secret",
          signOptions: {
            expiresIn: (isNaN(Number(expiresIn))
              ? expiresIn
              : parseInt(expiresIn, 10)) as string | number,
          },
        };
      },
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
    SessionManagementService,
    BruteForceProtectionService,
    PasswordPolicyService,
    TokenSecurityService,
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
  ],
})
export class AuthModule {}
