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
import { DiscoveryRequestsService } from './discovery-requests.service';
import { CreateDiscoveryRequestDto } from './dto/create-discovery-request.dto';
import { UpdateDiscoveryRequestDto } from './dto/update-discovery-request.dto';
import { QueryDiscoveryRequestDto } from './dto/query-discovery-request.dto';

@Controller('api/v1/discovery/requests')
export class DiscoveryRequestsController {
  constructor(
    private readonly discoveryRequestsService: DiscoveryRequestsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateDiscoveryRequestDto) {
    return await this.discoveryRequestsService.create(createDto);
  }

  @Get()
  async findAll(@Query() queryDto: QueryDiscoveryRequestDto) {
    return await this.discoveryRequestsService.findAll(queryDto);
  }

  @Get('statistics/:caseId')
  async getStatistics(@Param('caseId') caseId: string) {
    return await this.discoveryRequestsService.getStatistics(caseId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.discoveryRequestsService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateDiscoveryRequestDto,
  ) {
    return await this.discoveryRequestsService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.discoveryRequestsService.remove(id);
  }
}
