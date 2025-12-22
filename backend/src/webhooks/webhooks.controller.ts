import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { WebhooksService } from './webhooks.service';
import { CreateWebhookDto, UpdateWebhookDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('Webhooks')

@Controller('webhooks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post()
  @ApiOperation({ summary: 'Register a new webhook' })
  @ApiResponse({ status: 201, description: 'Webhook created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async create(
    @Body() createWebhookDto: CreateWebhookDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const userId = user.sub;
    return this.webhooksService.create(createWebhookDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'List all webhooks' })
  @ApiResponse({ status: 200, description: 'List of webhooks' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(
    @CurrentUser() user: JwtPayload,
  ) {
    const userId = user.sub;
    return this.webhooksService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get webhook by ID' })
  @ApiResponse({ status: 200, description: 'Webhook details' })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const userId = user.sub;
    return this.webhooksService.findOne(id, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update webhook' })
  @ApiResponse({ status: 200, description: 'Webhook updated successfully' })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async update(
    @Param('id') id: string,
    @Body() updateWebhookDto: UpdateWebhookDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const userId = user.sub;
    return this.webhooksService.update(id, updateWebhookDto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete webhook' })
  @ApiResponse({ status: 204, description: 'Webhook deleted successfully' })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const userId = user.sub;
    await this.webhooksService.remove(id, userId);
  }

  @Post(':id/test')
  @ApiOperation({ summary: 'Test webhook by sending a test event' })
  @ApiResponse({ status: 200, description: 'Test event sent' })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async test(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    const userId = user?.id || 'temp-user-id'; // Fallback for development
    return this.webhooksService.test(id, userId);
  }

  @Get(':id/deliveries')
  @ApiOperation({ summary: 'Get webhook delivery history' })
  @ApiResponse({ status: 200, description: 'Webhook deliveries' })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getDeliveries(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    const userId = user?.id || 'temp-user-id'; // Fallback for development
    return this.webhooksService.getDeliveries(id, userId);
  }
}

