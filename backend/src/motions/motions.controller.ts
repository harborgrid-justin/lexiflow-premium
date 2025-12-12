import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MotionsService } from './motions.service';
import { CreateMotionDto } from './dto/create-motion.dto';
import { UpdateMotionDto } from './dto/update-motion.dto';
import { Motion } from './entities/motion.entity';

@Controller('api/v1')
export class MotionsController {
  constructor(private readonly motionsService: MotionsService) {}

  @Get('cases/:caseId/motions')
  async findAllByCaseId(@Param('caseId') caseId: string): Promise<Motion[]> {
    return this.motionsService.findAllByCaseId(caseId);
  }

  @Post('cases/:caseId/motions')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createMotionDto: CreateMotionDto): Promise<Motion> {
    return this.motionsService.create(createMotionDto);
  }

  @Put('motions/:id')
  async update(
    @Param('id') id: string,
    @Body() updateMotionDto: UpdateMotionDto,
  ): Promise<Motion> {
    return this.motionsService.update(id, updateMotionDto);
  }

  @Delete('motions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.motionsService.remove(id);
  }

  @Post('motions/:motionId/deadlines')
  @HttpCode(HttpStatus.CREATED)
  async createDeadline(@Body() createDto: any) {
    return this.motionsService.createDeadline(createDto);
  }

  @Get('motions/:motionId/deadlines')
  async getDeadlines(@Param('motionId') motionId: string) {
    return this.motionsService.getDeadlines(motionId);
  }

  @Get('cases/:caseId/motions/deadlines')
  async getCaseDeadlines(@Param('caseId') caseId: string) {
    return this.motionsService.getCaseDeadlines(caseId);
  }

  @Get('motions/deadlines/upcoming')
  async getUpcomingDeadlines(@Query('days') days?: string, @Query('userId') userId?: string) {
    return this.motionsService.getUpcomingDeadlines(
      days ? parseInt(days, 10) : 7,
      userId,
    );
  }

  @Get('motions/deadlines/overdue')
  async getOverdueDeadlines(@Query('userId') userId?: string) {
    return this.motionsService.getOverdueDeadlines(userId);
  }

  @Post('motions/deadlines/:id/complete')
  async completeDeadline(
    @Param('id') id: string,
    @Body() body: { userId: string; notes?: string },
  ) {
    return this.motionsService.completeDeadline(id, body.userId, body.notes);
  }

  @Get('motions/deadlines/alerts')
  async getDeadlineAlerts(@Query('userId') userId?: string, @Query('days') days?: string) {
    return this.motionsService.getDeadlineAlerts(
      userId,
      days ? parseInt(days, 10) : 7,
    );
  }

  @Get('motions/deadlines/statistics')
  async getDeadlineStatistics(
    @Query('caseId') caseId?: string,
    @Query('userId') userId?: string,
  ) {
    return this.motionsService.getDeadlineStatistics({ caseId, userId });
  }

  @Get('cases/:caseId/motions/by-status/:status')
  async findByStatus(@Param('caseId') caseId: string, @Param('status') status: string) {
    return this.motionsService.findByStatus(caseId, status);
  }

  @Get('cases/:caseId/motions/by-type/:type')
  async findByType(@Param('caseId') caseId: string, @Param('type') type: string) {
    return this.motionsService.findByType(caseId, type);
  }
}
