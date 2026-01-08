import { IsUUID, IsEnum, IsString, IsArray, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BriefType } from '../entities/legal-brief.entity';

export class GenerateBriefDto {
  @ApiProperty({
    description: 'Matter ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  matterId!: string;

  @ApiProperty({
    description: 'Type of brief to generate',
    enum: BriefType,
    example: BriefType.MOTION,
  })
  @IsEnum(BriefType)
  @IsNotEmpty()
  briefType!: BriefType;

  @ApiProperty({
    description: 'Brief title',
    example: 'Motion to Dismiss for Lack of Jurisdiction',
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    description: 'Statement of facts',
    example: 'On January 1, 2024, the parties entered into...',
  })
  @IsString()
  @IsNotEmpty()
  facts!: string;

  @ApiProperty({
    description: 'Legal issues to address',
    type: [String],
    example: ['Whether the court has subject matter jurisdiction', 'Whether venue is proper'],
  })
  @IsArray()
  @IsString({ each: true })
  legalIssues!: string[];

  @ApiProperty({
    description: 'Jurisdiction',
    example: 'Federal - 9th Circuit',
  })
  @IsString()
  @IsNotEmpty()
  jurisdiction!: string;

  @ApiProperty({
    description: 'Court',
    example: 'United States District Court, Northern District of California',
    required: false,
  })
  @IsString()
  @IsOptional()
  court?: string;

  @ApiProperty({
    description: 'Relevant precedents',
    type: [String],
    required: false,
    example: ['Smith v. Jones, 123 F.3d 456 (9th Cir. 2020)'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  precedents?: string[];
}
