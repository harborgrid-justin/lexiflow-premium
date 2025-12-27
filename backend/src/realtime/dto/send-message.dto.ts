import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for sending a message to a room
 */
export class SendMessageDto {
  @ApiProperty({ description: 'Room name', example: 'chat-123' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  room!: string;

  @ApiProperty({ description: 'Message content (any JSON-serializable data)' })
  @IsNotEmpty()
  message!: unknown;
}
