import { Controller, Get, Post, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation  , ApiResponse }from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { SyncService } from './sync.service';
import { SyncStatus } from './entities/sync-queue.entity';

@ApiTags('Sync')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)

@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get sync status' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getStatus() {
    return await this.syncService.getStatus();
  }

  @Get('queue')
  @ApiOperation({ summary: 'Get sync queue' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getQueue(@Query('status') status?: SyncStatus, @Query() pagination?: any) {
    return await this.syncService.getQueue({ status, ...pagination });
  }

  @Get('conflicts')
  @ApiOperation({ summary: 'Get sync conflicts' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getConflicts(@Query() query: any) {
    return await this.syncService.getConflicts(query);
  }

  @Post('conflicts/:id/resolve')
  @ApiOperation({ summary: 'Resolve sync conflict' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async resolveConflict(
    @Param('id') id: string,
    @Body() body: { resolution: 'local' | 'remote' | 'merge'; userId: string },
  ) {
    return await this.syncService.resolveConflict(id, body.resolution, body.userId);
  }

  @Post('retry')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retry failed sync items' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async retryFailed(@Body() body: { ids: string[] }) {
    return await this.syncService.retryFailed(body.ids);
  }

  @Post('clear-completed')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clear completed sync items' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async clearCompleted() {
    return await this.syncService.clearCompleted();
  }
}
