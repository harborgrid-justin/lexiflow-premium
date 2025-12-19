import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam , ApiResponse} from '@nestjs/swagger';
import { CommunicationsService } from './communications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Communications')
@ApiBearerAuth('JWT-auth')

@Controller('communications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CommunicationsController {
  constructor(private readonly communicationsService: CommunicationsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.PARTNER, UserRole.ATTORNEY, UserRole.PARALEGAL)
  @ApiOperation({ summary: 'Get all communications' })
  @ApiResponse({ status: 200, description: 'List of communications' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findAll() {
    return this.communicationsService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.PARTNER, UserRole.ATTORNEY, UserRole.PARALEGAL)
  @ApiOperation({ summary: 'Get communication by ID' })
  @ApiResponse({ status: 200, description: 'Communication details' })
  @ApiResponse({ status: 404, description: 'Communication not found' })
  @ApiParam({ name: 'id', description: 'Communication ID' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findOne(@Param('id') id: string) {
    return this.communicationsService.findById(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.PARTNER, UserRole.ATTORNEY, UserRole.PARALEGAL)
  @ApiOperation({ summary: 'Create new communication' })
  @ApiResponse({ status: 201, description: 'Communication created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  create(@Body() createDto: any) {
    return this.communicationsService.create(createDto);
  }

  @Post('template/:templateId/render')
  @Roles(UserRole.ADMIN, UserRole.PARTNER, UserRole.ATTORNEY, UserRole.PARALEGAL)
  @ApiOperation({ summary: 'Render communication template' })
  @ApiResponse({ status: 200, description: 'Template rendered successfully' })
  @ApiParam({ name: 'templateId', description: 'Template ID' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  renderTemplate(@Param('templateId') templateId: string, @Body() variables: { caseNumber: string; clientName: string; }) {
    throw new Error('Method not implemented.');
  }

  @Post(':id/schedule')
  @Roles(UserRole.ADMIN, UserRole.PARTNER, UserRole.ATTORNEY, UserRole.PARALEGAL)
  @ApiOperation({ summary: 'Schedule communication delivery' })
  @ApiResponse({ status: 201, description: 'Communication scheduled' })
  @ApiParam({ name: 'id', description: 'Communication ID' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  scheduleMessage(@Param('id') id: string, @Body() scheduleDto: { scheduledAt: Date; }) {
    throw new Error('Method not implemented.');
  }

  @Get('scheduled/list')
  @Roles(UserRole.ADMIN, UserRole.PARTNER, UserRole.ATTORNEY, UserRole.PARALEGAL)
  @ApiOperation({ summary: 'Get scheduled communications' })
  @ApiResponse({ status: 200, description: 'List of scheduled communications' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  getScheduledMessages() {
    throw new Error('Method not implemented.');
  }

  @Get(':id/delivery-status')
  @Roles(UserRole.ADMIN, UserRole.PARTNER, UserRole.ATTORNEY, UserRole.PARALEGAL)
  @ApiOperation({ summary: 'Get communication delivery status' })
  @ApiResponse({ status: 200, description: 'Delivery status' })
  @ApiParam({ name: 'id', description: 'Communication ID' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  getDeliveryStatus(@Param('id') commId: string) {
    throw new Error('Method not implemented.');
  }
}

