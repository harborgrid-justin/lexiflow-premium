import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { ProductionService } from './production.service';
import { CreateProductionDto, UpdateProductionDto } from './dto';
import { ProductionStatus } from './entities/production.entity';

@Public() // Allow public access for development
@Controller('production')
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  @Post()
  create(@Body() createProductionDto: CreateProductionDto) {
    return this.productionService.create(createProductionDto);
  }

  @Get()
  findAll() {
    return this.productionService.findAll();
  }

  @Get('case/:caseId')
  findByCaseId(@Param('caseId') caseId: string) {
    return this.productionService.findByCaseId(caseId);
  }

  @Get('status/:status')
  findByStatus(@Param('status') status: ProductionStatus) {
    return this.productionService.findByStatus(status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productionService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductionDto: UpdateProductionDto) {
    return this.productionService.update(id, updateProductionDto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: ProductionStatus) {
    return this.productionService.updateStatus(id, status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.productionService.remove(id);
  }

  @Get('case/:caseId/statistics')
  getStatistics(@Param('caseId') caseId: string) {
    return this.productionService.getStatistics(caseId);
  }
}

