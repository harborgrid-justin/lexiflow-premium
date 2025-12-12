import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
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
