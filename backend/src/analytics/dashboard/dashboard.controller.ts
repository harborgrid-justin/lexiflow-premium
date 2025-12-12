import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import {
  DashboardQueryDto,
  DashboardDataDto,
  MyCasesSummaryDto,
  UpcomingDeadlinesDto,
  PendingTasksDto,
  BillingSummaryDto,
} from './dto/dashboard.dto';

@ApiTags('Dashboard')
@Controller('api/v1/dashboard')
// @UseGuards(JwtAuthGuard) // Uncomment when auth is available
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get complete dashboard data' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data retrieved successfully',
    type: DashboardDataDto,
  })
  async getDashboard(@Query() query: DashboardQueryDto): Promise<DashboardDataDto> {
    return this.dashboardService.getDashboardData(query);
  }

  @Get('my-cases')
  @ApiOperation({ summary: "Get user's cases summary" })
  @ApiResponse({
    status: 200,
    description: 'Cases summary retrieved successfully',
    type: MyCasesSummaryDto,
  })
  @ApiQuery({ name: 'userId', required: false, description: 'User ID (defaults to current user)' })
  async getMyCases(@Query('userId') userId?: string): Promise<MyCasesSummaryDto> {
    // In production, get userId from JWT token if not provided
    const effectiveUserId = userId || 'current-user';
    return this.dashboardService.getMyCasesSummary(effectiveUserId);
  }

  @Get('deadlines')
  @ApiOperation({ summary: 'Get upcoming deadlines' })
  @ApiResponse({
    status: 200,
    description: 'Deadlines retrieved successfully',
    type: UpcomingDeadlinesDto,
  })
  @ApiQuery({ name: 'userId', required: false, description: 'User ID (defaults to current user)' })
  async getDeadlines(@Query('userId') userId?: string): Promise<UpcomingDeadlinesDto> {
    return this.dashboardService.getUpcomingDeadlines(userId);
  }

  @Get('tasks')
  @ApiOperation({ summary: 'Get pending tasks' })
  @ApiResponse({
    status: 200,
    description: 'Tasks retrieved successfully',
    type: PendingTasksDto,
  })
  @ApiQuery({ name: 'userId', required: false, description: 'User ID (defaults to current user)' })
  async getTasks(@Query('userId') userId?: string): Promise<PendingTasksDto> {
    return this.dashboardService.getPendingTasks(userId);
  }

  @Get('billing-summary')
  @ApiOperation({ summary: 'Get billing summary' })
  @ApiResponse({
    status: 200,
    description: 'Billing summary retrieved successfully',
    type: BillingSummaryDto,
  })
  @ApiQuery({ name: 'userId', required: false, description: 'User ID (defaults to current user)' })
  async getBillingSummary(@Query('userId') userId?: string): Promise<BillingSummaryDto> {
    return this.dashboardService.getBillingSummary(userId);
  }
}
