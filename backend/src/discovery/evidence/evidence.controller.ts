import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EvidenceService } from './evidence.service';
import { CreateEvidenceDto } from './dto/create-evidence.dto';
import { UpdateEvidenceDto } from './dto/update-evidence.dto';
import { QueryEvidenceDto } from './dto/query-evidence.dto';
import { Evidence } from './entities/evidence.entity';

@Controller('api/v1/discovery/evidence')
export class EvidenceController {
  constructor(private readonly evidenceService: EvidenceService) {}

  @Get()
  async findAll(@Query() query: QueryEvidenceDto): Promise<{
    data: Evidence[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const evidence = await this.evidenceService.findAll(query);
    return {
      data: evidence,
      total: evidence.length,
      page: 1,
      limit: evidence.length,
      totalPages: 1,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Evidence> {
    return this.evidenceService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createEvidenceDto: CreateEvidenceDto): Promise<Evidence> {
    return this.evidenceService.create(createEvidenceDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateEvidenceDto: UpdateEvidenceDto,
  ): Promise<Evidence> {
    return this.evidenceService.update(id, updateEvidenceDto);
  }

  @Patch(':id')
  async patch(
    @Param('id') id: string,
    @Body() updateEvidenceDto: UpdateEvidenceDto,
  ): Promise<Evidence> {
    return this.evidenceService.update(id, updateEvidenceDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.evidenceService.remove(id);
  }

  @Post(':id/chain-of-custody')
  @HttpCode(HttpStatus.OK)
  async addChainOfCustodyEvent(
    @Param('id') id: string,
    @Body() event: { action: string; actor: string; notes?: string },
  ): Promise<Evidence> {
    return this.evidenceService.addChainOfCustodyEvent(id, event);
  }
}
