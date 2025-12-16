import { IsString, IsOptional, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MessengerConversationDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsArray()
  participants: string[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  caseId?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isGroup?: boolean;
}

export class MessengerMessageDto {
  @ApiProperty()
  @IsString()
  conversationId: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  attachments?: string[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  replyTo?: string;
}

export class UpdateConversationDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  participants?: string[];
}
