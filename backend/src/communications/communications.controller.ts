import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CommunicationsService } from './communications.service';

@Controller('communications')
export class CommunicationsController {
  constructor(private readonly communicationsService: CommunicationsService) {}

  @Get()
  findAll() {
    return this.communicationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.communicationsService.findOne(id);
  }

  @Post()
  create(@Body() createDto: any) {
    return this.communicationsService.create(createDto);
  }
}
