import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PipelinesService } from './pipelines.service';
import { CreatePipelineDto, UpdatePipelineDto } from './dto/create-pipeline.dto';

@ApiTags('Pipelines')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Public()
@Controller('pipelines')
export class PipelinesController {
  constructor(private readonly pipelinesService: PipelinesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all pipelines' })
  @ApiResponse({ status: 200, description: 'Pipelines retrieved successfully' })
  async findAll(@Query() query: any) {
    return await this.pipelinesService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get pipeline statistics' })
  async getStats() {
    return await this.pipelinesService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get pipeline by ID' })
  async findOne(@Param('id') id: string) {
    return await this.pipelinesService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create pipeline' })
  async create(@Body() createDto: CreatePipelineDto) {
    return await this.pipelinesService.create(createDto);
  }

  @Post(':id/execute')
  @ApiOperation({ summary: 'Execute pipeline' })
  async execute(@Param('id') id: string) {
    return await this.pipelinesService.execute(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update pipeline' })
  async update(@Param('id') id: string, @Body() updateDto: UpdatePipelineDto) {
    return await this.pipelinesService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete pipeline' })
  async remove(@Param('id') id: string) {
    await this.pipelinesService.remove(id);
  }
}
