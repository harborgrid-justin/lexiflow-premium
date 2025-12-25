import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { DraftingService } from './drafting.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';

@ApiTags('drafting')
@Controller('drafting')
@UseGuards(JwtAuthGuard)
export class DraftingController {
  constructor(private readonly draftingService: DraftingService) {}

  @Get('recent-drafts')
  @ApiOperation({ summary: 'Get recent drafts for the current user' })
  async getRecentDrafts(
    @Request() req: RequestWithUser,
    @Query('limit') limit: number,
  ) {
    return this.draftingService.getRecentDrafts(req.user.id, limit);
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get available document templates' })
  async getTemplates(@Query('limit') limit: number) {
    return this.draftingService.getTemplates(limit);
  }

  @Get('approvals')
  @ApiOperation({ summary: 'Get documents pending approval for the current user' })
  async getPendingApprovals(@Request() req: RequestWithUser) {
    return this.draftingService.getPendingApprovals(req.user.id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get drafting dashboard statistics for the current user' })
  async getStats(@Request() req: RequestWithUser) {
    return this.draftingService.getStats(req.user.id);
  }
}
