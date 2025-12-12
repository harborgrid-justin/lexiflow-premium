import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JudgeStatsService } from './judge-stats.service';
import {
  JudgeStatsQueryDto,
  JudgeStatsDto,
  JudgeMotionStatsDto,
  JudgeCaseDurationDto,
  JudgeListItemDto,
} from './dto/judge-stats.dto';

@ApiTags('Analytics - Judge Statistics')
@Controller('api/v1/analytics/judge-stats')
// @UseGuards(JwtAuthGuard) // Uncomment when auth is available
@ApiBearerAuth()
export class JudgeStatsController {
  constructor(private readonly judgeStatsService: JudgeStatsService) {}

  @Get()
  @ApiOperation({ summary: 'Get list of all judges with basic statistics' })
  @ApiResponse({
    status: 200,
    description: 'Judge list retrieved successfully',
    type: [JudgeListItemDto],
  })
  async getJudgeList(@Query() query: JudgeStatsQueryDto): Promise<JudgeListItemDto[]> {
    return this.judgeStatsService.getJudgeList(query);
  }

  @Get(':judgeId')
  @ApiOperation({ summary: 'Get comprehensive statistics for a specific judge' })
  @ApiParam({ name: 'judgeId', description: 'Judge ID' })
  @ApiResponse({
    status: 200,
    description: 'Judge statistics retrieved successfully',
    type: JudgeStatsDto,
  })
  async getJudgeStats(
    @Param('judgeId') judgeId: string,
    @Query() query: JudgeStatsQueryDto,
  ): Promise<JudgeStatsDto> {
    return this.judgeStatsService.getJudgeStats(judgeId, query);
  }

  @Get(':judgeId/motion-grants')
  @ApiOperation({ summary: 'Get motion grant rates for a judge' })
  @ApiParam({ name: 'judgeId', description: 'Judge ID' })
  @ApiResponse({
    status: 200,
    description: 'Judge motion statistics retrieved successfully',
    type: JudgeMotionStatsDto,
  })
  async getJudgeMotionStats(
    @Param('judgeId') judgeId: string,
    @Query() query: JudgeStatsQueryDto,
  ): Promise<JudgeMotionStatsDto> {
    return this.judgeStatsService.getJudgeMotionStats(judgeId, query);
  }

  @Get(':judgeId/case-duration')
  @ApiOperation({ summary: 'Get case duration statistics for a judge' })
  @ApiParam({ name: 'judgeId', description: 'Judge ID' })
  @ApiResponse({
    status: 200,
    description: 'Judge case duration statistics retrieved successfully',
    type: JudgeCaseDurationDto,
  })
  async getJudgeCaseDuration(
    @Param('judgeId') judgeId: string,
    @Query() query: JudgeStatsQueryDto,
  ): Promise<JudgeCaseDurationDto> {
    return this.judgeStatsService.getJudgeCaseDuration(judgeId, query);
  }
}
