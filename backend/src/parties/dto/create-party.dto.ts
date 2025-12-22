import { IsString, IsEnum, IsOptional, IsUUID, IsNotEmpty, MaxLength, IsEmail } from 'class-validator';
import { PartyType, PartyRole } from '../entities/party.entity';

export class CreatePartyDto {
  @IsUUID()
  @IsNotEmpty()
  caseId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @IsEnum(PartyType)
  @IsNotEmpty()
  type!: PartyType;

  @IsEnum(PartyRole)
  @IsOptional()
  role?: PartyRole;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  organization?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  state?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  zipCode?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  country?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  counsel?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  primaryContactName?: string;

  @IsEmail()
  @IsOptional()
  @MaxLength(255)
  primaryContactEmail?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  primaryContactPhone?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsOptional()
  metadata?: Record<string, unknown>;
}
