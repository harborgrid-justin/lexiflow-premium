import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { DataSourcesService } from './data-sources.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TestConnectionDto } from './dto/test-connection.dto';

@Controller('integrations/data-sources')
@UseGuards(JwtAuthGuard)
export class DataSourcesController {
  constructor(private readonly dataSourcesService: DataSourcesService) {}

  @Get()
  async listConnections() {
    return this.dataSourcesService.listConnections();
  }

  @Post('test')
  async testConnection(@Body() config: TestConnectionDto) {
    return this.dataSourcesService.testConnection(config);
  }
}
