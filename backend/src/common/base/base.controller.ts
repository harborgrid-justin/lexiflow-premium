import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { BaseService } from './base.service';
import { BaseRepository } from './base.repository';
import { QueryPaginationDto } from '../dto/query-pagination.dto';
import { StandardResponseDto } from '../dto/standard-response.dto';

export abstract class BaseController<T, S extends BaseService<T, any>> {
  protected readonly resourceName: string;
  
  constructor(
    protected readonly service: S,
    resourceName: string,
  ) {
    this.resourceName = resourceName;
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all resources' })
  async findAll(@Query() query: QueryPaginationDto) {
    const result = await this.service.findWithPagination(
      query.page,
      query.limit,
    );

    return new StandardResponseDto(
      true,
      `${this.resourceName}s retrieved successfully`,
      result,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get resource by ID' })
  async findOne(@Param('id') id: string) {
    const data = await this.service.findById(id);

    return new StandardResponseDto(
      true,
      `${this.resourceName} retrieved successfully`,
      data,
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new resource' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: any) {
    const data = await this.service.create(createDto);

    return new StandardResponseDto(
      true,
      `${this.resourceName} created successfully`,
      data,
    );
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update resource' })
  async update(@Param('id') id: string, @Body() updateDto: any) {
    const data = await this.service.update(id, updateDto);

    return new StandardResponseDto(
      true,
      `${this.resourceName} updated successfully`,
      data,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete resource' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.service.delete(id);

    return new StandardResponseDto(
      true,
      `${this.resourceName} deleted successfully`,
    );
  }
}
