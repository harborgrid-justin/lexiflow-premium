import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsObject,
  IsArray,
} from 'class-validator';
import { DocumentType, DocumentStatus } from '@documents/interfaces/document.interface';

export class UpdateDocumentDto {
  @ApiPropertyOptional({ description: 'Document title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Document description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: DocumentType, description: 'Document type' })
  @IsEnum(DocumentType)
  @IsOptional()
  type?: DocumentType;

  @ApiPropertyOptional({ enum: DocumentStatus, description: 'Document status' })
  @IsEnum(DocumentStatus)
  @IsOptional()
  status?: DocumentStatus;

  @ApiPropertyOptional({ description: 'Author name' })
  @IsString()
  @IsOptional()
  author?: string;

  @ApiPropertyOptional({ description: 'Tags', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ description: 'Custom metadata fields' })
  @IsObject()
  @IsOptional()
  customFields?: Record<string, unknown>;
}
