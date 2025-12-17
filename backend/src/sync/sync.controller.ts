import { Controller, Get, Post, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { SyncService } from './sync.service';
import { SyncStatus } from './entities/sync-queue.entity';

@ApiTags('Sync')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Public()
@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get sync status' })
  async getStatus() {
    return await this.syncService.getStatus();
  }

  @Get('queue')
  @ApiOperation({ summary: 'Get sync queue' })
  async getQueue(@Query('status') status?: SyncStatus, @Query() pagination?: any) {
    return await this.syncService.getQueue({ status, ...pagination });
  }

  @Get('conflicts')
  @ApiOperation({ summary: 'Get sync conflicts' })
  async getConflicts(@Query() query: any) {
    return await this.syncService.getConflicts(query);
  }

  @Post('conflicts/:id/resolve')
  @ApiOperation({ summary: 'Resolve sync conflict' })
  async resolveConflict(
    @Param('id') id: string,
    @Body() body: { resolution: 'local' | 'remote' | 'merge'; userId: string },
  ) {
    return await this.syncService.resolveConflict(id, body.resolution, body.userId);
  }

  @Post('retry')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retry failed sync items' })
  async retryFailed(@Body() body: { ids: string[] }) {
    return await this.syncService.retryFailed(body.ids);
  }

  @Post('clear-completed')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clear completed sync items' })
  async clearCompleted() {
    return await this.syncService.clearCompleted();
  }
}
