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
import { Public } from '../../common/decorators/public.decorator';
import { RateTablesService } from './rate-tables.service';
import { CreateRateTableDto } from './dto/create-rate-table.dto';
import { UpdateRateTableDto } from './dto/update-rate-table.dto';
import { RateTable } from './entities/rate-table.entity';

@Public() // Allow public access for development
@Controller('billing/rates')
export class RateTablesController {
  constructor(private readonly rateTablesService: RateTablesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createRateTableDto: CreateRateTableDto): Promise<RateTable> {
    return await this.rateTablesService.create(createRateTableDto);
  }

  @Get()
  async findAll(@Query('firmId') firmId?: string): Promise<RateTable[]> {
    return await this.rateTablesService.findAll(firmId);
  }

  @Get('active')
  async findActive(@Query('firmId') firmId?: string): Promise<RateTable[]> {
    return await this.rateTablesService.findActive(firmId);
  }

  @Get('default/:firmId')
  async findDefault(@Param('firmId') firmId: string): Promise<RateTable> {
    return await this.rateTablesService.findDefault(firmId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<RateTable> {
    return await this.rateTablesService.findOne(id);
  }

  @Get('user-rate/:firmId/:userId')
  async getRateForUser(
    @Param('firmId') firmId: string,
    @Param('userId') userId: string,
    @Query('date') date?: string,
  ): Promise<{ rate: number; rateTableId: string }> {
    return await this.rateTablesService.getRateForUser(firmId, userId, date);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateRateTableDto: UpdateRateTableDto,
  ): Promise<RateTable> {
    return await this.rateTablesService.update(id, updateRateTableDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.rateTablesService.remove(id);
  }
}

