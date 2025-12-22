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
import { ApiResponse }from '@nestjs/swagger';
import { RateTablesService } from './rate-tables.service';
import { CreateRateTableDto } from './dto/create-rate-table.dto';
import { UpdateRateTableDto } from './dto/update-rate-table.dto';
import { RateTable } from './entities/rate-table.entity';


@Controller('billing/rates')
export class RateTablesController {
  constructor(private readonly rateTablesService: RateTablesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async create(@Body() createRateTableDto: CreateRateTableDto): Promise<RateTable> {
    return await this.rateTablesService.create(createRateTableDto);
  }

  @Get()
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(@Query('firmId') firmId?: string): Promise<RateTable[]> {
    return await this.rateTablesService.findAll(firmId);
  }

  @Get('active')
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findActive(@Query('firmId') firmId?: string): Promise<RateTable[]> {
    return await this.rateTablesService.findActive(firmId);
  }

  @Get('default/:firmId')
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findDefault(@Param('firmId') firmId: string): Promise<RateTable> {
    return await this.rateTablesService.findDefault(firmId);
  }

  @Get(':id')
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async findOne(@Param('id') id: string): Promise<RateTable> {
    return await this.rateTablesService.findOne(id);
  }

  @Get('user-rate/:firmId/:userId')
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getRateForUser(
    @Param('firmId') firmId: string,
    @Param('userId') userId: string,
    @Query('date') date?: string,
  ): Promise<{ rate: number; rateTableId: string }> {
    return await this.rateTablesService.getRateForUser(firmId, userId, date);
  }

  @Put(':id')
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async update(
    @Param('id') id: string,
    @Body() updateRateTableDto: UpdateRateTableDto,
  ): Promise<RateTable> {
    return await this.rateTablesService.update(id, updateRateTableDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.rateTablesService.remove(id);
  }
}

