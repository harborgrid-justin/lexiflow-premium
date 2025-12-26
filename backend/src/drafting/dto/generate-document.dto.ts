import { IsString, IsUUID, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateDocumentDto {
  @ApiProperty()
  @IsString()
  title!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsUUID()
  templateId!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  caseId?: string;

  @ApiProperty({ type: 'object', additionalProperties: true })
  @IsObject()
  variableValues!: Record<string, unknown>;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  includedClauses?: string[];
}
