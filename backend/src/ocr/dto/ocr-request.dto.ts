import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';

export class OcrRequestDto {
  @ApiProperty({ description: 'Document ID to process' })
  @IsUUID()
  @IsNotEmpty()
  documentId!: string;

  @ApiPropertyOptional({ description: 'Languages to detect', type: [String], default: ['eng'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  languages?: string[];

  @ApiPropertyOptional({ description: 'Enable preprocessing' })
  @IsOptional()
  enablePreprocessing?: boolean;
}

export class OcrResultDto {
  documentId!: string;
  text!: string;
  confidence!: number;
  language!: string;
  pageCount!: number;
  wordCount!: number;
  processedAt!: Date;
  processingTime!: number;
}
