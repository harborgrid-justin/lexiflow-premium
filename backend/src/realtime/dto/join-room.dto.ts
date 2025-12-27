import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for joining a generic room
 */
export class JoinRoomDto {
  @ApiProperty({ description: 'Room name to join', example: 'chat-123' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100, { message: 'Room name cannot exceed 100 characters' })
  room!: string;

  @ApiProperty({ description: 'Optional user ID', required: false })
  @IsOptional()
  @IsString()
  userId?: string;
}
