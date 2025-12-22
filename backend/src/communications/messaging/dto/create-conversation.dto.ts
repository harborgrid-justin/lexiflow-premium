import { IsString, IsArray, IsOptional, IsEnum, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ConversationType {
  DIRECT = 'direct',
  GROUP = 'group',
  CASE_RELATED = 'case_related',
}

export class CreateConversationDto {
  @ApiProperty({
    description: 'Conversation title',
    example: 'Case Discussion - Smith v. Jones',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'Type of conversation',
    enum: ConversationType,
    example: ConversationType.CASE_RELATED,
  })
  @IsEnum(ConversationType)
  type!: ConversationType;

  @ApiProperty({
    description: 'Array of participant user IDs',
    example: ['user-123', 'user-456'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  participantIds!: string[];

  @ApiProperty({
    description: 'Related case ID (optional)',
    example: 'case-789',
    required: false,
  })
  @IsOptional()
  @IsString()
  caseId?: string;

  @ApiProperty({
    description: 'Conversation metadata (optional)',
    required: false,
  })
  @IsOptional()
  metadata?: Record<string, unknown>;
}
