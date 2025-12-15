import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { DiscoveryService } from './discovery.service';

@Controller('discovery')
export class DiscoveryController {
  constructor(private readonly discoveryService: DiscoveryService) {}

  @Get()
  findAll() {
    return this.discoveryService.findAllRequests();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.discoveryService.findRequestById(id);
  }

  @Post()
  create(@Body() createDto: any) {
    return this.discoveryService.createRequest(createDto);
  }
}
