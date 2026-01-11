import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ConnectorsService } from './connectors.service';
import { CreateConnectorDto, UpdateConnectorDto } from './dto/create-connector.dto';

@Controller('connectors')
export class ConnectorsController {
  constructor(private readonly connectorsService: ConnectorsService) {}

  @Post()
  create(@Body() createConnectorDto: CreateConnectorDto) {
    return this.connectorsService.create(createConnectorDto);
  }

  @Get()
  async findAll() {
    const connectors = await this.connectorsService.findAll();
    return {
      data: connectors,
      total: connectors.length,
      page: 1,
      limit: 100,
      totalPages: 1,
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.connectorsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateConnectorDto: UpdateConnectorDto) {
    return this.connectorsService.update(id, updateConnectorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.connectorsService.remove(id);
  }
}
