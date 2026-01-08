import { IsUUID, IsEnum, IsArray, IsString, IsBoolean, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SummarizeDocumentDto {
  @ApiProperty({
    description: 'Document ID to summarize',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  documentId!: string;

  @ApiProperty({
    description: 'Summary length',
    enum: ['SHORT', 'MEDIUM', 'LONG'],
    example: 'MEDIUM',
    required: false,
  })
  @IsEnum(['SHORT', 'MEDIUM', 'LONG'])
  @IsOptional()
  summaryLength?: 'SHORT' | 'MEDIUM' | 'LONG';

  @ApiProperty({
    description: 'Focus areas',
    type: [String],
    required: false,
    example: ['Liability', 'Damages'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  focusAreas?: string[];

  @ApiProperty({
    description: 'Include key points',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  includeKeyPoints?: boolean;

  @ApiProperty({
    description: 'Include important quotes',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  includeQuotes?: boolean;
}

export class ExecutiveSummaryDto {
  @ApiProperty({
    description: 'Document IDs to analyze',
    type: [String],
    example: ['123e4567-e89b-12d3-a456-426614174000'],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  documentIds!: string[];

  @ApiProperty({
    description: 'Case title',
    example: 'Smith v. Jones Contract Dispute',
  })
  @IsString()
  @IsNotEmpty()
  caseTitle!: string;
}
