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
import { ProductionsService } from './productions.service';
import { CreateProductionDto } from './dto/create-production.dto';
import { UpdateProductionDto } from './dto/update-production.dto';
import { QueryProductionDto } from './dto/query-production.dto';

@Controller('api/v1/discovery/productions')
export class ProductionsController {
  constructor(private readonly productionsService: ProductionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateProductionDto) {
    return await this.productionsService.create(createDto);
  }

  @Get()
  async findAll(@Query() queryDto: QueryProductionDto) {
    return await this.productionsService.findAll(queryDto);
  }

  @Get('statistics/:caseId')
  async getStatistics(@Param('caseId') caseId: string) {
    return await this.productionsService.getStatistics(caseId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.productionsService.findOne(id);
  }

  @Post(':id/generate-bates')
  async generateBates(@Param('id') id: string) {
    return await this.productionsService.generateBatesNumbers(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateProductionDto,
  ) {
    return await this.productionsService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.productionsService.remove(id);
  }
}
