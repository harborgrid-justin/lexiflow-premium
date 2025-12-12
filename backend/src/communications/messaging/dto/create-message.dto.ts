import { IsString, IsOptional, IsArray, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum MessageType {
  TEXT = 'text',
  ATTACHMENT = 'attachment',
  SYSTEM = 'system',
}

export class CreateMessageDto {
  @ApiProperty({
    description: 'Message content',
    example: 'I have reviewed the discovery documents and have some concerns.',
  })
  @IsString()
  content: string;

  @ApiProperty({
    description: 'Message type',
    enum: MessageType,
    default: MessageType.TEXT,
  })
  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType;

  @ApiProperty({
    description: 'Array of attachment IDs',
    example: ['attach-123', 'attach-456'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachmentIds?: string[];

  @ApiProperty({
    description: 'Message metadata (optional)',
    required: false,
  })
  @IsOptional()
  metadata?: Record<string, any>;
}
