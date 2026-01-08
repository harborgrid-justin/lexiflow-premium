import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsArray, IsBoolean, IsOptional, IsNumber } from 'class-validator';
import {
  ResponsivenessCode,
  PrivilegeCode,
  ConfidentialityLevel,
} from '../entities/review-document.entity';

export class CodingDecisionDto {
  @ApiProperty()
  @IsString()
  documentId!: string;

  @ApiProperty()
  @IsString()
  reviewerId!: string;

  @ApiProperty()
  @IsString()
  reviewerName!: string;

  @ApiProperty({ enum: ResponsivenessCode })
  @IsEnum(ResponsivenessCode)
  responsivenessCode!: ResponsivenessCode;

  @ApiProperty({ enum: PrivilegeCode })
  @IsEnum(PrivilegeCode)
  privilegeCode!: PrivilegeCode;

  @ApiProperty({ enum: ConfidentialityLevel })
  @IsEnum(ConfidentialityLevel)
  confidentialityLevel!: ConfidentialityLevel;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  issueTags?: Array<{
    issueId: string;
    issueName: string;
    relevance: string;
  }>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiProperty({ default: false })
  @IsBoolean()
  hotDocument!: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  redactionRequired!: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty()
  @IsNumber()
  reviewTimeSeconds!: number;
}
