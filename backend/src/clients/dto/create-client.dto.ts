import { IsString, IsEmail, IsOptional, IsEnum, IsPhoneNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ClientType {
  CORPORATION = 'Corporation',
  CORPORATION_LOWER = 'corporation',
  INDIVIDUAL = 'Individual',
  INDIVIDUAL_LOWER = 'individual',
  GOVERNMENT = 'Government',
  GOVERNMENT_LOWER = 'government',
  NON_PROFIT = 'Non-Profit',
  NONPROFIT = 'nonprofit',
  PARTNERSHIP = 'Partnership',
  PARTNERSHIP_LOWER = 'partnership',
  LLC = 'llc',
  OTHER = 'other',
}

export enum ClientStatus {
  ACTIVE = 'Active',
  ACTIVE_LOWER = 'active',
  INACTIVE = 'Inactive',
  INACTIVE_LOWER = 'inactive',
  PROSPECT = 'Prospect',
  PROSPECTIVE = 'prospective',
  FORMER = 'Former',
  FORMER_LOWER = 'former',
  BLOCKED = 'blocked',
}

export class CreateClientDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ enum: ClientType })
  @IsEnum(ClientType)
  type: ClientType;

  @ApiProperty({ enum: ClientStatus, default: ClientStatus.ACTIVE })
  @IsEnum(ClientStatus)
  status: ClientStatus;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  industry?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  taxId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  primaryContact?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
