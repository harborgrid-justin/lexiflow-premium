import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { MessagingService } from './messaging.service';
import { CreateConversationDto, CreateMessageDto, MessageQueryDto } from './dto';

/**
 * Messaging Controller
 *
 * REST API endpoints for secure messaging system
 * Handles conversations and messages with real-time WebSocket integration
 *
 * @class MessagingController
 */
@ApiTags('Messaging')
@Public() // Allow public access for development
@Controller('messaging')
// @UseGuards(JwtAuthGuard) // Will be enabled once auth module is ready
@ApiBearerAuth()
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  /**
   * GET /api/v1/conversations
   * List all conversations for the authenticated user
   */
  @Get('conversations')
  @ApiOperation({ summary: 'List all conversations for user' })
  @ApiResponse({ status: 200, description: 'Returns paginated conversations' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getConversations(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const userId = req.user?.id || 'temp-user-id'; // Will use actual auth
    return this.messagingService.findAllConversations(userId, page, limit);
  }

  /**
   * GET /api/v1/conversations/:id
   * Get a specific conversation
   */
  @Get('conversations/:id')
  @ApiOperation({ summary: 'Get conversation by ID' })
  @ApiResponse({ status: 200, description: 'Returns conversation details' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  async getConversation(@Param('id') id: string, @Request() req) {
    const userId = req.user?.id || 'temp-user-id';
    return this.messagingService.findConversationById(id, userId);
  }

  /**
   * POST /api/v1/conversations
   * Create a new conversation
   */
  @Post('conversations')
  @ApiOperation({ summary: 'Create a new conversation' })
  @ApiResponse({ status: 201, description: 'Conversation created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async createConversation(@Body() createDto: CreateConversationDto, @Request() req) {
    const userId = req.user?.id || 'temp-user-id';
    return this.messagingService.createConversation(createDto, userId);
  }

  /**
   * DELETE /api/v1/conversations/:id
   * Delete a conversation
   */
  @Delete('conversations/:id')
  @ApiOperation({ summary: 'Delete a conversation' })
  @ApiResponse({ status: 200, description: 'Conversation deleted' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  async deleteConversation(@Param('id') id: string, @Request() req) {
    const userId = req.user?.id || 'temp-user-id';
    return this.messagingService.deleteConversation(id, userId);
  }

  /**
   * GET /api/v1/conversations/:id/messages
   * Get messages for a conversation
   */
  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Get messages for a conversation' })
  @ApiResponse({ status: 200, description: 'Returns paginated messages' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  async getMessages(
    @Param('id') conversationId: string,
    @Query() query: MessageQueryDto,
    @Request() req,
  ) {
    const userId = req.user?.id || 'temp-user-id';
    return this.messagingService.findMessages(conversationId, userId, query);
  }

  /**
   * POST /api/v1/conversations/:id/messages
   * Send a message in a conversation
   */
  @Post('conversations/:id/messages')
  @ApiOperation({ summary: 'Send a message in a conversation' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  async sendMessage(
    @Param('id') conversationId: string,
    @Body() createDto: CreateMessageDto,
    @Request() req,
  ) {
    const userId = req.user?.id || 'temp-user-id';
    return this.messagingService.createMessage(conversationId, createDto, userId);
  }

  /**
   * PUT /api/v1/messages/:id/read
   * Mark a message as read
   */
  @Put('messages/:id/read')
  @ApiOperation({ summary: 'Mark message as read' })
  @ApiResponse({ status: 200, description: 'Message marked as read' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  @ApiParam({ name: 'id', description: 'Message ID' })
  async markAsRead(@Param('id') messageId: string, @Request() req) {
    const userId = req.user?.id || 'temp-user-id';
    return this.messagingService.markMessageAsRead(messageId, userId);
  }

  /**
   * DELETE /api/v1/messages/:id
   * Delete a message
   */
  @Delete('messages/:id')
  @ApiOperation({ summary: 'Delete a message' })
  @ApiResponse({ status: 200, description: 'Message deleted' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  @ApiParam({ name: 'id', description: 'Message ID' })
  async deleteMessage(@Param('id') messageId: string, @Request() req) {
    const userId = req.user?.id || 'temp-user-id';
    return this.messagingService.deleteMessage(messageId, userId);
  }
}

