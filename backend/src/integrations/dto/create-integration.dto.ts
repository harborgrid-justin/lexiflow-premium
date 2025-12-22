import { IsString, IsEnum, IsOptional, IsObject, IsBoolean, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum IntegrationType {
  PACER = 'pacer',
  WESTLAW = 'westlaw',
  LEXISNEXIS = 'lexisnexis',
  CALENDAR = 'calendar',
  EMAIL = 'email',
  STORAGE = 'storage',
  PAYMENT = 'payment',
  CRM = 'crm',
  WEBHOOK = 'webhook'
}

export enum IntegrationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  PENDING = 'pending'
}

export class CreateIntegrationDto {
  @ApiProperty({ description: 'Integration name' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Integration type', enum: IntegrationType })
  @IsEnum(IntegrationType)
  type!: IntegrationType;

  @ApiProperty({ description: 'Integration description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'API endpoint URL', required: false })
  @IsOptional()
  @IsUrl()
  endpoint?: string;

  @ApiProperty({ description: 'Configuration object' })
  @IsObject()
  config!: Record<string, unknown>;

  @ApiProperty({ description: 'Credentials object', required: false })
  @IsOptional()
  @IsObject()
  credentials?: Record<string, unknown>;

  @ApiProperty({ 
    description: 'Integration status',
    enum: IntegrationStatus,
    default: IntegrationStatus.PENDING
  })
  @IsOptional()
  @IsEnum(IntegrationStatus)
  status?: IntegrationStatus;

  @ApiProperty({ description: 'Enable integration', default: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
