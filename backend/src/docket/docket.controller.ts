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
import { Public } from '../common/decorators/public.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DocketService } from './docket.service';
import { CreateDocketEntryDto } from './dto/create-docket-entry.dto';
import { UpdateDocketEntryDto } from './dto/update-docket-entry.dto';
import { PacerSyncDto, PacerSyncResultDto } from './dto/pacer-sync.dto';
import { DocketEntry } from './entities/docket-entry.entity';

@ApiTags('Docket')
@ApiBearerAuth('JWT-auth')
@Public() // Allow public access for development
@Controller('docket')
export class DocketController {
  constructor(private readonly docketService: DocketService) {}

  @Get()
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

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<DocketEntry> {
    return this.docketService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createDocket(@Body() createDocketEntryDto: CreateDocketEntryDto): Promise<DocketEntry> {
    return this.docketService.create(createDocketEntryDto);
  }

  @Delete(':id')
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

  @Put(':id')
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

