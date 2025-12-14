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
} from '@nestjs/common';
import { DocketService } from './docket.service';
import { CreateDocketEntryDto } from './dto/create-docket-entry.dto';
import { UpdateDocketEntryDto } from './dto/update-docket-entry.dto';
import { PacerSyncDto, PacerSyncResultDto } from './dto/pacer-sync.dto';
import { DocketEntry } from './entities/docket-entry.entity';

@Controller('api/v1')
export class DocketController {
  constructor(private readonly docketService: DocketService) {}

  @Get('docket')
  async findAll(@Query('caseId') caseId?: string): Promise<{ data: DocketEntry[]; total: number; page: number; limit: number; totalPages: number }> {
    const entries = caseId ? await this.docketService.findAllByCaseId(caseId) : await this.docketService.findAll();
    return {
      data: entries,
      total: entries.length,
      page: 1,
      limit: entries.length,
      totalPages: 1,
    };
  }

  @Get('docket/:id')
  async findOne(@Param('id') id: string): Promise<DocketEntry> {
    return this.docketService.findOne(id);
  }

  @Post('docket')
  @HttpCode(HttpStatus.CREATED)
  async createDocket(@Body() createDocketEntryDto: CreateDocketEntryDto): Promise<DocketEntry> {
    return this.docketService.create(createDocketEntryDto);
  }

  @Delete('docket/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeDocket(@Param('id') id: string): Promise<void> {
    return this.docketService.remove(id);
  }

  @Get('cases/:caseId/docket')
  async findAllByCaseId(@Param('caseId') caseId: string): Promise<DocketEntry[]> {
    return this.docketService.findAllByCaseId(caseId);
  }

  @Post('cases/:caseId/docket')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDocketEntryDto: CreateDocketEntryDto): Promise<DocketEntry> {
    return this.docketService.create(createDocketEntryDto);
  }

  @Put('docket/:id')
  async update(
    @Param('id') id: string,
    @Body() updateDocketEntryDto: UpdateDocketEntryDto,
  ): Promise<DocketEntry> {
    return this.docketService.update(id, updateDocketEntryDto);
  }

  @Post('pacer/sync')
  @HttpCode(HttpStatus.OK)
  async syncFromPacer(@Body() pacerSyncDto: PacerSyncDto): Promise<PacerSyncResultDto> {
    return this.docketService.syncFromPacer(pacerSyncDto);
  }
}
