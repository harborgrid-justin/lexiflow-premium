import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiTags, ApiOperation , ApiResponse }from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';

@ApiTags('health')
@Controller({ version: VERSION_NEUTRAL })
export class AppController {
  constructor(private readonly appService: AppService) {}

  
  @Get()
  @ApiOperation({ summary: 'API root endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Welcome message and API information',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  getRoot() {
    return this.appService.getRoot();
  }

  
  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  getHealth() {
    return this.appService.getHealth();
  }

  
  @Get('version')
  @ApiOperation({ summary: 'Get API version' })
  @ApiResponse({ status: 200, description: 'API version information' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  getVersion() {
    return this.appService.getVersion();
  }
}
