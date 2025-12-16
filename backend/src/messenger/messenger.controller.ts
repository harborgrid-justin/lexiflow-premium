import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MessengerService } from './messenger.service';
import { MessengerConversationDto, MessengerMessageDto, UpdateConversationDto } from './dto/messenger.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Messenger')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/messenger')
export class MessengerController {
  constructor(private readonly messengerService: MessengerService) {}
  @Get('conversations')
  @ApiOperation({ summary: 'Get all conversations' })
  @ApiResponse({ status: 200, description: 'Conversations retrieved' })
  async getConversations(@Request() req, @Query() query: any) {
    return await this.messengerService.findAllConversations(req.user.id, query);
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Get conversation by ID' })
  @ApiResponse({ status: 200, description: 'Conversation found' })
  async getConversation(@Param('id') id: string) {
    return await this.messengerService.findOneConversation(id);
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Get messages in conversation' })
  @ApiResponse({ status: 200, description: 'Messages retrieved' })
  async getMessages(@Param('id') id: string, @Query() query: any) {
    return await this.messengerService.getMessages(id, query);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread message count' })
  @ApiResponse({ status: 200, description: 'Unread count retrieved' })
  async getUnreadCount(@Request() req) {
    const count = await this.messengerService.getUnreadCount(req.user.id);
    return { count };
  }

  @Post('conversations')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create conversation' })
  @ApiResponse({ status: 201, description: 'Conversation created' })
  async createConversation(@Body() createDto: MessengerConversationDto) {
    return await this.messengerService.createConversation(createDto);
  }

  @Post('messages')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send message' })
  @ApiResponse({ status: 201, description: 'Message sent' })
  async sendMessage(@Request() req, @Body() messageDto: MessengerMessageDto) {
    return await this.messengerService.sendMessage(messageDto, req.user.id);
  }

  @Post('messages/:id/mark-read')
  @ApiOperation({ summary: 'Mark message as read' })
  @ApiResponse({ status: 200, description: 'Message marked as read' })
  async markRead(@Param('id') id: string) {
    return await this.messengerService.markAsRead(id);
  }

  @Put('conversations/:id')
  @ApiOperation({ summary: 'Update conversation' })
  @ApiResponse({ status: 200, description: 'Conversation updated' })
  async updateConversation(@Param('id') id: string, @Body() updateDto: UpdateConversationDto) {
    return await this.messengerService.updateConversation(id, updateDto);
  }

  @Delete('conversations/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete conversation' })
  @ApiResponse({ status: 204, description: 'Conversation deleted' })
  async deleteConversation(@Param('id') id: string) {
    await this.messengerService.deleteConversation(id);
  }
}
