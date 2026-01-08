import { IsEmail, IsString, MinLength, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Register DTO
 * Used for new client portal user registration
 */
export class RegisterDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  clientId!: string;

  @ApiProperty({ example: 'client@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'SecurePassword123!', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;
}

/**
 * Login DTO
 * Used for client portal authentication
 */
export class LoginDto {
  @ApiProperty({ example: 'client@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'SecurePassword123!' })
  @IsString()
  password!: string;

  @ApiProperty({ example: '123456', required: false, description: 'MFA code if enabled' })
  @IsOptional()
  @IsString()
  mfaCode?: string;
}

/**
 * Verify Email DTO
 * Used for email verification
 */
export class VerifyEmailDto {
  @ApiProperty({ example: 'abc123def456' })
  @IsString()
  token!: string;
}

/**
 * Request Password Reset DTO
 */
export class RequestPasswordResetDto {
  @ApiProperty({ example: 'client@example.com' })
  @IsEmail()
  email!: string;
}

/**
 * Reset Password DTO
 */
export class ResetPasswordDto {
  @ApiProperty({ example: 'abc123def456' })
  @IsString()
  token!: string;

  @ApiProperty({ example: 'NewSecurePassword123!', minLength: 8 })
  @IsString()
  @MinLength(8)
  newPassword!: string;
}

/**
 * Change Password DTO
 */
export class ChangePasswordDto {
  @ApiProperty({ example: 'CurrentPassword123!' })
  @IsString()
  currentPassword!: string;

  @ApiProperty({ example: 'NewPassword123!', minLength: 8 })
  @IsString()
  @MinLength(8)
  newPassword!: string;
}

/**
 * Refresh Token DTO
 */
export class RefreshTokenDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @IsString()
  refreshToken!: string;
}

/**
 * Login Response DTO
 */
export class LoginResponseDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty()
  refreshToken!: string;

  @ApiProperty()
  requiresMfa!: boolean;

  @ApiProperty({ type: 'object' })
  portalUser!: any;
}

/**
 * Token Response DTO
 */
export class TokenResponseDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty()
  refreshToken!: string;
}
