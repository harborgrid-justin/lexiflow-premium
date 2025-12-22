import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiResponse }from '@nestjs/swagger';
import { DataSourcesService } from './data-sources.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TestConnectionDto } from './dto/test-connection.dto';


@Controller('integrations/data-sources')
@UseGuards(JwtAuthGuard)
export class DataSourcesController {
  constructor(private readonly dataSourcesService: DataSourcesService) {}

  @Get()
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async listConnections() {
    return this.dataSourcesService.listConnections();
  }

  @Post('test')
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async testConnection(@Body() config: TestConnectionDto) {
    return this.dataSourcesService.testConnection(config);
  }
}

