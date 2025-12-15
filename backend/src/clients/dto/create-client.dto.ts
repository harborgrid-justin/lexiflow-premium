import { IsString, IsEmail, IsOptional, IsEnum, IsPhoneNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ClientType {
  CORPORATION = 'Corporation',
  INDIVIDUAL = 'Individual',
  GOVERNMENT = 'Government',
  NON_PROFIT = 'Non-Profit',
  PARTNERSHIP = 'Partnership'
}

export enum ClientStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  PROSPECT = 'Prospect',
  FORMER = 'Former'
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
