import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation , ApiResponse }from '@nestjs/swagger';
import { MessengerService } from './messenger.service';
import { MessengerConversationDto, MessengerMessageDto, UpdateConversationDto } from './dto/messenger.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Messenger')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)

@Controller('messenger')
export class MessengerController {
  constructor(private readonly messengerService: MessengerService) {}

  // Health check endpoint
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async health() {
    return { status: 'ok', service: 'messenger' };
  }

  @Get('contacts')
  @ApiOperation({ summary: 'Get all contacts' })
  @ApiResponse({ status: 200, description: 'Contacts retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getContacts(@Request() req, @Query() query?: any) {
    return { contacts: [], total: 0 }; // Placeholder - implement as needed
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get all conversations' })
  @ApiResponse({ status: 200, description: 'Conversations retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getConversations(@Request() req, @Query() query?: any) {
    const userId = req.user?.id || 'system';
    return await this.messengerService.findAllConversations(userId, query || {});
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Get conversation by ID' })
  @ApiResponse({ status: 200, description: 'Conversation found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async getConversation(@Param('id') id: string) {
    return await this.messengerService.findOneConversation(id);
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Get messages in conversation' })
  @ApiResponse({ status: 200, description: 'Messages retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async getMessages(@Param('id') id: string, @Query() query: any) {
    return await this.messengerService.getMessages(id, query);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread message count' })
  @ApiResponse({ status: 200, description: 'Unread count retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getUnreadCount(@Request() req) {
    const userId = req.user?.id || 'system';
    const count = await this.messengerService.getUnreadCount(userId);
    return { count };
  }

  @Post('conversations')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create conversation' })
  @ApiResponse({ status: 201, description: 'Conversation created' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async createConversation(@Body() createDto: MessengerConversationDto) {
    return await this.messengerService.createConversation(createDto);
  }

  @Post('messages')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send message' })
  @ApiResponse({ status: 201, description: 'Message sent' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async sendMessage(@Request() req, @Body() messageDto: MessengerMessageDto) {
    const userId = req.user?.id || 'system';
    return await this.messengerService.sendMessage(messageDto, userId);
  }

  @Post('messages/:id/mark-read')
  @ApiOperation({ summary: 'Mark message as read' })
  @ApiResponse({ status: 200, description: 'Message marked as read' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async markRead(@Request() req, @Param('id') id: string) {
    const userId = req.user?.id || 'system';
    return await this.messengerService.markAsRead(id, userId);
  }

  @Put('conversations/:id')
  @ApiOperation({ summary: 'Update conversation' })
  @ApiResponse({ status: 200, description: 'Conversation updated' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async updateConversation(@Param('id') id: string, @Body() updateDto: UpdateConversationDto) {
    return await this.messengerService.updateConversation(id, updateDto);
  }

  @Delete('conversations/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete conversation' })
  @ApiResponse({ status: 204, description: 'Conversation deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async deleteConversation(@Param('id') id: string) {
    await this.messengerService.deleteConversation(id);
  }
}

