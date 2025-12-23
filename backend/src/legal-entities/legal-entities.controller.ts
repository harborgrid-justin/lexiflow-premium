import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { LegalEntitiesService } from './legal-entities.service';
import { CreateLegalEntityDto, UpdateLegalEntityDto } from './dto/legal-entity.dto';

@ApiTags('Legal Entities')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('legal-entities')
export class LegalEntitiesController {
  constructor(private readonly legalEntitiesService: LegalEntitiesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all legal entities' })
  @ApiResponse({ status: 200, description: 'Entities retrieved successfully' })
  async findAll(@Query() query: any) {
    return await this.legalEntitiesService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get entity statistics' })
  async getStats() {
    return await this.legalEntitiesService.getStats();
  }

  @Get('relationships')
  @ApiOperation({ summary: 'Get all entity relationships' })
  async getAllRelationships() {
    return await this.legalEntitiesService.getAllRelationships();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get legal entity by ID' })
  @ApiResponse({ status: 404, description: 'Entity not found' })
  async findOne(@Param('id') id: string) {
    return await this.legalEntitiesService.findOne(id);
  }

  @Get(':id/relationships')
  @ApiOperation({ summary: 'Get entity relationships' })
  async getRelationships(@Param('id') id: string) {
    return await this.legalEntitiesService.getRelationships(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create legal entity' })
  async create(@Body() createDto: CreateLegalEntityDto) {
    return await this.legalEntitiesService.create(createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update legal entity' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateLegalEntityDto) {
    return await this.legalEntitiesService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete legal entity' })
  async remove(@Param('id') id: string) {
    await this.legalEntitiesService.remove(id);
  }
}
