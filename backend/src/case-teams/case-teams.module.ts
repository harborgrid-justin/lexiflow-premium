import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CaseTeamsController } from './case-teams.controller';
import { CaseTeamsService } from './case-teams.service';
import { CaseTeamMember } from './entities/case-team.entity';
import { WorkloadDistributionService } from './workload-distribution.service';

@Module({
  imports: [TypeOrmModule.forFeature([CaseTeamMember])],
  controllers: [CaseTeamsController],
  providers: [CaseTeamsService, WorkloadDistributionService],
  exports: [CaseTeamsService, WorkloadDistributionService],
})
export class CaseTeamsModule {}
