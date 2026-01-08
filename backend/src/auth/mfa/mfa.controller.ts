import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@auth/guards';
import { CurrentUser } from '@auth/decorators/current-user.decorator';
import { MfaService } from './mfa.service';
import {
  StartWebAuthnRegistrationDto,
  CompleteWebAuthnRegistrationDto,
  WebAuthnAuthenticationDto,
  SetupSmsMfaDto,
  VerifySmsMfaDto,
  SendSmsMfaCodeDto,
  GenerateBackupCodesDto,
  UseBackupCodeDto,
  MfaMethodsResponseDto,
} from './dto/mfa.dto';

/**
 * Enhanced MFA Controller
 * Manages multiple MFA methods: WebAuthn, SMS, TOTP, and Backup Codes
 */
@ApiTags('Authentication - MFA')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('auth/mfa')
export class MfaController {
  constructor(private readonly mfaService: MfaService) {}

  /**
   * Get user's available MFA methods
   */
  @Get('methods')
  @ApiOperation({ summary: 'Get available MFA methods' })
  @ApiResponse({
    status: 200,
    description: 'Returns available MFA methods',
    type: MfaMethodsResponseDto,
  })
  async getMfaMethods(
    @CurrentUser('id') userId: string,
  ): Promise<MfaMethodsResponseDto> {
    const methods = await this.mfaService.getUserMfaMethods(userId);
    return {
      methods: {
        totp: methods.totp,
        sms: methods.sms,
        webauthn: methods.webauthn,
        backupCodes: methods.backupCodes,
      },
      webauthnCredentialCount: methods.webauthnCredentialCount,
      unusedBackupCodeCount: methods.unusedBackupCodeCount,
    };
  }

  // ==================== WebAuthn Endpoints ====================

  /**
   * Start WebAuthn registration
   */
  @Post('webauthn/register/start')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Start WebAuthn security key registration' })
  @ApiResponse({
    status: 200,
    description: 'Returns registration challenge',
  })
  async startWebAuthnRegistration(
    @CurrentUser('id') userId: string,
    @Body() dto: StartWebAuthnRegistrationDto,
  ) {
    return this.mfaService.startWebAuthnRegistration(
      userId,
      dto.friendlyName,
    );
  }

  /**
   * Complete WebAuthn registration
   */
  @Post('webauthn/register/complete')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Complete WebAuthn security key registration' })
  @ApiResponse({
    status: 201,
    description: 'Security key registered successfully',
  })
  async completeWebAuthnRegistration(
    @CurrentUser('id') userId: string,
    @Body() dto: CompleteWebAuthnRegistrationDto,
  ) {
    return this.mfaService.completeWebAuthnRegistration(
      userId,
      dto.challengeId,
      dto.credential,
      dto.friendlyName,
    );
  }

  /**
   * Verify WebAuthn authentication
   */
  @Post('webauthn/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify WebAuthn authentication' })
  @ApiResponse({
    status: 200,
    description: 'Authentication verified successfully',
  })
  async verifyWebAuthnAuthentication(
    @CurrentUser('id') userId: string,
    @Body() dto: WebAuthnAuthenticationDto,
  ) {
    const result = await this.mfaService.verifyWebAuthnAuthentication(
      userId,
      dto.assertion,
    );
    return {
      verified: result,
      message: 'WebAuthn authentication successful',
    };
  }

  /**
   * Get user's WebAuthn credentials
   */
  @Get('webauthn/credentials')
  @ApiOperation({ summary: 'Get registered security keys' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of registered security keys',
  })
  async getWebAuthnCredentials(@CurrentUser('id') userId: string) {
    return this.mfaService.getUserWebAuthnCredentials(userId);
  }

  /**
   * Delete WebAuthn credential
   */
  @Delete('webauthn/credentials/:credentialId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a security key' })
  @ApiResponse({
    status: 200,
    description: 'Security key deleted successfully',
  })
  async deleteWebAuthnCredential(
    @Param('credentialId') credentialId: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.mfaService.deleteWebAuthnCredential(credentialId, userId);
    return { message: 'Security key deleted successfully' };
  }

  // ==================== SMS MFA Endpoints ====================

  /**
   * Setup SMS MFA
   */
  @Post('sms/setup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Setup SMS MFA' })
  @ApiResponse({
    status: 200,
    description: 'Verification code sent to phone number',
  })
  async setupSmsMfa(
    @CurrentUser('id') userId: string,
    @Body() dto: SetupSmsMfaDto,
  ) {
    await this.mfaService.setupSmsMfa(userId, dto.phoneNumber);
    return {
      message: 'Verification code sent to phone number',
      phoneNumber: dto.phoneNumber,
    };
  }

  /**
   * Verify SMS MFA setup
   */
  @Post('sms/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify SMS MFA code' })
  @ApiResponse({
    status: 200,
    description: 'SMS MFA verified successfully',
  })
  async verifySmsMfa(
    @CurrentUser('id') userId: string,
    @Body() dto: VerifySmsMfaDto,
  ) {
    const result = await this.mfaService.verifySmsMfa(
      userId,
      dto.phoneNumber,
      dto.code,
    );
    return {
      verified: result,
      message: 'SMS MFA verified successfully',
    };
  }

  /**
   * Send SMS MFA code
   */
  @Post('sms/send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send SMS MFA code' })
  @ApiResponse({
    status: 200,
    description: 'SMS code sent successfully',
  })
  async sendSmsMfaCode(
    @CurrentUser('id') userId: string,
    @Body() dto: SendSmsMfaCodeDto,
  ) {
    await this.mfaService.sendSmsMfaCode(userId, dto.phoneNumber);
    return {
      message: 'SMS code sent successfully',
      phoneNumber: dto.phoneNumber,
    };
  }

  // ==================== Backup Codes Endpoints ====================

  /**
   * Generate backup codes
   */
  @Post('backup-codes/generate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate MFA backup codes' })
  @ApiResponse({
    status: 200,
    description: 'Backup codes generated successfully',
  })
  async generateBackupCodes(
    @CurrentUser('id') userId: string,
    @Body() dto?: GenerateBackupCodesDto,
  ) {
    const codes = await this.mfaService.generateBackupCodes(
      userId,
      dto?.count || 10,
    );
    return {
      message: 'Backup codes generated successfully',
      codes,
      warning:
        'Save these codes securely. They can only be used once and will not be shown again.',
    };
  }

  /**
   * Verify backup code
   */
  @Post('backup-codes/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify MFA backup code' })
  @ApiResponse({
    status: 200,
    description: 'Backup code verified successfully',
  })
  async verifyBackupCode(
    @CurrentUser('id') userId: string,
    @Body() dto: UseBackupCodeDto,
  ) {
    const result = await this.mfaService.verifyBackupCode(userId, dto.code);
    return {
      verified: result,
      message: 'Backup code verified successfully',
    };
  }

  /**
   * Get backup codes count
   */
  @Get('backup-codes/count')
  @ApiOperation({ summary: 'Get remaining backup codes count' })
  @ApiResponse({
    status: 200,
    description: 'Returns count of unused backup codes',
  })
  async getBackupCodesCount(@CurrentUser('id') userId: string) {
    const count = await this.mfaService.getBackupCodesCount(userId);
    return {
      count,
      message: `You have ${count} unused backup code(s)`,
    };
  }
}
