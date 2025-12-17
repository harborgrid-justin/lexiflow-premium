import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
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
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Dashboard')
@Public() // Allow public access for development
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
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
  async getMyCases(@CurrentUser() user: any): Promise<MyCasesSummaryDto> {
    return this.dashboardService.getMyCasesSummary(user.sub);
  }

  @Get('deadlines')
  @ApiOperation({ summary: 'Get upcoming deadlines' })
  @ApiResponse({
    status: 200,
    description: 'Deadlines retrieved successfully',
    type: UpcomingDeadlinesDto,
  })
  async getDeadlines(@CurrentUser() user: any): Promise<UpcomingDeadlinesDto> {
    return this.dashboardService.getUpcomingDeadlines(user.sub);
  }

  @Get('tasks')
  @ApiOperation({ summary: 'Get pending tasks' })
  @ApiResponse({
    status: 200,
    description: 'Tasks retrieved successfully',
    type: PendingTasksDto,
  })
  async getTasks(@CurrentUser() user: any): Promise<PendingTasksDto> {
    return this.dashboardService.getPendingTasks(user.sub);
  }

  @Get('billing-summary')
  @ApiOperation({ summary: 'Get billing summary' })
  @ApiResponse({
    status: 200,
    description: 'Billing summary retrieved successfully',
    type: BillingSummaryDto,
  })
  async getBillingSummary(@CurrentUser() user: any): Promise<BillingSummaryDto> {
    return this.dashboardService.getBillingSummary(user.sub);
  }
}

