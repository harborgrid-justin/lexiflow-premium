import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty, IsString, IsOptional, IsArray, IsNumber, IsBoolean } from 'class-validator';

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

export class OcrProgressDto {
  @ApiProperty({ description: 'Job ID' })
  @IsString()
  @IsNotEmpty()
  jobId!: string;

  @ApiProperty({ description: 'Progress percentage (0-100)' })
  @IsNumber()
  progress!: number;

  @ApiProperty({ description: 'Job status' })
  @IsString()
  status!: string;
}

export class DetectLanguageDto {
  @ApiPropertyOptional({ description: 'Text content to detect language from' })
  @IsString()
  @IsOptional()
  text?: string;

  @ApiPropertyOptional({ description: 'Document buffer for language detection' })
  @IsOptional()
  buffer?: Buffer;
}

export class LanguageDetectionResultDto {
  @ApiProperty({ description: 'Detected language code' })
  language!: string;

  @ApiProperty({ description: 'Detection confidence score' })
  confidence!: number;
}

export class ExtractStructuredDataOptionsDto {
  @ApiPropertyOptional({ description: 'Enable table extraction' })
  @IsBoolean()
  @IsOptional()
  extractTables?: boolean;

  @ApiPropertyOptional({ description: 'Enable form field extraction' })
  @IsBoolean()
  @IsOptional()
  extractFormFields?: boolean;

  @ApiPropertyOptional({ description: 'Enable entity extraction' })
  @IsBoolean()
  @IsOptional()
  extractEntities?: boolean;
}

export class StructuredDataResultDto {
  @ApiProperty({ description: 'Document ID' })
  documentId!: string;

  @ApiProperty({ description: 'Extracted data' })
  data!: Record<string, unknown>;

  @ApiProperty({ description: 'Extraction status' })
  extracted!: boolean;
}

export class BatchDocumentDto {
  @ApiProperty({ description: 'Document ID' })
  @IsUUID()
  @IsNotEmpty()
  documentId!: string;

  @ApiPropertyOptional({ description: 'Document file path' })
  @IsString()
  @IsOptional()
  filePath?: string;
}

export class BatchProcessRequestDto {
  @ApiProperty({ description: 'List of documents to process', type: [BatchDocumentDto] })
  @IsArray()
  @IsNotEmpty()
  documents!: BatchDocumentDto[];

  @ApiPropertyOptional({ description: 'Languages to detect', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  languages?: string[];
}

export class BatchProcessResultDto {
  @ApiProperty({ description: 'Batch job ID' })
  batchId!: string;

  @ApiProperty({ description: 'Batch processing status' })
  status!: string;

  @ApiProperty({ description: 'Documents in batch', type: [BatchDocumentDto] })
  documents!: BatchDocumentDto[];
}

export class OcrStatsDto {
  @ApiProperty({ description: 'Total documents processed' })
  totalProcessed!: number;

  @ApiProperty({ description: 'Total pages processed' })
  totalPages!: number;

  @ApiProperty({ description: 'Average processing time in milliseconds' })
  averageProcessingTime!: number;

  @ApiProperty({ description: 'Success rate percentage' })
  successRate!: number;
}
