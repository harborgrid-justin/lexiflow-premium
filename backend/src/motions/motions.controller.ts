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
  Head,
} from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { MotionsService } from './motions.service';
import { CreateMotionDto } from './dto/create-motion.dto';
import { UpdateMotionDto } from './dto/update-motion.dto';
import { Motion } from './entities/motion.entity';

@ApiTags('Motions')
@ApiBearerAuth('JWT-auth')
@Public() // Allow public access for development
@Controller('motions')
export class MotionsController {
  constructor(private readonly motionsService: MotionsService) {}

  // Health check endpoint
  @Head()
  @HttpCode(HttpStatus.OK)
  async health() {
    return;
  }

  // Get all motions
  @Get()
  async findAll(): Promise<Motion[]> {
    return this.motionsService.findAll();
  }

  // Get motions by case
  @Get('case/:caseId')
  async findAllByCaseId(@Param('caseId') caseId: string): Promise<Motion[]> {
    return this.motionsService.findAllByCaseId(caseId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createMotionDto: CreateMotionDto): Promise<Motion> {
    return this.motionsService.create(createMotionDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Motion> {
    return this.motionsService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateMotionDto: UpdateMotionDto,
  ): Promise<Motion> {
    return this.motionsService.update(id, updateMotionDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.motionsService.remove(id);
  }
}

