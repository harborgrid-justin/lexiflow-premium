import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for joining a conversation
 */
export class ConversationJoinDto {
  @ApiProperty({ description: 'Conversation ID to join', example: 'conv-123' })
  @IsString()
  @IsNotEmpty()
  conversationId!: string;
}
