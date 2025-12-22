import {
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
import { ApiOperation, ApiBearerAuth , ApiResponse} from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { BaseService } from './base.service';
import { BaseRepository } from './base.repository';
import { QueryPaginationDto } from '../dto/query-pagination.dto';
import { StandardResponseDto } from '../dto/standard-response.dto';
import { DeepPartial } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { ObjectLiteral } from 'typeorm';

export abstract class BaseController<T extends ObjectLiteral, CreateDto extends DeepPartial<T>, UpdateDto extends QueryDeepPartialEntity<T>, S extends BaseService<T, BaseRepository<T>>> {
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
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(@Query() query: QueryPaginationDto): Promise<StandardResponseDto<{ data: T[]; total: number; page: number; limit: number; totalPages: number }>> {
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
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async findOne(@Param('id') id: string): Promise<StandardResponseDto<T>> {
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
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async create(@Body() createDto: CreateDto): Promise<StandardResponseDto<T>> {
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
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateDto): Promise<StandardResponseDto<T>> {
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
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async delete(@Param('id') id: string): Promise<StandardResponseDto<undefined>> {
    await this.service.delete(id);

    return new StandardResponseDto(
      true,
      `${this.resourceName} deleted successfully`,
    );
  }
}
