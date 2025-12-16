import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CitationsService } from './citations.service';
import { CreateCitationDto, UpdateCitationDto } from './dto/citation.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Citations')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/citations')
export class CitationsController {
  constructor(private readonly citationsService: CitationsService) {}
  @Get()
  @ApiOperation({ summary: 'Get all citations' })
  @ApiResponse({ status: 200, description: 'Citations retrieved' })
  async findAll(@Query() query: any) {
    return await this.citationsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get citation by ID' })
  @ApiResponse({ status: 200, description: 'Citation found' })
  async findOne(@Param('id') id: string) {
    return await this.citationsService.findOne(id);
  }

  @Get(':id/shepards')
  @ApiOperation({ summary: 'Check Shepards citation status' })
  @ApiResponse({ status: 200, description: 'Shepards data retrieved' })
  async checkShepards(@Param('id') id: string) {
    return await this.citationsService.checkShepards(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create citation' })
  @ApiResponse({ status: 201, description: 'Citation created' })
  async create(@Body() createDto: CreateCitationDto) {
    return await this.citationsService.create(createDto);
  }

  @Post('verify-all')
  @ApiOperation({ summary: 'Verify all citations' })
  @ApiResponse({ status: 200, description: 'Verification complete' })
  async verifyAll() {
    return await this.citationsService.verifyAll();
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update citation' })
  @ApiResponse({ status: 200, description: 'Citation updated' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateCitationDto) {
    return await this.citationsService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete citation' })
  @ApiResponse({ status: 204, description: 'Citation deleted' })
  async remove(@Param('id') id: string) {
    await this.citationsService.remove(id);
  }
}
