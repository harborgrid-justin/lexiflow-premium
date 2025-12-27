import { IsString, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for subscribing to case updates
 */
export class SubscribeCaseDto {
  @ApiProperty({ description: 'Case ID to subscribe to', example: 'case-uuid-123' })
  @IsString()
  @IsNotEmpty()
  @IsUUID('4', { message: 'caseId must be a valid UUID' })
  caseId!: string;
}
