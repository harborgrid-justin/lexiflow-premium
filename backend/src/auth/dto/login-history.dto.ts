import { IsString, IsBoolean, IsDate, IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Login History Response DTO
 */
export class LoginHistoryDto {
  @ApiProperty({ description: 'Login history entry ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'User ID' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'User email' })
  @IsString()
  email: string;

  @ApiProperty({ description: 'Event type (login_success, login_failed, etc.)' })
  @IsString()
  eventType: string;

  @ApiProperty({ description: 'IP address' })
  @IsString()
  ipAddress: string;

  @ApiProperty({ description: 'User agent string' })
  @IsString()
  userAgent: string;

  @ApiProperty({ description: 'Device type (desktop, mobile, tablet)' })
  @IsString()
  deviceType: string;

  @ApiProperty({ description: 'Browser name and version' })
  @IsString()
  browser: string;

  @ApiProperty({ description: 'Operating system' })
  @IsString()
  os: string;

  @ApiProperty({ description: 'Geographic location' })
  @IsString()
  location: string;

  @ApiProperty({ description: 'Country code' })
  @IsString()
  country: string;

  @ApiProperty({ description: 'City name' })
  @IsString()
  city: string;

  @ApiProperty({ description: 'Login success status' })
  @IsBoolean()
  success: boolean;

  @ApiPropertyOptional({ description: 'Failure reason if login failed' })
  @IsString()
  @IsOptional()
  failureReason?: string;

  @ApiProperty({ description: 'Event timestamp' })
  @IsDate()
  @Type(() => Date)
  timestamp: Date;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  metadata?: Record<string, any>;
}

/**
 * Query DTO for fetching login history
 */
export class GetLoginHistoryDto {
  @ApiPropertyOptional({ description: 'Number of records to return', default: 50 })
  @IsInt()
  @Min(1)
  @Max(500)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 50;

  @ApiPropertyOptional({ description: 'Number of records to skip' })
  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  offset?: number = 0;

  @ApiPropertyOptional({ description: 'Start date for filtering' })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  startDate?: Date;

  @ApiPropertyOptional({ description: 'End date for filtering' })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  endDate?: Date;

  @ApiPropertyOptional({
    description: 'Filter by event type',
    enum: ['login_success', 'login_failed', 'sso_login_success', 'sso_login_failed', 'all'],
  })
  @IsEnum(['login_success', 'login_failed', 'sso_login_success', 'sso_login_failed', 'all'])
  @IsOptional()
  eventType?: string = 'all';

  @ApiPropertyOptional({ description: 'Filter by IP address' })
  @IsString()
  @IsOptional()
  ipAddress?: string;
}

/**
 * Security Event DTO
 */
export class SecurityEventDto {
  @ApiProperty({ description: 'Event ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'User ID' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Event type' })
  @IsString()
  eventType: string;

  @ApiProperty({ description: 'Event severity' })
  @IsEnum(['low', 'medium', 'high', 'critical'])
  severity: 'low' | 'medium' | 'high' | 'critical';

  @ApiProperty({ description: 'Event description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'IP address' })
  @IsString()
  ipAddress: string;

  @ApiProperty({ description: 'Event timestamp' })
  @IsDate()
  @Type(() => Date)
  timestamp: Date;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  metadata?: Record<string, any>;
}

/**
 * Session Info DTO
 */
export class SessionInfoDto {
  @ApiProperty({ description: 'Session ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Device type' })
  @IsString()
  deviceType: string;

  @ApiProperty({ description: 'Browser' })
  @IsString()
  browser: string;

  @ApiProperty({ description: 'Operating system' })
  @IsString()
  os: string;

  @ApiProperty({ description: 'IP address' })
  @IsString()
  ipAddress: string;

  @ApiProperty({ description: 'Location' })
  @IsString()
  location: string;

  @ApiProperty({ description: 'Country' })
  @IsString()
  country: string;

  @ApiProperty({ description: 'City' })
  @IsString()
  city: string;

  @ApiProperty({ description: 'Last activity timestamp' })
  @IsDate()
  @Type(() => Date)
  lastActivityAt: Date;

  @ApiProperty({ description: 'Session created timestamp' })
  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @ApiProperty({ description: 'Session expires timestamp' })
  @IsDate()
  @Type(() => Date)
  expiresAt: Date;

  @ApiProperty({ description: 'Is this the current session' })
  @IsBoolean()
  isCurrent: boolean;

  @ApiProperty({ description: 'Is this a trusted device' })
  @IsBoolean()
  isTrusted: boolean;
}

/**
 * Revoke Session DTO
 */
export class RevokeSessionDto {
  @ApiProperty({ description: 'Session ID to revoke' })
  @IsString()
  sessionId: string;

  @ApiPropertyOptional({ description: 'Reason for revocation' })
  @IsString()
  @IsOptional()
  reason?: string;
}

/**
 * Security Anomaly DTO
 */
export class SecurityAnomalyDto {
  @ApiProperty({ description: 'Anomaly type' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Severity level' })
  @IsEnum(['low', 'medium', 'high', 'critical'])
  severity: 'low' | 'medium' | 'high' | 'critical';

  @ApiProperty({ description: 'Anomaly description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Affected user IDs' })
  @IsString({ each: true })
  affectedUsers: string[];

  @ApiProperty({ description: 'Number of occurrences' })
  @IsInt()
  occurrences: number;

  @ApiProperty({ description: 'First seen timestamp' })
  @IsDate()
  @Type(() => Date)
  firstSeen: Date;

  @ApiProperty({ description: 'Last seen timestamp' })
  @IsDate()
  @Type(() => Date)
  lastSeen: Date;

  @ApiProperty({ description: 'IP addresses involved' })
  @IsString({ each: true })
  ipAddresses: string[];
}

/**
 * Export Audit Logs DTO
 */
export class ExportAuditLogsDto {
  @ApiProperty({ description: 'Start date for export' })
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({ description: 'End date for export' })
  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @ApiPropertyOptional({
    description: 'Export format',
    enum: ['json', 'csv'],
    default: 'json',
  })
  @IsEnum(['json', 'csv'])
  @IsOptional()
  format?: 'json' | 'csv' = 'json';
}

/**
 * Password Change DTO
 */
export class ChangePasswordDto {
  @ApiProperty({ description: 'Current password' })
  @IsString()
  currentPassword: string;

  @ApiProperty({ description: 'New password' })
  @IsString()
  newPassword: string;

  @ApiProperty({ description: 'Confirm new password' })
  @IsString()
  confirmPassword: string;
}

/**
 * Trust Device DTO
 */
export class TrustDeviceDto {
  @ApiProperty({ description: 'Session ID to trust' })
  @IsString()
  sessionId: string;

  @ApiPropertyOptional({ description: 'Device name/label' })
  @IsString()
  @IsOptional()
  deviceName?: string;
}

/**
 * Device Fingerprint DTO
 */
export class DeviceFingerprintDto {
  @ApiProperty({ description: 'User agent string' })
  @IsString()
  userAgent: string;

  @ApiPropertyOptional({ description: 'Screen width' })
  @IsInt()
  @IsOptional()
  screenWidth?: number;

  @ApiPropertyOptional({ description: 'Screen height' })
  @IsInt()
  @IsOptional()
  screenHeight?: number;

  @ApiPropertyOptional({ description: 'Color depth' })
  @IsInt()
  @IsOptional()
  colorDepth?: number;

  @ApiPropertyOptional({ description: 'Timezone' })
  @IsString()
  @IsOptional()
  timezone?: string;

  @ApiPropertyOptional({ description: 'Language' })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiPropertyOptional({ description: 'Platform' })
  @IsString()
  @IsOptional()
  platform?: string;

  @ApiPropertyOptional({ description: 'Hardware concurrency' })
  @IsInt()
  @IsOptional()
  hardwareConcurrency?: number;

  @ApiPropertyOptional({ description: 'Device memory (GB)' })
  @IsInt()
  @IsOptional()
  deviceMemory?: number;

  @ApiPropertyOptional({ description: 'Canvas fingerprint' })
  @IsString()
  @IsOptional()
  canvas?: string;

  @ApiPropertyOptional({ description: 'WebGL fingerprint' })
  @IsString()
  @IsOptional()
  webgl?: string;
}

/**
 * Login Attempt Response DTO
 */
export class LoginAttemptResponseDto {
  @ApiProperty({ description: 'Whether the attempt was successful' })
  @IsBoolean()
  success: boolean;

  @ApiPropertyOptional({ description: 'Error message if failed' })
  @IsString()
  @IsOptional()
  message?: string;

  @ApiPropertyOptional({ description: 'Remaining login attempts before lockout' })
  @IsInt()
  @IsOptional()
  remainingAttempts?: number;

  @ApiPropertyOptional({ description: 'Account locked until timestamp' })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  lockedUntil?: Date;
}

/**
 * Security Settings Response DTO
 */
export class SecuritySettingsDto {
  @ApiProperty({ description: 'Two-factor authentication enabled' })
  @IsBoolean()
  mfaEnabled: boolean;

  @ApiProperty({ description: 'Number of active sessions' })
  @IsInt()
  activeSessions: number;

  @ApiProperty({ description: 'Number of trusted devices' })
  @IsInt()
  trustedDevices: number;

  @ApiPropertyOptional({ description: 'Last password change date' })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  lastPasswordChange?: Date;

  @ApiPropertyOptional({ description: 'Password expires date' })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  passwordExpiresAt?: Date;

  @ApiProperty({ description: 'Account locked status' })
  @IsBoolean()
  isLocked: boolean;

  @ApiPropertyOptional({ description: 'Account locked until timestamp' })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  lockedUntil?: Date;

  @ApiProperty({ description: 'Login history count' })
  @IsInt()
  loginHistoryCount: number;

  @ApiProperty({ description: 'Failed login attempts count' })
  @IsInt()
  failedLoginAttempts: number;
}

/**
 * IP Whitelist Entry DTO
 */
export class IpWhitelistEntryDto {
  @ApiProperty({ description: 'IP address or CIDR range' })
  @IsString()
  ipAddress: string;

  @ApiPropertyOptional({ description: 'Description/label for this IP' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Entry created timestamp' })
  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @ApiProperty({ description: 'Created by user ID' })
  @IsString()
  createdBy: string;
}

/**
 * Add IP to Whitelist DTO
 */
export class AddIpWhitelistDto {
  @ApiProperty({ description: 'IP address or CIDR range to whitelist' })
  @IsString()
  ipAddress: string;

  @ApiPropertyOptional({ description: 'Description/label for this IP' })
  @IsString()
  @IsOptional()
  description?: string;
}

/**
 * Remove IP from Whitelist DTO
 */
export class RemoveIpWhitelistDto {
  @ApiProperty({ description: 'IP address or CIDR range to remove' })
  @IsString()
  ipAddress: string;
}
