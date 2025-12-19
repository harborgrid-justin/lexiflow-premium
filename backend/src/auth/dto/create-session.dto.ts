import { IsString, IsOptional, IsDate, IsUUID, IsNotEmpty, MaxLength, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSessionDto {
  @ApiProperty({ 
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ 
    description: 'Session token',
    maxLength: 500
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  token: string;

  @ApiPropertyOptional({ 
    description: 'Refresh token',
    maxLength: 500
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  refreshToken?: string;

  @ApiPropertyOptional({ 
    description: 'Refresh token expiration'
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  refreshTokenExpiresAt?: Date;

  @ApiPropertyOptional({ 
    description: 'Device information'
  })
  @IsString()
  @IsOptional()
  deviceInfo?: string;

  @ApiPropertyOptional({ 
    description: 'Device type',
    example: 'mobile',
    maxLength: 100
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  deviceType?: string;

  @ApiPropertyOptional({ 
    description: 'User agent string',
    maxLength: 255
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  userAgent?: string;

  @ApiProperty({ 
    description: 'IP address',
    example: '192.168.1.1',
    maxLength: 100
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  ipAddress: string;

  @ApiProperty({ 
    description: 'Session expiration time'
  })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  expiresAt: Date;

  @ApiPropertyOptional({ 
    description: 'Whether session is active',
    default: true
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ 
    description: 'Last activity timestamp'
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  lastActivityAt?: Date;

  @ApiPropertyOptional({ 
    description: 'Location',
    maxLength: 100
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  location?: string;

  @ApiPropertyOptional({ 
    description: 'Country',
    maxLength: 50
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  country?: string;

  @ApiPropertyOptional({ 
    description: 'City',
    maxLength: 50
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  city?: string;

  @ApiPropertyOptional({ 
    description: 'Browser name',
    maxLength: 100
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  browser?: string;

  @ApiPropertyOptional({ 
    description: 'Operating system',
    maxLength: 100
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  os?: string;

  @ApiPropertyOptional({ 
    description: 'Whether session is from trusted device',
    default: false
  })
  @IsBoolean()
  @IsOptional()
  isTrusted?: boolean;
}
