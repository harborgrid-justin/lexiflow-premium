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
import { DepositionsService } from './depositions.service';
import { CreateDepositionDto } from './dto/create-deposition.dto';
import { UpdateDepositionDto } from './dto/update-deposition.dto';
import { QueryDepositionDto } from './dto/query-deposition.dto';

@Controller('api/v1/discovery/depositions')
export class DepositionsController {
  constructor(private readonly depositionsService: DepositionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateDepositionDto) {
    return await this.depositionsService.create(createDto);
  }

  @Get()
  async findAll(@Query() queryDto: QueryDepositionDto) {
    return await this.depositionsService.findAll(queryDto);
  }

  @Get('upcoming/:caseId')
  async getUpcoming(
    @Param('caseId') caseId: string,
    @Query('days') days?: number,
  ) {
    return await this.depositionsService.getUpcoming(caseId, days);
  }

  @Get('statistics/:caseId')
  async getStatistics(@Param('caseId') caseId: string) {
    return await this.depositionsService.getStatistics(caseId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.depositionsService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateDepositionDto,
  ) {
    return await this.depositionsService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.depositionsService.remove(id);
  }
}
