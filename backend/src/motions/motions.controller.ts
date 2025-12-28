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
import { ApiTags, ApiBearerAuth  , ApiResponse }from '@nestjs/swagger';
import { MotionsService } from './motions.service';
import { CreateMotionDto } from './dto/create-motion.dto';
import { UpdateMotionDto } from './dto/update-motion.dto';
import { Motion } from './entities/motion.entity';

@ApiTags('Motions')
@ApiBearerAuth('JWT-auth')

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
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(): Promise<any> {
    return this.motionsService.findAll();
  }

  // Get motions by case
  @Get('case/:caseId')
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAllByCaseId(@Param('caseId') caseId: string): Promise<any> {
    return this.motionsService.findAllByCaseId(caseId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async create(@Body() createMotionDto: CreateMotionDto): Promise<Motion> {
    return this.motionsService.create(createMotionDto);
  }

  @Get(':id')
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async findOne(@Param('id') id: string): Promise<Motion> {
    return this.motionsService.findOne(id);
  }

  @Put(':id')
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async update(
    @Param('id') id: string,
    @Body() updateMotionDto: UpdateMotionDto,
  ): Promise<Motion> {
    return this.motionsService.update(id, updateMotionDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.motionsService.remove(id);
  }
}

