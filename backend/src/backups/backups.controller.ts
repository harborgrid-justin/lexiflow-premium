import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { BackupsService } from './backups.service';

@ApiTags('Backups')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Public()
@Controller('backups')
export class BackupsController {
  constructor(private readonly backupsService: BackupsService) {}

  @Get('snapshots')
  @ApiOperation({ summary: 'Get all snapshots' })
  async getSnapshots(@Query() query: any) {
    return await this.backupsService.getSnapshots(query);
  }

  @Get('snapshots/:id')
  @ApiOperation({ summary: 'Get snapshot by ID' })
  async getSnapshot(@Param('id') id: string) {
    return await this.backupsService.getSnapshot(id);
  }

  @Post('snapshots')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create snapshot' })
  async createSnapshot(@Body() body: any) {
    return await this.backupsService.createSnapshot(body);
  }

  @Delete('snapshots/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete snapshot' })
  async deleteSnapshot(@Param('id') id: string) {
    await this.backupsService.deleteSnapshot(id);
  }

  @Post('snapshots/:id/restore')
  @ApiOperation({ summary: 'Restore from snapshot' })
  async restore(@Param('id') id: string, @Body() body: { target: string }) {
    return await this.backupsService.restore(id, body.target);
  }

  @Get('schedules')
  @ApiOperation({ summary: 'Get backup schedules' })
  async getSchedules() {
    return await this.backupsService.getSchedules();
  }

  @Post('schedules')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create backup schedule' })
  async createSchedule(@Body() body: any) {
    return await this.backupsService.createSchedule(body);
  }

  @Put('schedules/:id')
  @ApiOperation({ summary: 'Update backup schedule' })
  async updateSchedule(@Param('id') id: string, @Body() body: any) {
    return await this.backupsService.updateSchedule(id, body);
  }

  @Delete('schedules/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete backup schedule' })
  async deleteSchedule(@Param('id') id: string) {
    await this.backupsService.deleteSchedule(id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get backup statistics' })
  async getStats() {
    return await this.backupsService.getStats();
  }
}
