import { IsString, IsOptional, IsBoolean, IsNotEmpty, MaxLength, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLoginAttemptDto {
  @ApiProperty({ 
    description: 'Email address used in login attempt',
    example: 'user@example.com'
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ 
    description: 'IP address of the attempt',
    example: '192.168.1.1',
    maxLength: 45
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(45)
  ipAddress!: string;

  @ApiProperty({ 
    description: 'Whether login was successful'
  })
  @IsBoolean()
  @IsNotEmpty()
  success!: boolean;

  @ApiPropertyOptional({ 
    description: 'Reason for failure if unsuccessful',
    maxLength: 255
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  failureReason?: string;

  @ApiPropertyOptional({ 
    description: 'User agent string',
    maxLength: 100
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  userAgent?: string;
}
