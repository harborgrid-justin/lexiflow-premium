import { IsString, IsDateString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompleteServiceDto {
  @ApiProperty({
    description: 'Date and time service was completed',
    example: '2024-12-15T14:30:00Z',
  })
  @IsDateString()
  serviceDate!: string;

  @ApiProperty({
    description: 'Person who received service',
    example: 'John Smith (in person)',
  })
  @IsString()
  servedTo!: string;

  @ApiProperty({
    description: 'Location where service was completed',
    example: '123 Main St, City, State',
  })
  @IsString()
  serviceLocation!: string;

  @ApiProperty({
    description: 'Method of service description',
    example: 'Personally served the defendant at their residence',
  })
  @IsString()
  methodDescription!: string;

  @ApiProperty({
    description: 'Process server notes',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Proof of service document IDs',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  proofDocumentIds?: string[];

  @ApiProperty({
    description: 'Recipient signature (if obtained)',
    required: false,
  })
  @IsOptional()
  @IsString()
  recipientSignature?: string;

  @ApiProperty({
    description: 'Witness name (if applicable)',
    required: false,
  })
  @IsOptional()
  @IsString()
  witnessName?: string;
}
