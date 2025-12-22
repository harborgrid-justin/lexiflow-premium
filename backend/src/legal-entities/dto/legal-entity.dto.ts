import { IsString, IsEnum, IsOptional, IsArray, IsObject, IsDate } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { LegalEntityType, LegalEntityStatus } from '../entities/legal-entity.entity';

interface LegalEntityRelationship {
  id?: string;
  type?: string;
  name?: string;
  [key: string]: unknown;
}

export class CreateLegalEntityDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty({ enum: LegalEntityType })
  @IsEnum(LegalEntityType)
  entityType!: LegalEntityType;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  fullLegalName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  taxId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  registrationNumber?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  jurisdiction?: string;

  @ApiProperty({ required: false })
  @IsDate()
  @IsOptional()
  formationDate?: Date;

  @ApiProperty({ enum: LegalEntityStatus, required: false })
  @IsEnum(LegalEntityStatus)
  @IsOptional()
  status?: LegalEntityStatus;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  zipCode?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  relationships?: LegalEntityRelationship[];

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  parentEntityId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  parentEntityName?: string;

  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  subsidiaries?: LegalEntityRelationship[];

  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  affiliates?: LegalEntityRelationship[];

  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  representatives?: LegalEntityRelationship[];

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}

export class UpdateLegalEntityDto extends PartialType(CreateLegalEntityDto) {}
