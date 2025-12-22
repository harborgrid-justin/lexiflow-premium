import { IsEnum, IsString, IsObject, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AIOperationType, AIOperationStatus } from '../entities/ai-operation.entity';

export class ExecuteOperationDto {
  @ApiProperty({
    description: 'Type of AI operation to execute',
    enum: AIOperationType,
    example: 'summarization',
  })
  @IsEnum(AIOperationType)
  operationType!: AIOperationType;

  @ApiProperty({
    description: 'AI model to use for the operation',
    example: 'gpt-4',
  })
  @IsString()
  model!: string;

  @ApiProperty({
    description: 'Input data for the AI operation',
    example: { text: 'Document content to summarize' },
  })
  @IsObject()
  input!: Record<string, any>;
}

export class GetOperationsQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by operation type',
    enum: AIOperationType,
  })
  @IsOptional()
  @IsEnum(AIOperationType)
  operationType?: AIOperationType;

  @ApiPropertyOptional({
    description: 'Filter by operation status',
    enum: AIOperationStatus,
  })
  @IsOptional()
  @IsEnum(AIOperationStatus)
  status?: AIOperationStatus;
}
