import { IsEnum, IsString, IsArray, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DueDiligenceDto {
  @ApiProperty({
    description: 'Entity name',
    example: 'ABC Corporation',
  })
  @IsString()
  @IsNotEmpty()
  entityName!: string;

  @ApiProperty({
    description: 'Entity type',
    enum: ['COMPANY', 'INDIVIDUAL', 'PROPERTY', 'INVESTMENT'],
    example: 'COMPANY',
  })
  @IsEnum(['COMPANY', 'INDIVIDUAL', 'PROPERTY', 'INVESTMENT'])
  entityType!: 'COMPANY' | 'INDIVIDUAL' | 'PROPERTY' | 'INVESTMENT';

  @ApiProperty({
    description: 'Jurisdiction',
    example: 'Delaware',
  })
  @IsString()
  @IsNotEmpty()
  jurisdiction!: string;

  @ApiProperty({
    description: 'Transaction type',
    example: 'Merger and Acquisition',
  })
  @IsString()
  @IsNotEmpty()
  transactionType!: string;

  @ApiProperty({
    description: 'Documents provided',
    type: [String],
    example: ['Articles of Incorporation', 'Financial Statements 2023', 'Tax Returns'],
  })
  @IsArray()
  @IsString({ each: true })
  documentsProvided!: string[];

  @ApiProperty({
    description: 'Specific concerns',
    type: [String],
    required: false,
    example: ['Pending litigation', 'Environmental compliance'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  specificConcerns?: string[];
}
