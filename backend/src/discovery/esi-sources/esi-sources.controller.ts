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
import { ESISourcesService } from './esi-sources.service';
import { CreateESISourceDto } from './dto/create-esi-source.dto';
import { UpdateESISourceDto } from './dto/update-esi-source.dto';
import { QueryESISourceDto } from './dto/query-esi-source.dto';

@Controller('api/v1/discovery/esi-sources')
export class ESISourcesController {
  constructor(private readonly esiSourcesService: ESISourcesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateESISourceDto) {
    return await this.esiSourcesService.create(createDto);
  }

  @Get()
  async findAll(@Query() queryDto: QueryESISourceDto) {
    return await this.esiSourcesService.findAll(queryDto);
  }

  @Get('statistics/:caseId')
  async getStatistics(@Param('caseId') caseId: string) {
    return await this.esiSourcesService.getStatistics(caseId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.esiSourcesService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateESISourceDto,
  ) {
    return await this.esiSourcesService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.esiSourcesService.remove(id);
  }
}
