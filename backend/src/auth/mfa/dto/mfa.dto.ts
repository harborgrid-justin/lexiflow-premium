import { IsString, IsOptional, IsBoolean, IsArray, IsPhoneNumber, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// WebAuthn DTOs
export class StartWebAuthnRegistrationDto {
  @ApiProperty({ description: 'Friendly name for the security key', example: 'YubiKey 5C' })
  @IsString()
  @Length(1, 100)
  friendlyName!: string;

  @ApiProperty({ description: 'Device type', example: 'cross-platform', required: false })
  @IsOptional()
  @IsString()
  deviceType?: 'platform' | 'cross-platform';
}

export class CompleteWebAuthnRegistrationDto {
  @ApiProperty({ description: 'Challenge ID from registration start' })
  @IsString()
  challengeId!: string;

  @ApiProperty({ description: 'WebAuthn credential response' })
  credential!: any; // PublicKeyCredential type

  @ApiProperty({ description: 'Friendly name for the security key' })
  @IsString()
  friendlyName!: string;
}

export class WebAuthnAuthenticationDto {
  @ApiProperty({ description: 'WebAuthn assertion response' })
  assertion!: any; // PublicKeyCredential type

  @ApiProperty({ description: 'User handle/ID' })
  @IsString()
  userHandle!: string;
}

// SMS MFA DTOs
export class SetupSmsMfaDto {
  @ApiProperty({ description: 'Phone number in E.164 format', example: '+14155552671' })
  @IsPhoneNumber()
  phoneNumber!: string;
}

export class VerifySmsMfaDto {
  @ApiProperty({ description: 'Verification code sent via SMS', example: '123456' })
  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/, { message: 'Code must be 6 digits' })
  code!: string;

  @ApiProperty({ description: 'Phone number', example: '+14155552671' })
  @IsPhoneNumber()
  phoneNumber!: string;
}

export class SendSmsMfaCodeDto {
  @ApiProperty({ description: 'Phone number', example: '+14155552671' })
  @IsPhoneNumber()
  phoneNumber!: string;
}

// Backup Codes DTOs
export class GenerateBackupCodesDto {
  @ApiProperty({ description: 'Number of backup codes to generate', example: 10, required: false })
  @IsOptional()
  count?: number;
}

export class UseBackupCodeDto {
  @ApiProperty({ description: 'Backup code', example: 'ABCD-1234-EFGH-5678' })
  @IsString()
  @Length(19, 19)
  code!: string;
}

// MFA Settings DTOs
export class UpdateMfaSettingsDto {
  @ApiProperty({ description: 'Enable TOTP MFA', required: false })
  @IsOptional()
  @IsBoolean()
  totpEnabled?: boolean;

  @ApiProperty({ description: 'Enable SMS MFA', required: false })
  @IsOptional()
  @IsBoolean()
  smsEnabled?: boolean;

  @ApiProperty({ description: 'Enable WebAuthn MFA', required: false })
  @IsOptional()
  @IsBoolean()
  webAuthnEnabled?: boolean;

  @ApiProperty({ description: 'Preferred MFA method', required: false })
  @IsOptional()
  @IsString()
  preferredMethod?: 'totp' | 'sms' | 'webauthn';
}

export class MfaMethodsResponseDto {
  @ApiProperty({ description: 'Available MFA methods' })
  methods!: {
    totp: boolean;
    sms: boolean;
    webauthn: boolean;
    backupCodes: boolean;
  };

  @ApiProperty({ description: 'Preferred MFA method' })
  preferredMethod?: string;

  @ApiProperty({ description: 'Number of registered WebAuthn credentials' })
  webauthnCredentialCount?: number;

  @ApiProperty({ description: 'Number of unused backup codes' })
  unusedBackupCodeCount?: number;

  @ApiProperty({ description: 'SMS phone number (masked)' })
  smsPhoneNumber?: string;
}

// Challenge DTOs
export class CreateWebAuthnChallengeDto {
  @ApiProperty({ description: 'Challenge for WebAuthn' })
  challenge!: string;

  @ApiProperty({ description: 'Timeout in milliseconds' })
  timeout!: number;

  @ApiProperty({ description: 'Relying Party ID' })
  rpId!: string;

  @ApiProperty({ description: 'Allowed credentials', required: false })
  @IsOptional()
  allowCredentials?: Array<{
    id: string;
    type: string;
    transports?: string[];
  }>;
}
