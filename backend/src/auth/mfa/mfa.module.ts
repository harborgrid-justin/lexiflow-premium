import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { MfaController } from './mfa.controller';
import { MfaService } from './mfa.service';
import { WebAuthnCredential } from './entities/webauthn-credential.entity';
import { MfaBackupCode } from './entities/mfa-backup-code.entity';
import { MfaSmsVerification } from './entities/mfa-sms-verification.entity';
import { UsersModule } from '@users/users.module';

/**
 * Enhanced MFA Module
 * Provides multiple MFA authentication methods
 *
 * Features:
 * - WebAuthn/FIDO2 (Hardware security keys, biometrics)
 * - SMS verification
 * - TOTP (Time-based One-Time Password)
 * - Backup codes for account recovery
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      WebAuthnCredential,
      MfaBackupCode,
      MfaSmsVerification,
    ]),
    ConfigModule,
    UsersModule,
  ],
  controllers: [MfaController],
  providers: [MfaService],
  exports: [MfaService],
})
export class MfaModule {}
