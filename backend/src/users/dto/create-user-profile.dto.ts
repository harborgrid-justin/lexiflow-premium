import { IsString, IsOptional, IsEmail, MaxLength, IsEnum, IsPhoneNumber, IsUrl, IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum UserPreferenceTheme {
  LIGHT = 'light',
  DARK = 'dark',
  AUTO = 'auto',
}

export enum UserPreferenceLanguage {
  EN = 'en',
  ES = 'es',
  FR = 'fr',
  DE = 'de',
}

export class CreateUserProfileDto {
  @ApiProperty({ 
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiPropertyOptional({ 
    description: 'Job title',
    example: 'Senior Attorney',
    maxLength: 255
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({ 
    description: 'Department',
    example: 'Litigation',
    maxLength: 255
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  department?: string;

  @ApiPropertyOptional({ 
    description: 'Bar number or license',
    maxLength: 100
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  barNumber?: string;

  @ApiPropertyOptional({ 
    description: 'State bar admission',
    maxLength: 100
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  barState?: string;

  @ApiPropertyOptional({ 
    description: 'Phone number'
  })
  @IsPhoneNumber()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ 
    description: 'Mobile phone number'
  })
  @IsPhoneNumber()
  @IsOptional()
  mobile?: string;

  @ApiPropertyOptional({ 
    description: 'Office location',
    maxLength: 255
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  officeLocation?: string;

  @ApiPropertyOptional({ 
    description: 'Profile picture URL'
  })
  @IsUrl()
  @IsOptional()
  avatarUrl?: string;

  @ApiPropertyOptional({ 
    description: 'Biography or description'
  })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({ 
    description: 'Timezone',
    example: 'America/New_York',
    maxLength: 100
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  timezone?: string;

  @ApiPropertyOptional({ 
    description: 'Preferred theme',
    enum: UserPreferenceTheme,
    default: UserPreferenceTheme.LIGHT
  })
  @IsEnum(UserPreferenceTheme)
  @IsOptional()
  preferredTheme?: UserPreferenceTheme;

  @ApiPropertyOptional({ 
    description: 'Preferred language',
    enum: UserPreferenceLanguage,
    default: UserPreferenceLanguage.EN
  })
  @IsEnum(UserPreferenceLanguage)
  @IsOptional()
  preferredLanguage?: UserPreferenceLanguage;

  @ApiPropertyOptional({ 
    description: 'Email notification preference',
    default: true
  })
  @IsBoolean()
  @IsOptional()
  emailNotifications?: boolean;

  @ApiPropertyOptional({ 
    description: 'SMS notification preference',
    default: false
  })
  @IsBoolean()
  @IsOptional()
  smsNotifications?: boolean;

  @ApiPropertyOptional({ 
    description: 'LinkedIn profile URL'
  })
  @IsUrl()
  @IsOptional()
  linkedInUrl?: string;

  @ApiPropertyOptional({ 
    description: 'Twitter handle',
    maxLength: 100
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  twitterHandle?: string;

  @ApiPropertyOptional({ 
    description: 'Additional settings'
  })
  @IsOptional()
  settings?: Record<string, unknown>;
}
