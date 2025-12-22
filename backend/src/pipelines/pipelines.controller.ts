import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation , ApiResponse }from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PipelinesService } from './pipelines.service';
import { CreatePipelineDto, UpdatePipelineDto } from './dto/create-pipeline.dto';

@ApiTags('Pipelines')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)

@Controller('pipelines')
export class PipelinesController {
  constructor(private readonly pipelinesService: PipelinesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all pipelines' })
  @ApiResponse({ status: 200, description: 'Pipelines retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(@Query() query: any) {
    return await this.pipelinesService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get pipeline statistics' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getStats() {
    return await this.pipelinesService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get pipeline by ID' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async findOne(@Param('id') id: string) {
    return await this.pipelinesService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create pipeline' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async create(@Body() createDto: CreatePipelineDto) {
    return await this.pipelinesService.create(createDto);
  }

  @Post(':id/execute')
  @ApiOperation({ summary: 'Execute pipeline' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async execute(@Param('id') id: string) {
    return await this.pipelinesService.execute(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update pipeline' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async update(@Param('id') id: string, @Body() updateDto: UpdatePipelineDto) {
    return await this.pipelinesService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete pipeline' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async remove(@Param('id') id: string) {
    await this.pipelinesService.remove(id);
  }
}
