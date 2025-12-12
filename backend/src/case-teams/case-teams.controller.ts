import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CaseTeamsService } from './case-teams.service';
import { CreateCaseTeamDto } from './dto/create-case-team.dto';
import { UpdateCaseTeamDto } from './dto/update-case-team.dto';
import { CaseTeamMember } from './entities/case-team.entity';

@Controller('api/v1')
export class CaseTeamsController {
  constructor(private readonly caseTeamsService: CaseTeamsService) {}

  @Get('cases/:caseId/team')
  async findAllByCaseId(@Param('caseId') caseId: string): Promise<CaseTeamMember[]> {
    return this.caseTeamsService.findAllByCaseId(caseId);
  }

  @Post('cases/:caseId/team')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCaseTeamDto: CreateCaseTeamDto): Promise<CaseTeamMember> {
    return this.caseTeamsService.create(createCaseTeamDto);
  }

  @Put('case-teams/:id')
  async update(
    @Param('id') id: string,
    @Body() updateCaseTeamDto: UpdateCaseTeamDto,
  ): Promise<CaseTeamMember> {
    return this.caseTeamsService.update(id, updateCaseTeamDto);
  }

  @Delete('case-teams/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.caseTeamsService.remove(id);
  }

  @Get('case-teams/user/:userId/workload')
  async getUserWorkload(@Param('userId') userId: string) {
    return this.caseTeamsService.getUserWorkload(userId);
  }

  @Get('cases/:caseId/team/workload')
  async getCaseTeamWorkload(@Param('caseId') caseId: string) {
    return this.caseTeamsService.getCaseTeamWorkload(caseId);
  }

  @Get('case-teams/balance-report')
  async getTeamBalanceReport(@Query('userIds') userIds?: string) {
    const ids = userIds ? userIds.split(',') : undefined;
    return this.caseTeamsService.getTeamBalanceReport(ids);
  }

  @Post('case-teams/suggest-member')
  async suggestTeamMember(
    @Body() body: { role: string; excludeUserIds?: string[] },
  ) {
    return this.caseTeamsService.suggestTeamMember(body.role, body.excludeUserIds);
  }

  @Get('case-teams/workload-chart')
  async getWorkloadChartData(@Query('userIds') userIds?: string) {
    const ids = userIds ? userIds.split(',') : undefined;
    return this.caseTeamsService.getWorkloadChartData(ids);
  }

  @Get('cases/:caseId/team/by-role/:role')
  async findByRole(@Param('caseId') caseId: string, @Param('role') role: string) {
    return this.caseTeamsService.findByRole(caseId, role);
  }

  @Get('case-teams/user/:userId/cases')
  async findUserCases(@Param('userId') userId: string) {
    return this.caseTeamsService.findUserCases(userId);
  }
}
