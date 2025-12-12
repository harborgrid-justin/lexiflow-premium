import { IsString, IsEnum, IsOptional, IsUUID, IsNotEmpty, MaxLength, IsDate, IsInt, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { DocketEntryType } from '../entities/docket-entry.entity';

export class CreateDocketEntryDto {
  @IsUUID()
  @IsNotEmpty()
  caseId: string;

  @IsInt()
  @IsNotEmpty()
  sequenceNumber: number;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  entryDate: Date;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  description: string;

  @IsEnum(DocketEntryType)
  @IsOptional()
  type?: DocketEntryType;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  filedBy?: string;

  @IsString()
  @IsOptional()
  text?: string;

  @IsUUID()
  @IsOptional()
  documentId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  pacerDocketNumber?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  pacerDocumentNumber?: string;

  @IsBoolean()
  @IsOptional()
  isSealed?: boolean;

  @IsBoolean()
  @IsOptional()
  isRestricted?: boolean;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsOptional()
  attachments?: Array<{
    id: string;
    name: string;
    documentNumber?: string;
  }>;

  @IsOptional()
  metadata?: Record<string, any>;
}
