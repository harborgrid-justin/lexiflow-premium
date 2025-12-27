import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsNotEmpty,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Response DTO for session information
 */
export class SessionResponseDto {
  @ApiProperty({
    description: 'Session ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string;

  @ApiProperty({
    description: 'Device information',
    example: 'MacBook Pro',
  })
  deviceInfo!: string;

  @ApiPropertyOptional({
    description: 'Device type',
    example: 'desktop',
  })
  deviceType!: string | null;

  @ApiPropertyOptional({
    description: 'Browser name',
    example: 'Chrome',
  })
  browser!: string | null;

  @ApiPropertyOptional({
    description: 'Operating system',
    example: 'macOS 14.0',
  })
  os!: string | null;

  @ApiProperty({
    description: 'IP address',
    example: '192.168.1.100',
  })
  ipAddress!: string;

  @ApiPropertyOptional({
    description: 'Location',
    example: 'San Francisco, CA',
  })
  location!: string | null;

  @ApiPropertyOptional({
    description: 'Country',
    example: 'United States',
  })
  country!: string | null;

  @ApiPropertyOptional({
    description: 'City',
    example: 'San Francisco',
  })
  city!: string | null;

  @ApiProperty({
    description: 'Session creation timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Last activity timestamp',
    example: '2024-01-15T14:45:00Z',
  })
  lastActivityAt!: Date | null;

  @ApiProperty({
    description: 'Session expiration timestamp',
    example: '2024-01-16T10:30:00Z',
  })
  expiresAt!: Date;

  @ApiProperty({
    description: 'Whether session is active',
    example: true,
  })
  isActive!: boolean;

  @ApiProperty({
    description: 'Whether device is trusted',
    example: false,
  })
  isTrusted!: boolean;

  @ApiProperty({
    description: 'Whether this is the current session',
    example: true,
  })
  isCurrent!: boolean;
}

/**
 * Response DTO for list of sessions
 */
export class SessionListResponseDto {
  @ApiProperty({
    description: 'List of active sessions',
    type: [SessionResponseDto],
  })
  sessions!: SessionResponseDto[];

  @ApiProperty({
    description: 'Total number of sessions',
    example: 3,
  })
  total!: number;
}

/**
 * DTO for revoking a session
 */
export class RevokeSessionDto {
  @ApiPropertyOptional({
    description: 'Reason for revoking the session',
    example: 'User logged out from this device',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  reason?: string;
}

/**
 * DTO for marking a device as trusted
 */
export class TrustDeviceDto {
  @ApiProperty({
    description: 'Session ID to mark as trusted',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  sessionId!: string;
}

/**
 * Response DTO for session revocation
 */
export class RevokeSessionResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Session revoked successfully',
  })
  message!: string;

  @ApiPropertyOptional({
    description: 'Number of sessions revoked',
    example: 1,
  })
  count?: number;
}

/**
 * Response DTO for session statistics
 */
export class SessionStatsResponseDto {
  @ApiProperty({
    description: 'Total number of sessions',
    example: 10,
  })
  totalSessions!: number;

  @ApiProperty({
    description: 'Number of active sessions',
    example: 3,
  })
  activeSessions!: number;

  @ApiProperty({
    description: 'Number of trusted devices',
    example: 2,
  })
  trustedDevices!: number;

  @ApiProperty({
    description: 'Recent login locations',
    example: ['San Francisco, CA', 'New York, NY'],
    type: [String],
  })
  recentLocations!: string[];
}

/**
 * Query DTO for filtering sessions
 */
export class GetSessionsQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by trusted status',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isTrusted?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by device type',
    example: 'mobile',
  })
  @IsString()
  @IsOptional()
  deviceType?: string;
}

/**
 * DTO for updating session activity
 */
export class UpdateSessionActivityDto {
  @ApiProperty({
    description: 'Session ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  sessionId!: string;

  @ApiPropertyOptional({
    description: 'Current IP address',
    example: '192.168.1.100',
  })
  @IsString()
  @IsOptional()
  ipAddress?: string;

  @ApiPropertyOptional({
    description: 'Current location',
    example: 'San Francisco, CA',
  })
  @IsString()
  @IsOptional()
  location?: string;
}

/**
 * Response DTO for new device detection
 */
export class NewDeviceDetectionDto {
  @ApiProperty({
    description: 'Whether this is a new device',
    example: true,
  })
  isNewDevice!: boolean;

  @ApiProperty({
    description: 'Device information',
    example: 'iPhone 15 Pro',
  })
  deviceInfo!: string;

  @ApiProperty({
    description: 'Location',
    example: 'San Francisco, CA',
  })
  location!: string;

  @ApiProperty({
    description: 'IP address',
    example: '192.168.1.100',
  })
  ipAddress!: string;
}
