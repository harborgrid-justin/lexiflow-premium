import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Head,
  HttpCode,
  HttpStatus,
  // CacheInterceptor, // Removed in newer NestJS versions
  // CacheTTL, // Removed in newer NestJS versions
} from '@nestjs/common';
import { ApiResponse }from '@nestjs/swagger';
import { DepositionsService } from './depositions.service';
import { CreateDepositionDto } from './dto/create-deposition.dto';
import { UpdateDepositionDto } from './dto/update-deposition.dto';
import { QueryDepositionDto } from './dto/query-deposition.dto';


@Controller('depositions')
// @UseInterceptors(CacheInterceptor) // Removed in newer NestJS versions
export class DepositionsController {
  constructor(private readonly depositionsService: DepositionsService) {}

  @Head('health')
  @HttpCode(HttpStatus.OK)
  async health() {
    return { status: 'ok' };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async create(@Body() createDto: CreateDepositionDto) {
    return await this.depositionsService.create(createDto);
  }

  @Get()
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(@Query() queryDto: QueryDepositionDto) {
    return await this.depositionsService.findAll(queryDto);
  }

  @Get('upcoming/:caseId')
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getUpcoming(
    @Param('caseId') caseId: string,
    @Query('days') days?: number,
  ) {
    return await this.depositionsService.getUpcoming(caseId, days);
  }

  @Get('statistics/:caseId')
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getStatistics(@Param('caseId') caseId: string) {
    return await this.depositionsService.getStatistics(caseId);
  }

  @Get(':id')
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async findOne(@Param('id') id: string) {
    return await this.depositionsService.findOne(id);
  }

  @Put(':id')
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateDepositionDto,
  ) {
    return await this.depositionsService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async remove(@Param('id') id: string) {
    await this.depositionsService.remove(id);
  }
}

