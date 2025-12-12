import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CaseTeamsController } from './case-teams.controller';
import { CaseTeamsService } from './case-teams.service';
import { CaseTeamMember } from './entities/case-team.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CaseTeamMember])],
  controllers: [CaseTeamsController],
  providers: [CaseTeamsService],
  exports: [CaseTeamsService],
})
export class CaseTeamsModule {}
