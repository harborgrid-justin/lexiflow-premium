import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  ParseBoolPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ClausesService } from './clauses.service';
import { CreateClauseDto } from './dto/create-clause.dto';
import { UpdateClauseDto } from './dto/update-clause.dto';
import { ClauseCategory } from './entities/clause.entity';

@ApiTags('clauses')
@Public() // Allow public access for development
@Controller('clauses')
export class ClausesController {
  constructor(private readonly clausesService: ClausesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new clause' })
  @ApiResponse({ status: 201, description: 'Clause created successfully' })
  async create(@Body() createClauseDto: CreateClauseDto) {
    return await this.clausesService.create(createClauseDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all clauses' })
  @ApiQuery({ name: 'category', required: false, enum: ClauseCategory })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'tag', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Clauses retrieved successfully' })
  async findAll(
    @Query('category') category?: ClauseCategory,
    @Query('search') search?: string,
    @Query('tag') tag?: string,
    @Query('isActive') isActive?: boolean,
  ) {
    return await this.clausesService.findAll(category, search, tag, isActive);
  }

  @Get('most-used')
  @ApiOperation({ summary: 'Get most used clauses' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Most used clauses retrieved' })
  async getMostUsed(@Query('limit', ParseIntPipe) limit?: number) {
    return await this.clausesService.getMostUsed(limit || 10);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a clause by ID' })
  @ApiResponse({ status: 200, description: 'Clause found' })
  @ApiResponse({ status: 404, description: 'Clause not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.clausesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a clause' })
  @ApiResponse({ status: 200, description: 'Clause updated successfully' })
  @ApiResponse({ status: 404, description: 'Clause not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateClauseDto: UpdateClauseDto,
  ) {
    return await this.clausesService.update(id, updateClauseDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a clause' })
  @ApiResponse({ status: 200, description: 'Clause deleted successfully' })
  @ApiResponse({ status: 404, description: 'Clause not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.clausesService.remove(id);
    return { message: 'Clause deleted successfully' };
  }

  @Post(':id/increment-usage')
  @ApiOperation({ summary: 'Increment clause usage count' })
  @ApiResponse({ status: 200, description: 'Usage count incremented' })
  async incrementUsage(@Param('id', ParseUUIDPipe) id: string) {
    await this.clausesService.incrementUsage(id);
    return { message: 'Usage count incremented' };
  }
}

