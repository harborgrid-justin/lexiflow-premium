import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for marking a message as read
 */
export class MessageReadDto {
  @ApiProperty({ description: 'Message ID', example: 'msg-123' })
  @IsString()
  @IsNotEmpty()
  messageId!: string;

  @ApiProperty({ description: 'Conversation ID', example: 'conv-123' })
  @IsString()
  @IsNotEmpty()
  conversationId!: string;
}
