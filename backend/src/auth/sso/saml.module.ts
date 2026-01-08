import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { SamlController } from './saml.controller';
import { SamlService } from './saml.service';
import { SamlAuthStrategy } from './saml.strategy';
import { SamlConfig } from './entities/saml-config.entity';
import { SamlSession } from './entities/saml-session.entity';
import { UsersModule } from '@users/users.module';

/**
 * SAML SSO Module
 * Provides SAML 2.0 Single Sign-On capabilities
 *
 * Features:
 * - SAML authentication flow (SP-initiated)
 * - JIT (Just-In-Time) user provisioning
 * - Session management
 * - Single Logout (SLO)
 * - Multi-tenant configuration
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([SamlConfig, SamlSession]),
    PassportModule,
    JwtModule,
    ConfigModule,
    UsersModule,
  ],
  controllers: [SamlController],
  providers: [SamlService, SamlAuthStrategy],
  exports: [SamlService],
})
export class SamlModule {}
