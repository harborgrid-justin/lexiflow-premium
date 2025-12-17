import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { RisksService } from './risks.service';
import { CreateRiskDto, RiskImpact, RiskProbability } from './dto/create-risk.dto';
import { UpdateRiskDto } from './dto/update-risk.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Risks')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Public() // Allow public access for development
@Controller('risks')
export class RisksController {
  constructor(private readonly risksService: RisksService) {}
  @Get()
  @ApiOperation({ summary: 'Get all risks with optional filters' })
  @ApiQuery({ name: 'impact', enum: RiskImpact, required: false })
  @ApiQuery({ name: 'probability', enum: RiskProbability, required: false })
  async findAll(@Query() query: any) {
    return await this.risksService.findAll(query);
  }

  @Get('heatmap')
  @ApiOperation({ summary: 'Get risk heatmap data' })
  @ApiQuery({ name: 'caseId', required: false })
  async getHeatmap(@Query('caseId') caseId?: string) {
    return await this.risksService.getHeatmap(caseId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get risk by ID' })
  @ApiResponse({ status: 200, description: 'Risk found' })
  @ApiResponse({ status: 404, description: 'Risk not found' })
  async findOne(@Param('id') id: string) {
    return await this.risksService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new risk' })
  @ApiResponse({ status: 201, description: 'Risk created successfully' })
  async create(@Body() createDto: CreateRiskDto) {
    return await this.risksService.create(createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update risk' })
  @ApiResponse({ status: 200, description: 'Risk updated successfully' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateRiskDto) {
    return await this.risksService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete risk' })
  @ApiResponse({ status: 204, description: 'Risk deleted successfully' })
  async remove(@Param('id') id: string) {
    await this.risksService.remove(id);
  }
}

