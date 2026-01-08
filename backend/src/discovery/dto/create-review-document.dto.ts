import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsDateString, IsArray, IsBoolean, IsEnum } from 'class-validator';
import {
  ReviewStatus,
  ResponsivenessCode,
  PrivilegeCode,
  ConfidentialityLevel,
} from '../entities/review-document.entity';

export class CreateReviewDocumentDto {
  @ApiProperty()
  @IsString()
  projectId!: string;

  @ApiProperty()
  @IsString()
  batesNumber!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  documentId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fileName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fileType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  fileSize?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  filePath?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  custodian?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  custodianId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  documentDate?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  extractedText?: string;

  @ApiProperty({ enum: ReviewStatus, default: ReviewStatus.NOT_STARTED })
  @IsOptional()
  @IsEnum(ReviewStatus)
  reviewStatus?: ReviewStatus;

  @ApiProperty({ enum: ResponsivenessCode, default: ResponsivenessCode.NOT_REVIEWED })
  @IsOptional()
  @IsEnum(ResponsivenessCode)
  responsivenessCode?: ResponsivenessCode;

  @ApiProperty({ enum: PrivilegeCode, default: PrivilegeCode.NONE })
  @IsOptional()
  @IsEnum(PrivilegeCode)
  privilegeCode?: PrivilegeCode;

  @ApiProperty({ enum: ConfidentialityLevel, default: ConfidentialityLevel.INTERNAL })
  @IsOptional()
  @IsEnum(ConfidentialityLevel)
  confidentialityLevel?: ConfidentialityLevel;
}
