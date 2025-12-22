import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  _Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiResponse }from '@nestjs/swagger';
import { ProductionService } from './production.service';
import { CreateProductionDto, UpdateProductionDto } from './dto';
import { ProductionStatus } from '../discovery/productions/entities/production.entity';


@Controller('production')
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  @Post()
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  create(@Body() createProductionDto: CreateProductionDto) {
    return this.productionService.create(createProductionDto);
  }

  @Get()
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findAll() {
    return this.productionService.findAll();
  }

  @Get('case/:caseId')
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findByCaseId(@Param('caseId') caseId: string) {
    return this.productionService.findByCaseId(caseId);
  }

  @Get('status/:status')
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findByStatus(@Param('status') status: ProductionStatus) {
    return this.productionService.findByStatus(status);
  }

  @Get(':id')
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  findOne(@Param('id') id: string) {
    return this.productionService.findOne(id);
  }

  @Patch(':id')
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  update(@Param('id') id: string, @Body() updateProductionDto: UpdateProductionDto) {
    return this.productionService.update(id, updateProductionDto);
  }

  @Patch(':id/status')
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  updateStatus(@Param('id') id: string, @Body('status') status: ProductionStatus) {
    return this.productionService.updateStatus(id, status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  remove(@Param('id') id: string) {
    return this.productionService.remove(id);
  }

  @Get('case/:caseId/statistics')
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  getStatistics(@Param('caseId') caseId: string) {
    return this.productionService.getStatistics(caseId);
  }
}

