import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Head,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiResponse }from '@nestjs/swagger';
import { LegalHoldsService } from './legal-holds.service';
import { CreateLegalHoldDto } from './dto/create-legal-hold.dto';
import { UpdateLegalHoldDto } from './dto/update-legal-hold.dto';
import { QueryLegalHoldDto } from './dto/query-legal-hold.dto';
import { ReleaseLegalHoldDto } from './dto/release-legal-hold.dto';


@Controller('legal-holds')
export class LegalHoldsController {
  constructor(private readonly legalHoldsService: LegalHoldsService) {}

  @Head('health')
  @HttpCode(HttpStatus.OK)
  async health() {
    return { status: 'ok' };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async create(@Body() createDto: CreateLegalHoldDto) {
    return await this.legalHoldsService.create(createDto);
  }

  @Get()
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(@Query() queryDto: QueryLegalHoldDto) {
    return await this.legalHoldsService.findAll(queryDto);
  }

  @Get('statistics/:caseId')
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getStatistics(@Param('caseId') caseId: string) {
    return await this.legalHoldsService.getStatistics(caseId);
  }

  @Get('pending-reminders')
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getPendingReminders() {
    return await this.legalHoldsService.getPendingReminders();
  }

  @Get(':id')
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async findOne(@Param('id') id: string) {
    return await this.legalHoldsService.findOne(id);
  }

  @Post(':id/release')
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async release(
    @Param('id') id: string,
    @Body() releaseDto: ReleaseLegalHoldDto,
  ) {
    return await this.legalHoldsService.release(id, releaseDto);
  }

  @Put(':id')
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateLegalHoldDto,
  ) {
    return await this.legalHoldsService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async remove(@Param('id') id: string) {
    await this.legalHoldsService.remove(id);
  }
}

