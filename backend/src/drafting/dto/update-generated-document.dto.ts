import { IsString, IsEnum, IsOptional, IsObject, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { GeneratedDocumentStatus } from '@drafting/entities/generated-document.entity';

export class UpdateGeneratedDocumentDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: GeneratedDocumentStatus, required: false })
  @IsOptional()
  @IsEnum(GeneratedDocumentStatus)
  status?: GeneratedDocumentStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ type: 'object', additionalProperties: true })
  @IsOptional()
  @IsObject()
  variableValues?: Record<string, unknown>;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  includedClauses?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  approvalNotes?: string;
}
