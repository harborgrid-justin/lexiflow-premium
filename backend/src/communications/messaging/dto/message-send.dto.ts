import { IsString, IsNotEmpty, IsOptional, IsArray, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for sending a message
 */
export class MessageSendDto {
  @ApiProperty({ description: 'Conversation ID', example: 'conv-123' })
  @IsString()
  @IsNotEmpty()
  conversationId!: string;

  @ApiProperty({ description: 'Message content', maxLength: 10000 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000, { message: 'Message content cannot exceed 10000 characters' })
  content!: string;

  @ApiProperty({
    description: 'Optional attachment URLs',
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];
}
