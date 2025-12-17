import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CalendarService } from './calendar.service';
import { CreateCalendarEventDto, UpdateCalendarEventDto } from './dto/calendar.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Calendar')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Public() // Allow public access for development
@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}
  @Get()
  @ApiOperation({ summary: 'Get all calendar events' })
  @ApiResponse({ status: 200, description: 'Events retrieved' })
  async findAll(@Query() query: any) {
    return await this.calendarService.findAll(query);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming events' })
  @ApiResponse({ status: 200, description: 'Upcoming events retrieved' })
  async getUpcoming(@Query('days') days: number = 7) {
    const events = await this.calendarService.findUpcoming(days);
    return { events };
  }

  @Get('statute-of-limitations')
  @ApiOperation({ summary: 'Get statute of limitations events' })
  @ApiResponse({ status: 200, description: 'Statute events retrieved' })
  async getStatuteOfLimitations(@Query() query: any) {
    return await this.calendarService.findAll({ ...query, eventType: 'statute-of-limitations' });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get calendar event by ID' })
  @ApiResponse({ status: 200, description: 'Event found' })
  async findOne(@Param('id') id: string) {
    return await this.calendarService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create calendar event' })
  @ApiResponse({ status: 201, description: 'Event created' })
  async create(@Body() createDto: CreateCalendarEventDto) {
    return await this.calendarService.create(createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update calendar event' })
  @ApiResponse({ status: 200, description: 'Event updated' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateCalendarEventDto) {
    return await this.calendarService.update(id, updateDto);
  }

  @Put(':id/complete')
  @ApiOperation({ summary: 'Mark event as complete' })
  @ApiResponse({ status: 200, description: 'Event marked complete' })
  async markComplete(@Param('id') id: string) {
    return await this.calendarService.markComplete(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete calendar event' })
  @ApiResponse({ status: 204, description: 'Event deleted' })
  async remove(@Param('id') id: string) {
    await this.calendarService.remove(id);
    return;
  }
}

