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
import { LegalHoldsService } from './legal-holds.service';
import { CreateLegalHoldDto } from './dto/create-legal-hold.dto';
import { UpdateLegalHoldDto } from './dto/update-legal-hold.dto';
import { QueryLegalHoldDto } from './dto/query-legal-hold.dto';
import { ReleaseLegalHoldDto } from './dto/release-legal-hold.dto';

@Controller('api/v1/discovery/legal-holds')
export class LegalHoldsController {
  constructor(private readonly legalHoldsService: LegalHoldsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateLegalHoldDto) {
    return await this.legalHoldsService.create(createDto);
  }

  @Get()
  async findAll(@Query() queryDto: QueryLegalHoldDto) {
    return await this.legalHoldsService.findAll(queryDto);
  }

  @Get('statistics/:caseId')
  async getStatistics(@Param('caseId') caseId: string) {
    return await this.legalHoldsService.getStatistics(caseId);
  }

  @Get('pending-reminders')
  async getPendingReminders() {
    return await this.legalHoldsService.getPendingReminders();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.legalHoldsService.findOne(id);
  }

  @Post(':id/release')
  async release(
    @Param('id') id: string,
    @Body() releaseDto: ReleaseLegalHoldDto,
  ) {
    return await this.legalHoldsService.release(id, releaseDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateLegalHoldDto,
  ) {
    return await this.legalHoldsService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.legalHoldsService.remove(id);
  }
}
