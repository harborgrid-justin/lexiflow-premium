import { Controller, Get, Post, Put, Delete, Body, Param, Patch, UseGuards, UseInterceptors, CacheInterceptor } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth , ApiResponse} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { WitnessesService } from './witnesses.service';
import { Witness, WitnessType, WitnessStatus } from './entities/witness.entity';

@ApiTags('discovery/witnesses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(CacheInterceptor)
@Controller('witnesses')
export class WitnessesController {
  constructor(private readonly witnessesService: WitnessesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new witness' })
  @ApiResponse({ status: 201, description: 'Witness created successfully', type: Witness })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async create(@Body() witnessData: Partial<Witness>): Promise<Witness> {
    return this.witnessesService.create(witnessData);
  }

  @Get()
  @ApiOperation({ summary: 'Get all witnesses' })
  @ApiResponse({ status: 200, description: 'Witnesses retrieved successfully', type: [Witness] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(): Promise<Witness[]> {
    return this.witnessesService.findAll();
  }

  @Get('case/:caseId')
  @ApiOperation({ summary: 'Get witnesses by case' })
  @ApiResponse({ status: 200, description: 'Witnesses retrieved successfully', type: [Witness] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findByCase(@Param('caseId') caseId: string): Promise<Witness[]> {
    return this.witnessesService.findByCase(caseId);
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Get witnesses by type' })
  @ApiResponse({ status: 200, description: 'Witnesses retrieved successfully', type: [Witness] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findByType(@Param('type') type: WitnessType): Promise<Witness[]> {
    return this.witnessesService.findByType(type);
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get witnesses by status' })
  @ApiResponse({ status: 200, description: 'Witnesses retrieved successfully', type: [Witness] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findByStatus(@Param('status') status: WitnessStatus): Promise<Witness[]> {
    return this.witnessesService.findByStatus(status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get witness by ID' })
  @ApiResponse({ status: 200, description: 'Witness retrieved successfully', type: Witness })
  @ApiResponse({ status: 404, description: 'Witness not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findOne(@Param('id') id: string): Promise<Witness> {
    return this.witnessesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a witness' })
  @ApiResponse({ status: 200, description: 'Witness updated successfully', type: Witness })
  @ApiResponse({ status: 404, description: 'Witness not found' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<Witness>,
  ): Promise<Witness> {
    return this.witnessesService.update(id, updateData);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update witness status' })
  @ApiResponse({ status: 200, description: 'Witness status updated successfully', type: Witness })
  @ApiResponse({ status: 404, description: 'Witness not found' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: WitnessStatus,
  ): Promise<Witness> {
    return this.witnessesService.updateStatus(id, status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a witness' })
  @ApiResponse({ status: 200, description: 'Witness deleted successfully' })
  @ApiResponse({ status: 404, description: 'Witness not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.witnessesService.remove(id);
  }
}
