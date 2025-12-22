import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation , ApiResponse }from '@nestjs/swagger';
import { TrialService } from './trial.service';
import { CreateTrialEventDto } from './dto/create-trial-event.dto';
import { UpdateTrialEventDto } from './dto/update-trial-event.dto';
import { CreateWitnessPrepDto } from './dto/create-witness-prep.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Trial')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)

@Controller('trial')
export class TrialController {
  constructor(private readonly trialService: TrialService) {}

  // Health check endpoint
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async health() {
    return { status: 'ok', service: 'trial' };
  }

  // Trial Events
  @Get('events')
  @ApiOperation({ summary: 'Get trial events' })
  @ApiResponse({ status: 200, description: 'Events retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getEvents(@Query() query: any) {
    return await this.trialService.findAllEvents(query);
  }

  @Post('events')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create trial event' })
  @ApiResponse({ status: 201, description: 'Event created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async createEvent(@Body() createDto: CreateTrialEventDto) {
    return await this.trialService.createEvent(createDto);
  }

  @Put('events/:id')
  @ApiOperation({ summary: 'Update trial event' })
  @ApiResponse({ status: 200, description: 'Event updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async updateEvent(@Param('id') id: string, @Body() updateDto: UpdateTrialEventDto) {
    return await this.trialService.updateEvent(id, updateDto);
  }

  @Delete('events/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete trial event' })
  @ApiResponse({ status: 204, description: 'Event deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async deleteEvent(@Param('id') id: string) {
    await this.trialService.removeEvent(id);
  }

  // Witness Prep
  @Get('witness-prep')
  @ApiOperation({ summary: 'Get witness prep sessions' })
  @ApiResponse({ status: 200, description: 'Sessions retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getWitnessPrep(@Query() query: any) {
    return await this.trialService.findAllWitnessPrep(query);
  }

  @Post('witness-prep')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create witness prep session' })
  @ApiResponse({ status: 201, description: 'Session created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async createWitnessPrep(@Body() createDto: CreateWitnessPrepDto) {
    return await this.trialService.createWitnessPrep(createDto);
  }
}

