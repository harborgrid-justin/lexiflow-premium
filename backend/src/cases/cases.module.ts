import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CasesController } from './cases.controller';
import { CasesService } from './cases.service';
import { Case } from './entities/case.entity';
import { CaseTimelineEvent } from './entities/case-timeline.entity';
import { CaseWorkflowService } from './case-workflow.service';
import { CaseTimelineService } from './case-timeline.service';
import { CaseLifecycleService } from './case-lifecycle.service';
import { CaseAssignmentService } from './case-assignment.service';
import { CaseCollaborationService } from './case-collaboration.service';

@Module({
  imports: [TypeOrmModule.forFeature([Case, CaseTimelineEvent])],
  controllers: [CasesController],
  providers: [
    CasesService,
    CaseWorkflowService,
    CaseTimelineService,
    CaseLifecycleService,
    CaseAssignmentService,
    CaseCollaborationService,
  ],
  exports: [
    CasesService,
    CaseWorkflowService,
    CaseTimelineService,
    CaseLifecycleService,
    CaseAssignmentService,
    CaseCollaborationService,
  ],
})
export class CasesModule {}
