import { IsUUID, IsString, IsArray, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateDepositionOutlineDto {
  @ApiProperty({
    description: 'Matter ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  matterId!: string;

  @ApiProperty({
    description: 'Witness name',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  witnessName!: string;

  @ApiProperty({
    description: 'Witness role',
    example: 'Chief Financial Officer',
    required: false,
  })
  @IsString()
  @IsOptional()
  witnessRole?: string;

  @ApiProperty({
    description: 'Witness affiliation',
    example: 'ABC Corporation',
    required: false,
  })
  @IsString()
  @IsOptional()
  witnessAffiliation?: string;

  @ApiProperty({
    description: 'Case background',
    example: 'This is a breach of contract case involving...',
  })
  @IsString()
  @IsNotEmpty()
  caseBackground!: string;

  @ApiProperty({
    description: 'Key facts',
    type: [String],
    example: ['Contract signed on 1/1/2024', 'Payment was due on 2/1/2024'],
  })
  @IsArray()
  @IsString({ each: true })
  keyFacts!: string[];

  @ApiProperty({
    description: 'Deposition objectives',
    type: [String],
    example: ['Establish knowledge of contract terms', 'Determine decision-making authority'],
  })
  @IsArray()
  @IsString({ each: true })
  objectives!: string[];

  @ApiProperty({
    description: 'Available exhibits',
    type: [Object],
    required: false,
    example: [{ exhibitNumber: 'A', description: 'Original contract' }],
  })
  @IsOptional()
  availableExhibits?: { exhibitNumber: string; description: string }[];
}
