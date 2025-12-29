import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
 }from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import {
  NotificationPreferencesDto,
  NotificationQueryDto,
} from './dto';

/**
 * Notifications Controller
 *
 * REST API endpoints for notification management
 * Handles user notifications, preferences, and read status
 *
 * @class NotificationsController
 */
@ApiTags('Notifications')

@Controller('notifications')
// @UseGuards(JwtAuthGuard) // Will be enabled once auth module is ready
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * GET /api/v1/notifications
   * List all notifications for the authenticated user
   */
  @Get()
  @ApiOperation({ summary: 'List all notifications for user' })
  @ApiResponse({ status: 200, description: 'Returns paginated notifications' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getNotifications(@Request() req: unknown, @Query() query: NotificationQueryDto) {
    const userId = (req as any).user?.id || 'temp-user-id';
    return this.notificationsService.findAll(userId, query);
  }

  /**
   * GET /api/v1/notifications/unread-count
   * Get count of unread notifications
   */
  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  @ApiResponse({ status: 200, description: 'Returns unread count' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getUnreadCount(@Request() req: unknown) {
    const userId = (req as any).user?.id || 'temp-user-id';
    const count = await this.notificationsService.getUnreadCount(userId);
    return { count };
  }

  /**
   * PUT /api/v1/notifications/:id/read
   * Mark a notification as read
   */
  @Put(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async markAsRead(@Param('id') id: string, @Request() req: unknown) {
    const userId = (req as any).user?.id || 'temp-user-id';
    return this.notificationsService.markAsRead(id, userId);
  }

  /**
   * PUT /api/v1/notifications/read-all
   * Mark all notifications as read
   */
  @Put('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async markAllAsRead(@Request() req: unknown) {
    const userId = (req as any).user?.id || 'temp-user-id';
    return this.notificationsService.markAllAsRead(userId);
  }

  /**
   * DELETE /api/v1/notifications/:id
   * Delete a notification
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiResponse({ status: 200, description: 'Notification deleted' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async deleteNotification(@Param('id') id: string, @Request() req: unknown) {
    const userId = (req as any).user?.id || 'temp-user-id';
    return this.notificationsService.delete(id, userId);
  }

  /**
   * GET /api/v1/notifications/preferences
   * Get user notification preferences
   */
  @Get('preferences')
  @ApiOperation({ summary: 'Get notification preferences' })
  @ApiResponse({ status: 200, description: 'Returns user preferences' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getPreferences(@Request() req: unknown) {
    const userId = (req as any).user?.id || 'temp-user-id';
    return this.notificationsService.getPreferences(userId);
  }

  /**
   * PUT /api/v1/notifications/preferences
   * Update user notification preferences
   */
  @Put('preferences')
  @ApiOperation({ summary: 'Update notification preferences' })
  @ApiResponse({ status: 200, description: 'Preferences updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async updatePreferences(
    @Body() preferencesDto: NotificationPreferencesDto,
    @Request() req: unknown,
  ) {
    const userId = (req as any).user?.id || 'temp-user-id';
    return this.notificationsService.updatePreferences(userId, preferencesDto);
  }
}

