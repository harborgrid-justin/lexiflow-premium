import { IsString, IsEmail, IsOptional, IsEnum, IsPhoneNumber, IsNotEmpty, MaxLength, IsDate, IsUUID, IsNumber, IsBoolean, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
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
  @ApiPropertyOptional({ description: 'Client number', maxLength: 100 })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  clientNumber?: string;

  @ApiProperty({ description: 'Client name', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @ApiProperty({ enum: ClientType, description: 'Client type' })
  @IsEnum(ClientType)
  @IsNotEmpty()
  clientType!: ClientType;

  @ApiProperty({ enum: ClientStatus, default: ClientStatus.ACTIVE, description: 'Client status' })
  @IsEnum(ClientStatus)
  @IsOptional()
  status?: ClientStatus;

  @ApiProperty({ description: 'Primary email' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiPropertyOptional({ description: 'Phone number', maxLength: 50 })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  phone?: string;

  @ApiPropertyOptional({ description: 'Fax number', maxLength: 50 })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  fax?: string;

  @ApiPropertyOptional({ description: 'Website URL', maxLength: 500 })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  website?: string;

  @ApiPropertyOptional({ description: 'Primary address' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ description: 'City', maxLength: 100 })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ description: 'State', maxLength: 100 })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  state?: string;

  @ApiPropertyOptional({ description: 'ZIP code', maxLength: 20 })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  zipCode?: string;

  @ApiPropertyOptional({ description: 'Country', maxLength: 100 })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({ description: 'Billing address' })
  @IsString()
  @IsOptional()
  billingAddress?: string;

  @ApiPropertyOptional({ description: 'Billing city', maxLength: 100 })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  billingCity?: string;

  @ApiPropertyOptional({ description: 'Billing state', maxLength: 100 })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  billingState?: string;

  @ApiPropertyOptional({ description: 'Billing ZIP code', maxLength: 20 })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  billingZipCode?: string;

  @ApiPropertyOptional({ description: 'Billing country', maxLength: 100 })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  billingCountry?: string;

  @ApiPropertyOptional({ description: 'Tax ID', maxLength: 100 })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  taxId?: string;

  @ApiPropertyOptional({ description: 'Industry', maxLength: 255 })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  industry?: string;

  @ApiPropertyOptional({ description: 'Established date' })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  establishedDate?: Date;

  @ApiPropertyOptional({ description: 'Primary contact name', maxLength: 255 })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  primaryContactName?: string;

  @ApiPropertyOptional({ description: 'Primary contact email', maxLength: 255 })
  @IsEmail()
  @IsOptional()
  primaryContactEmail?: string;

  @ApiPropertyOptional({ description: 'Primary contact phone', maxLength: 50 })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  primaryContactPhone?: string;

  @ApiPropertyOptional({ description: 'Primary contact title', maxLength: 100 })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  primaryContactTitle?: string;

  @ApiPropertyOptional({ description: 'Account manager ID' })
  @IsUUID()
  @IsOptional()
  accountManagerId?: string;

  @ApiPropertyOptional({ description: 'Referral source', maxLength: 255 })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  referralSource?: string;

  @ApiPropertyOptional({ description: 'Client since date' })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  clientSince?: Date;

  @ApiPropertyOptional({ description: 'Payment terms' })
  @IsString()
  @IsOptional()
  paymentTerms?: string;

  @ApiPropertyOptional({ description: 'Preferred payment method', maxLength: 100 })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  preferredPaymentMethod?: string;

  @ApiPropertyOptional({ description: 'Credit limit' })
  @IsNumber()
  @IsOptional()
  creditLimit?: number;

  @ApiPropertyOptional({ description: 'Is VIP client', default: false })
  @IsBoolean()
  @IsOptional()
  isVip?: boolean;

  @ApiPropertyOptional({ description: 'Requires conflict check', default: false })
  @IsBoolean()
  @IsOptional()
  requiresConflictCheck?: boolean;

  @ApiPropertyOptional({ description: 'Has retainer on file', default: false })
  @IsBoolean()
  @IsOptional()
  hasRetainer?: boolean;

  @ApiPropertyOptional({ description: 'Retainer amount' })
  @IsNumber()
  @IsOptional()
  retainerAmount?: number;

  @ApiPropertyOptional({ description: 'Custom fields' })
  @IsOptional()
  customFields?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Tags', type: [String] })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ description: 'Notes' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  metadata?: Record<string, unknown>;
}
