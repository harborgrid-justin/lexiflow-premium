import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ExternalApiService } from './external-api.service';
import { PacerService } from '../pacer/pacer.service';
import { CalendarService } from '../calendar/calendar.service';
import { PacerSearchDto, PacerIntegrationSyncDto } from '../pacer/dto';
import { CalendarIntegrationEventDto, CalendarSyncDto } from '../calendar/dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@ApiTags('Integrations')
@Public() // Allow public access for development
@Controller('integrations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ExternalApiController {
  constructor(
    private readonly externalApiService: ExternalApiService,
    private readonly pacerService: PacerService,
    private readonly calendarService: CalendarService,
  ) {}

  // PACER Integration Endpoints
  @Post('pacer/search')
  @ApiOperation({ summary: 'Search PACER for cases' })
  @ApiResponse({ status: 200, description: 'Search results from PACER' })
  @ApiResponse({ status: 400, description: 'Invalid search criteria' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async searchPacer(@Body() searchDto: PacerSearchDto) {
    return this.pacerService.search(searchDto);
  }

  @Post('pacer/sync')
  @ApiOperation({ summary: 'Sync case data from PACER' })
  @ApiResponse({ status: 200, description: 'Case data synced from PACER' })
  @ApiResponse({ status: 400, description: 'Invalid sync request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async syncFromPacer(@Body() syncDto: PacerIntegrationSyncDto) {
    return this.pacerService.sync(syncDto);
  }

  // Calendar Integration Endpoints
  @Post('calendar/events')
  @ApiOperation({ summary: 'Create a calendar event' })
  @ApiResponse({ status: 201, description: 'Calendar event created' })
  @ApiResponse({ status: 400, description: 'Invalid event data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createCalendarEvent(
    @Body() createEventDto: CalendarIntegrationEventDto,
    @CurrentUser() user: any,
  ) {
    const userId = user.id;
    return this.calendarService.createEvent(createEventDto, userId);
  }

  @Post('calendar/sync')
  @ApiOperation({ summary: 'Sync calendar events' })
  @ApiResponse({ status: 200, description: 'Calendar events synced' })
  @ApiResponse({ status: 400, description: 'Invalid sync request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async syncCalendar(
    @Body() syncDto: CalendarSyncDto,
    @CurrentUser() user: any,
  ) {
    const userId = user.id;
    return this.calendarService.sync(syncDto, userId);
  }

  @Get('calendar/upcoming')
  @ApiOperation({ summary: 'Get upcoming calendar events' })
  @ApiResponse({ status: 200, description: 'Upcoming calendar events' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUpcomingEvents() {
    return this.calendarService.getUpcomingEvents();
  }

  // Integration Status Endpoint
  @Get('status')
  @ApiOperation({ summary: 'Get status of all integrations' })
  @ApiResponse({ status: 200, description: 'Integration status information' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getIntegrationStatus() {
    return this.externalApiService.getIntegrationStatus();
  }
}

