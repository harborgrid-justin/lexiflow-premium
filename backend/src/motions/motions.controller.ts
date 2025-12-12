import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
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
}
