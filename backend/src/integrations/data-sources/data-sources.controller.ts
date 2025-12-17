import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { DataSourcesService } from './data-sources.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TestConnectionDto } from './dto/test-connection.dto';

@Public() // Allow public access for development
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

