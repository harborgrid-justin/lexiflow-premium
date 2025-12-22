import { Controller, Get, Post, Put, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PacerService } from './pacer.service';

@ApiTags('Integrations - PACER')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('integrations/pacer')
export class PacerController {
  constructor(private readonly pacerService: PacerService) {}

  @Post('test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Test PACER connection' })
  @ApiResponse({ status: 200, description: 'Connection test successful' })
  @ApiResponse({ status: 400, description: 'Connection test failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async testConnection(@Body() credentials?: { username?: string; password?: string }) {
    return this.pacerService.testConnection(credentials);
  }

  @Get('config')
  @ApiOperation({ summary: 'Get PACER configuration' })
  @ApiResponse({ status: 200, description: 'Configuration retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getConfig(): Promise<{
    username?: string;
    password?: string;
    courtId?: string;
    autoSync?: boolean;
    syncInterval?: number;
    enabled?: boolean;
  }> {
    return this.pacerService.getConfig();
  }

  @Put('config')
  @ApiOperation({ summary: 'Update PACER configuration' })
  @ApiResponse({ status: 200, description: 'Configuration updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async updateConfig(@Body() config: {
    username?: string;
    password?: string;
    courtId?: string;
    autoSync?: boolean;
    syncInterval?: number;
  }): Promise<{
    success: boolean;
    message: string;
    config: {
      username?: string;
      password?: string;
      courtId?: string;
      autoSync?: boolean;
      syncInterval?: number;
      enabled?: boolean;
    };
  }> {
    return this.pacerService.updateConfig(config);
  }

  @Post('schedule')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Schedule PACER sync for a case' })
  @ApiResponse({ status: 200, description: 'Sync scheduled successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async scheduleSyncForCase(@Body() body: { caseId: string; caseNumber: string; court?: string }) {
    return this.pacerService.scheduleSyncForCase(body.caseId, body.caseNumber, body.court);
  }
}
