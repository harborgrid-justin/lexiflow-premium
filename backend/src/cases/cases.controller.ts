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
} from '@nestjs/common';
import { CasesService } from './cases.service';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseDto } from './dto/update-case.dto';
import { CaseFilterDto } from './dto/case-filter.dto';
import { CaseResponseDto, PaginatedCaseResponseDto } from './dto/case-response.dto';

@Controller('api/v1/cases')
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Get()
  async findAll(@Query() filterDto: CaseFilterDto): Promise<PaginatedCaseResponseDto> {
    return this.casesService.findAll(filterDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<CaseResponseDto> {
    return this.casesService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCaseDto: CreateCaseDto): Promise<CaseResponseDto> {
    return this.casesService.create(createCaseDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCaseDto: UpdateCaseDto,
  ): Promise<CaseResponseDto> {
    return this.casesService.update(id, updateCaseDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.casesService.remove(id);
  }

  @Post(':id/archive')
  async archive(@Param('id') id: string): Promise<CaseResponseDto> {
    return this.casesService.archive(id);
  }

  @Get(':id/timeline')
  async getTimeline(
    @Param('id') id: string,
    @Query('eventType') eventType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
  ) {
    return this.casesService.getTimeline(id, {
      eventType,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get(':id/workflow/transitions')
  async getAvailableTransitions(@Param('id') id: string) {
    return this.casesService.getAvailableTransitions(id);
  }

  @Get(':id/statistics')
  async getStatistics(@Param('id') id: string) {
    return this.casesService.getStatistics(id);
  }
}
