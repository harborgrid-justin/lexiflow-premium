import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CasesService } from './cases.service';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseDto } from './dto/update-case.dto';
import { CaseFilterDto } from './dto/case-filter.dto';
import { CaseResponseDto, PaginatedCaseResponseDto } from './dto/case-response.dto';

@ApiTags('Cases')
@ApiBearerAuth('JWT-auth')
@Controller('api/v1/cases')
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Get()
  @ApiOperation({ summary: 'List all cases' })
  @ApiResponse({ status: 200, description: 'List of cases', type: PaginatedCaseResponseDto })
  async findAll(@Query() filterDto: CaseFilterDto): Promise<PaginatedCaseResponseDto> {
    return this.casesService.findAll(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get case by ID' })
  @ApiResponse({ status: 200, description: 'Case details', type: CaseResponseDto })
  @ApiResponse({ status: 404, description: 'Case not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<CaseResponseDto> {
    return this.casesService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new case' })
  @ApiResponse({ status: 201, description: 'Case created successfully', type: CaseResponseDto })
  async create(@Body() createCaseDto: CreateCaseDto): Promise<CaseResponseDto> {
    return this.casesService.create(createCaseDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a case' })
  @ApiResponse({ status: 200, description: 'Case updated successfully', type: CaseResponseDto })
  @ApiResponse({ status: 404, description: 'Case not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCaseDto: UpdateCaseDto,
  ): Promise<CaseResponseDto> {
    return this.casesService.update(id, updateCaseDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a case' })
  @ApiResponse({ status: 204, description: 'Case deleted successfully' })
  @ApiResponse({ status: 404, description: 'Case not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.casesService.remove(id);
  }

  @Post(':id/archive')
  @ApiOperation({ summary: 'Archive a case' })
  @ApiResponse({ status: 200, description: 'Case archived successfully', type: CaseResponseDto })
  @ApiResponse({ status: 404, description: 'Case not found' })
  async archive(@Param('id', ParseUUIDPipe) id: string): Promise<CaseResponseDto> {
    return this.casesService.archive(id);
  }
}
