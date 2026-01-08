import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AnalyzeContractDto {
  @ApiProperty({
    description: 'Document ID to analyze',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  documentId!: string;
}
