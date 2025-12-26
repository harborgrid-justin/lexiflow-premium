import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { DraftingService } from './drafting.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('drafting')
@Controller('drafting')
@UseGuards(JwtAuthGuard)
export class DraftingController {
  constructor(private readonly draftingService: DraftingService) {}

  @Public()
  @Get('recent-drafts')
  @ApiOperation({ summary: 'Get recent drafts for the current user' })
  async getRecentDrafts(
    @Request() req: RequestWithUser,
    @Query('limit') limit: number = 5,
  ) {
    // For development: use fallback user ID if not authenticated
    const userId = req.user?.id || '00000000-0000-0000-0000-000000000001';
    return this.draftingService.getRecentDrafts(userId, limit);
  }

  @Public()
  @Get('templates')
  @ApiOperation({ summary: 'Get available document templates' })
  async getTemplates(@Query('limit') limit: number = 10) {
    return this.draftingService.getTemplates(limit);
  }

  @Public()
  @Get('approvals')
  @ApiOperation({ summary: 'Get documents pending approval for the current user' })
  async getPendingApprovals(@Request() req: RequestWithUser) {
    // For development: use fallback user ID if not authenticated
    const userId = req.user?.id || '00000000-0000-0000-0000-000000000001';
    return this.draftingService.getPendingApprovals(userId);
  }

  @Public()
  @Get('stats')
  @ApiOperation({ summary: 'Get drafting dashboard statistics for the current user' })
  async getStats(@Request() req: RequestWithUser) {
    // For development: use fallback user ID if not authenticated
    const userId = req.user?.id || '00000000-0000-0000-0000-000000000001';
    return this.draftingService.getStats(userId);
  }
}
