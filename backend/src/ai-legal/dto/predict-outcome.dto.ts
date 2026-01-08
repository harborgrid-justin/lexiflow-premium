import { IsUUID, IsString, IsArray, IsEnum, IsOptional, IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PredictOutcomeDto {
  @ApiProperty({
    description: 'Matter ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  matterId!: string;

  @ApiProperty({
    description: 'Case type',
    example: 'Contract Dispute',
  })
  @IsString()
  @IsNotEmpty()
  caseType!: string;

  @ApiProperty({
    description: 'Jurisdiction',
    example: 'Federal - 9th Circuit',
  })
  @IsString()
  @IsNotEmpty()
  jurisdiction!: string;

  @ApiProperty({
    description: 'Case facts',
    example: 'The parties entered into a written contract...',
  })
  @IsString()
  @IsNotEmpty()
  facts!: string;

  @ApiProperty({
    description: 'Legal issues',
    type: [String],
    example: ['Breach of contract', 'Damages calculation'],
  })
  @IsArray()
  @IsString({ each: true })
  legalIssues!: string[];

  @ApiProperty({
    description: 'Evidence strength',
    enum: ['WEAK', 'MODERATE', 'STRONG'],
    example: 'STRONG',
  })
  @IsEnum(['WEAK', 'MODERATE', 'STRONG'])
  evidenceStrength!: 'WEAK' | 'MODERATE' | 'STRONG';

  @ApiProperty({
    description: 'Opposing party strength',
    enum: ['WEAK', 'MODERATE', 'STRONG'],
    example: 'MODERATE',
  })
  @IsEnum(['WEAK', 'MODERATE', 'STRONG'])
  opposingPartyStrength!: 'WEAK' | 'MODERATE' | 'STRONG';

  @ApiProperty({
    description: 'Estimated case value',
    example: 500000,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  estimatedValue?: number;

  @ApiProperty({
    description: 'Judge name',
    example: 'Hon. Jane Smith',
    required: false,
  })
  @IsString()
  @IsOptional()
  judge?: string;

  @ApiProperty({
    description: 'Relevant precedents',
    type: [String],
    required: false,
    example: ['Smith v. Jones, 123 F.3d 456'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  precedents?: string[];
}
