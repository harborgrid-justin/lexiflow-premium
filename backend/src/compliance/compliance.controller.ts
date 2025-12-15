import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ComplianceService } from './compliance.service';

@Controller('compliance')
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Get()
  findAll() {
    return this.complianceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.complianceService.findOne(id);
  }

  @Post()
  create(@Body() createDto: any) {
    return this.complianceService.create(createDto);
  }
}
