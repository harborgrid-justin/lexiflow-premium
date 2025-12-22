import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsUUID,
  IsObject,
  IsArray,
} from 'class-validator';
import { DocumentType, DocumentStatus } from '../interfaces/document.interface';

export class CreateDocumentDto {
  @ApiProperty({ description: 'Document title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Document description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: DocumentType, description: 'Document type' })
  @IsEnum(DocumentType)
  @IsNotEmpty()
  type: DocumentType;

  @ApiProperty({ description: 'Case ID' })
  @IsUUID()
  @IsNotEmpty()
  caseId: string;

  @ApiProperty({ description: 'Creator user ID' })
  @IsUUID()
  @IsNotEmpty()
  creatorId: string;

  @ApiPropertyOptional({ enum: DocumentStatus, description: 'Document status', default: DocumentStatus.DRAFT })
  @IsEnum(DocumentStatus)
  @IsOptional()
  status?: DocumentStatus;

  @ApiPropertyOptional({ description: 'Filename' })
  @IsString()
  @IsOptional()
  filename?: string;

  @ApiPropertyOptional({ description: 'File path or storage location' })
  @IsString()
  @IsOptional()
  filePath?: string;

  @ApiPropertyOptional({ description: 'MIME type', example: 'application/pdf' })
  @IsString()
  @IsOptional()
  mimeType?: string;

  @ApiPropertyOptional({ description: 'File size in bytes' })
  @IsOptional()
  fileSize?: number;

  @ApiPropertyOptional({ description: 'File checksum' })
  @IsString()
  @IsOptional()
  checksum?: string;

  @ApiPropertyOptional({ description: 'Current version number', default: 1 })
  @IsOptional()
  currentVersion?: number;

  @ApiPropertyOptional({ description: 'Author name' })
  @IsString()
  @IsOptional()
  author?: string;

  @ApiPropertyOptional({ description: 'Page count' })
  @IsOptional()
  pageCount?: number;

  @ApiPropertyOptional({ description: 'Word count' })
  @IsOptional()
  wordCount?: number;

  @ApiPropertyOptional({ description: 'Language code', example: 'en' })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiPropertyOptional({ description: 'Tags', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ description: 'Custom metadata fields' })
  @IsObject()
  @IsOptional()
  customFields?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Full text content extracted from document' })
  @IsString()
  @IsOptional()
  fullTextContent?: string;

  @ApiPropertyOptional({ description: 'Whether OCR processing has been completed', default: false })
  @IsOptional()
  ocrProcessed?: boolean;

  @ApiPropertyOptional({ description: 'User ID who created the document' })
  @IsUUID()
  @IsOptional()
  createdBy?: string;
}
