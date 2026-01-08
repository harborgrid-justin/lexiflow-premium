import {
  Injectable,
  Logger,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '@users/users.service';
import { WebAuthnCredential } from './entities/webauthn-credential.entity';
import { MfaBackupCode } from './entities/mfa-backup-code.entity';
import { MfaSmsVerification } from './entities/mfa-sms-verification.entity';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

/**
 * Enhanced MFA Service
 * Provides multiple MFA methods: TOTP, WebAuthn, SMS, and Backup Codes
 */
@Injectable()
export class MfaService {
  private readonly logger = new Logger(MfaService.name);

  constructor(
    @InjectRepository(WebAuthnCredential)
    private webAuthnCredentialRepository: Repository<WebAuthnCredential>,
    @InjectRepository(MfaBackupCode)
    private backupCodeRepository: Repository<MfaBackupCode>,
    @InjectRepository(MfaSmsVerification)
    private smsVerificationRepository: Repository<MfaSmsVerification>,
    private usersService: UsersService,
    private configService: ConfigService,
  ) {}

  // ==================== WebAuthn Methods ====================

  /**
   * Start WebAuthn registration
   * Generates a challenge for registering a new security key
   */
  async startWebAuthnRegistration(
    userId: string,
    friendlyName: string,
  ): Promise<{
    challenge: string;
    challengeId: string;
    rpId: string;
    rpName: string;
    userId: string;
    userName: string;
    timeout: number;
  }> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate random challenge
    const challenge = crypto.randomBytes(32).toString('base64url');
    const challengeId = crypto.randomBytes(16).toString('hex');

    // Store challenge temporarily (in production, use Redis with TTL)
    // For now, we'll return it and verify it in the completion step

    const rpId = this.configService.get('WEBAUTHN_RP_ID') || 'localhost';
    const rpName = this.configService.get('WEBAUTHN_RP_NAME') || 'LexiFlow Premium';

    this.logger.log(`Started WebAuthn registration for user: ${userId}`);

    return {
      challenge,
      challengeId,
      rpId,
      rpName,
      userId: user.id,
      userName: user.email,
      timeout: 60000, // 60 seconds
    };
  }

  /**
   * Complete WebAuthn registration
   * Stores the registered credential
   */
  async completeWebAuthnRegistration(
    userId: string,
    challengeId: string,
    credential: any,
    friendlyName: string,
  ): Promise<WebAuthnCredential> {
    // In production, verify the credential using @simplewebauthn/server
    // For now, we'll create a simplified version

    const existingCredential = await this.webAuthnCredentialRepository.findOne({
      where: { credentialId: credential.id },
    });

    if (existingCredential) {
      throw new BadRequestException('Credential already registered');
    }

    const webAuthnCredential = this.webAuthnCredentialRepository.create({
      userId,
      credentialId: credential.id,
      publicKey: credential.publicKey || '',
      counter: 0,
      deviceType: credential.deviceType || 'cross-platform',
      transports: credential.transports || [],
      aaguid: credential.aaguid || '',
      friendlyName,
      isActive: true,
      backupEligible: false,
      backupState: false,
    });

    await this.webAuthnCredentialRepository.save(webAuthnCredential);

    this.logger.log(`Registered WebAuthn credential for user: ${userId}`);

    return webAuthnCredential;
  }

  /**
   * Verify WebAuthn authentication
   */
  async verifyWebAuthnAuthentication(
    userId: string,
    assertion: any,
  ): Promise<boolean> {
    const credential = await this.webAuthnCredentialRepository.findOne({
      where: {
        userId,
        credentialId: assertion.credentialId,
        isActive: true,
      },
    });

    if (!credential) {
      throw new UnauthorizedException('Invalid credential');
    }

    // In production, verify the assertion using @simplewebauthn/server
    // This includes signature verification, counter check, etc.

    // Update last used timestamp and counter
    credential.lastUsedAt = new Date();
    credential.counter += 1;
    await this.webAuthnCredentialRepository.save(credential);

    this.logger.log(`WebAuthn authentication successful for user: ${userId}`);

    return true;
  }

  /**
   * Get user's WebAuthn credentials
   */
  async getUserWebAuthnCredentials(
    userId: string,
  ): Promise<WebAuthnCredential[]> {
    return this.webAuthnCredentialRepository.find({
      where: { userId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Delete WebAuthn credential
   */
  async deleteWebAuthnCredential(
    credentialId: string,
    userId: string,
  ): Promise<void> {
    const credential = await this.webAuthnCredentialRepository.findOne({
      where: { id: credentialId, userId },
    });

    if (!credential) {
      throw new NotFoundException('Credential not found');
    }

    await this.webAuthnCredentialRepository.remove(credential);
    this.logger.log(`Deleted WebAuthn credential: ${credentialId}`);
  }

  // ==================== SMS MFA Methods ====================

  /**
   * Setup SMS MFA
   * Sends verification code to phone number
   */
  async setupSmsMfa(userId: string, phoneNumber: string): Promise<void> {
    // Generate 6-digit code
    const code = crypto.randomInt(100000, 999999).toString();
    const codeHash = await bcrypt.hash(code, 10);

    // Store verification record
    const verification = this.smsVerificationRepository.create({
      userId,
      phoneNumber,
      codeHash,
      attempts: 0,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      sentAt: new Date(),
      isActive: true,
      phoneNumberVerified: false,
    });

    await this.smsVerificationRepository.save(verification);

    // In production, send SMS using Twilio, AWS SNS, etc.
    this.logger.log(`SMS MFA code sent to ${phoneNumber}: ${code}`);
    console.log(`[DEV] SMS Code for ${phoneNumber}: ${code}`);
  }

  /**
   * Verify SMS MFA code
   */
  async verifySmsMfa(
    userId: string,
    phoneNumber: string,
    code: string,
  ): Promise<boolean> {
    const verification = await this.smsVerificationRepository.findOne({
      where: {
        userId,
        phoneNumber,
        isActive: true,
      },
      order: { createdAt: 'DESC' },
    });

    if (!verification) {
      throw new NotFoundException('Verification request not found');
    }

    if (verification.expiresAt < new Date()) {
      throw new BadRequestException('Verification code expired');
    }

    if (verification.attempts >= 3) {
      throw new BadRequestException('Too many attempts');
    }

    // Verify code
    const isValid = await bcrypt.compare(code, verification.codeHash);

    if (!isValid) {
      verification.attempts += 1;
      await this.smsVerificationRepository.save(verification);
      throw new UnauthorizedException('Invalid verification code');
    }

    // Mark as verified
    verification.phoneNumberVerified = true;
    verification.verifiedAt = new Date();
    verification.isActive = false;
    await this.smsVerificationRepository.save(verification);

    this.logger.log(`SMS MFA verified for user: ${userId}`);

    return true;
  }

  /**
   * Send SMS MFA code for authentication
   */
  async sendSmsMfaCode(userId: string, phoneNumber: string): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if phone number is registered and verified
    const existingVerification = await this.smsVerificationRepository.findOne({
      where: {
        userId,
        phoneNumber,
        phoneNumberVerified: true,
      },
    });

    if (!existingVerification) {
      throw new BadRequestException('Phone number not registered');
    }

    // Generate new code
    await this.setupSmsMfa(userId, phoneNumber);
  }

  // ==================== Backup Codes Methods ====================

  /**
   * Generate backup codes
   */
  async generateBackupCodes(
    userId: string,
    count: number = 10,
  ): Promise<string[]> {
    // Deactivate existing codes
    await this.backupCodeRepository.update(
      { userId, isUsed: false },
      { isUsed: true, usedAt: new Date() },
    );

    const codes: string[] = [];
    const entities: MfaBackupCode[] = [];

    for (let i = 0; i < count; i++) {
      // Generate code in format: XXXX-XXXX-XXXX-XXXX
      const segments = Array.from({ length: 4 }, () =>
        crypto.randomBytes(2).toString('hex').toUpperCase(),
      );
      const code = segments.join('-');
      codes.push(code);

      const codeHash = await bcrypt.hash(code, 10);

      entities.push(
        this.backupCodeRepository.create({
          userId,
          codeHash,
          isUsed: false,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        }),
      );
    }

    await this.backupCodeRepository.save(entities);

    this.logger.log(`Generated ${count} backup codes for user: ${userId}`);

    return codes;
  }

  /**
   * Verify backup code
   */
  async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    const backupCodes = await this.backupCodeRepository.find({
      where: {
        userId,
        isUsed: false,
      },
    });

    for (const backupCode of backupCodes) {
      const isValid = await bcrypt.compare(code, backupCode.codeHash);

      if (isValid) {
        // Mark as used
        backupCode.isUsed = true;
        backupCode.usedAt = new Date();
        await this.backupCodeRepository.save(backupCode);

        this.logger.log(`Backup code used for user: ${userId}`);
        return true;
      }
    }

    throw new UnauthorizedException('Invalid backup code');
  }

  /**
   * Get backup codes count
   */
  async getBackupCodesCount(userId: string): Promise<number> {
    return this.backupCodeRepository.count({
      where: { userId, isUsed: false },
    });
  }

  // ==================== General MFA Methods ====================

  /**
   * Get user's MFA methods
   */
  async getUserMfaMethods(userId: string): Promise<{
    totp: boolean;
    sms: boolean;
    webauthn: boolean;
    backupCodes: boolean;
    webauthnCredentialCount: number;
    unusedBackupCodeCount: number;
  }> {
    const user = await this.usersService.findById(userId);
    const webauthnCredentials = await this.getUserWebAuthnCredentials(userId);
    const backupCodesCount = await this.getBackupCodesCount(userId);
    const smsVerifications = await this.smsVerificationRepository.find({
      where: { userId, phoneNumberVerified: true },
    });

    return {
      totp: user?.twoFactorEnabled || false,
      sms: smsVerifications.length > 0,
      webauthn: webauthnCredentials.length > 0,
      backupCodes: backupCodesCount > 0,
      webauthnCredentialCount: webauthnCredentials.length,
      unusedBackupCodeCount: backupCodesCount,
    };
  }

  /**
   * Verify any MFA method
   */
  async verifyAnyMfaMethod(
    userId: string,
    method: 'totp' | 'sms' | 'webauthn' | 'backup',
    value: string,
  ): Promise<boolean> {
    switch (method) {
      case 'backup':
        return this.verifyBackupCode(userId, value);

      case 'sms':
        // Extract phone number and code from value
        // Format: "phoneNumber:code"
        const [phoneNumber, code] = value.split(':');
        return this.verifySmsMfa(userId, phoneNumber, code);

      case 'webauthn':
        // Value should be WebAuthn assertion
        return this.verifyWebAuthnAuthentication(userId, JSON.parse(value));

      default:
        throw new BadRequestException('Unsupported MFA method');
    }
  }
}
