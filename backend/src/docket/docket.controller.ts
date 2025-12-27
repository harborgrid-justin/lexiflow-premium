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
  UseInterceptors,
  CacheInterceptor,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { DocketService } from './docket.service';
import { CreateDocketEntryDto } from './dto/create-docket-entry.dto';
import { UpdateDocketEntryDto } from './dto/update-docket-entry.dto';
import { PacerSyncDto, PacerSyncResultDto } from './dto/pacer-sync.dto';
import { DocketEntry } from './entities/docket-entry.entity';

@ApiTags('Docket')
@ApiBearerAuth('JWT-auth')

@Controller('docket')
@UseInterceptors(CacheInterceptor)
export class DocketController {
  constructor(private readonly docketService: DocketService) {}

  @Get()
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
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
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async findOne(@Param('id') id: string): Promise<DocketEntry> {
    return this.docketService.findOne(id);
  }

  @Public()  // Temporarily public for import script testing
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async createDocket(@Body() createDocketEntryDto: CreateDocketEntryDto): Promise<DocketEntry> {
    return this.docketService.create(createDocketEntryDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async removeDocket(@Param('id') id: string): Promise<void> {
    return this.docketService.remove(id);
  }

  @Get('cases/:caseId/docket')
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAllByCaseId(@Param('caseId') caseId: string): Promise<DocketEntry[]> {
    return this.docketService.findAllByCaseId(caseId);
  }

  @Post('cases/:caseId/docket')
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async create(@Body() createDocketEntryDto: CreateDocketEntryDto): Promise<DocketEntry> {
    return this.docketService.create(createDocketEntryDto);
  }

  @Put(':id')
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async update(
    @Param('id') id: string,
    @Body() updateDocketEntryDto: UpdateDocketEntryDto,
  ): Promise<DocketEntry> {
    return this.docketService.update(id, updateDocketEntryDto);
  }

  @Post('pacer/sync')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async syncFromPacer(@Body() pacerSyncDto: PacerSyncDto): Promise<PacerSyncResultDto> {
    return this.docketService.syncFromPacer(pacerSyncDto);
  }
}

