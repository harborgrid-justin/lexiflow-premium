import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation  , ApiResponse }from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { BackupsService } from './backups.service';

@ApiTags('Backups')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)

@Controller('backups')
export class BackupsController {
  constructor(private readonly backupsService: BackupsService) {}

  @Get('snapshots')
  @ApiOperation({ summary: 'Get all snapshots' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getSnapshots(@Query() query: any) {
    return await this.backupsService.getSnapshots(query);
  }

  @Get('snapshots/:id')
  @ApiOperation({ summary: 'Get snapshot by ID' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async getSnapshot(@Param('id') id: string) {
    return await this.backupsService.getSnapshot(id);
  }

  @Post('snapshots')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create snapshot' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async createSnapshot(@Body() body: any) {
    return await this.backupsService.createSnapshot(body);
  }

  @Delete('snapshots/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete snapshot' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async deleteSnapshot(@Param('id') id: string) {
    await this.backupsService.deleteSnapshot(id);
  }

  @Post('snapshots/:id/restore')
  @ApiOperation({ summary: 'Restore from snapshot' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async restore(@Param('id') id: string, @Body() body: { target: string }) {
    return await this.backupsService.restore(id, body.target);
  }

  @Get('schedules')
  @ApiOperation({ summary: 'Get backup schedules' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getSchedules() {
    return await this.backupsService.getSchedules();
  }

  @Post('schedules')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create backup schedule' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async createSchedule(@Body() body: any) {
    return await this.backupsService.createSchedule(body);
  }

  @Put('schedules/:id')
  @ApiOperation({ summary: 'Update backup schedule' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async updateSchedule(@Param('id') id: string, @Body() body: any) {
    return await this.backupsService.updateSchedule(id, body);
  }

  @Delete('schedules/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete backup schedule' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async deleteSchedule(@Param('id') id: string) {
    await this.backupsService.deleteSchedule(id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get backup statistics' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getStats() {
    return await this.backupsService.getStats();
  }
}
