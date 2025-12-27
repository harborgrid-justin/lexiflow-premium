import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation , ApiResponse }from '@nestjs/swagger';
import { CalendarService } from './calendar.service';
import { CreateCalendarEventDto, UpdateCalendarEventDto } from './dto/calendar.dto';
import { QueryCalendarEventsDto, CalendarEventType } from './dto/query-calendar-events.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';

@ApiTags('Calendar')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)

@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}
  @Get()
  @ApiOperation({ summary: 'Get all calendar events' })
  @ApiResponse({ status: 200, description: 'Events retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(@Query() query: QueryCalendarEventsDto) {
    return await this.calendarService.findAll(query);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming events' })
  @ApiResponse({ status: 200, description: 'Upcoming events retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getUpcoming(@Query('days') days: number = 7) {
    const events = await this.calendarService.findUpcoming(days);
    return { events };
  }

  @Get('statute-of-limitations')
  @ApiOperation({ summary: 'Get statute of limitations events' })
  @ApiResponse({ status: 200, description: 'Statute events retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getStatuteOfLimitations(@Query() query: QueryCalendarEventsDto) {
    // Statute of limitations are typically deadlines, search in title instead
    return await this.calendarService.findAll({ ...query, eventType: CalendarEventType.DEADLINE });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get calendar event by ID' })
  @ApiResponse({ status: 200, description: 'Event found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async findOne(@Param('id') id: string) {
    return await this.calendarService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create calendar event' })
  @ApiResponse({ status: 201, description: 'Event created' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async create(@Body() createDto: CreateCalendarEventDto) {
    return await this.calendarService.create(createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update calendar event' })
  @ApiResponse({ status: 200, description: 'Event updated' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateCalendarEventDto) {
    return await this.calendarService.update(id, updateDto);
  }

  @Put(':id/complete')
  @ApiOperation({ summary: 'Mark event as complete' })
  @ApiResponse({ status: 200, description: 'Event marked complete' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async markComplete(@Param('id') id: string) {
    return await this.calendarService.markComplete(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete calendar event' })
  @ApiResponse({ status: 204, description: 'Event deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async remove(@Param('id') id: string) {
    await this.calendarService.remove(id);
    return;
  }
}

