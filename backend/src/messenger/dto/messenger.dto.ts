import { IsString, IsOptional, IsArray, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

enum ConversationType {
  DIRECT = 'direct',
  GROUP = 'group',
  CASE_DISCUSSION = 'case_discussion',
  TEAM_CHAT = 'team_chat',
  CLIENT_COMMUNICATION = 'client_communication',
}

export class MessengerConversationDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty()
  @IsArray()
  participants: string[];

  @ApiPropertyOptional({ enum: ConversationType, default: ConversationType.DIRECT })
  @IsEnum(ConversationType)
  @IsOptional()
  conversationType?: ConversationType;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  caseId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  projectId?: string;
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
