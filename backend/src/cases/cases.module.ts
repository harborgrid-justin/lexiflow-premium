import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CasesController } from './cases.controller';
import { CasesService } from './cases.service';
import { CaseImportService } from './case-import.service';
import { MatterManagementService } from './matter-management.service';
import { ConflictCheckService } from './conflict-check.service';
import { DeadlineCalculatorService } from './deadline-calculator.service';
import { CaseTimelineService } from './case-timeline.service';
import { RelatedCasesService } from './related-cases.service';
import { CourtCalendarIntegrationService } from './court-calendar-integration.service';
import { Case, CaseDeadline, CaseRelationship } from './entities';
import { Matter } from '@matters/entities/matter.entity';
import { ConflictCheck } from '@compliance/conflict-checks/entities/conflict-check.entity';
import { Party } from '@parties/entities/party.entity';
import { Client } from '@clients/entities/client.entity';
import { DeadlineRule } from '@jurisdictions/entities/deadline-rule.entity';

/**
 * Cases Module
 * Core case/matter management system
 * Features:
 * - Case lifecycle management
 * - Matter management with practice area tracking
 * - Deadline calculation with jurisdiction-specific rules
 * - Conflict of interest checking
 * - Case relationship tracking and visualization
 * - Timeline and Gantt chart visualization
 * - Court calendar integration
 * - PACER data import and synchronization
 * - Case metadata and status tracking
 * - Multi-user case access and permissions
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Case,
      CaseDeadline,
      CaseRelationship,
      Matter,
      ConflictCheck,
      Party,
      Client,
      DeadlineRule,
    ]),
    ConfigModule,
  ],
  controllers: [CasesController],
  providers: [
    CasesService,
    CaseImportService,
    MatterManagementService,
    ConflictCheckService,
    DeadlineCalculatorService,
    CaseTimelineService,
    RelatedCasesService,
    CourtCalendarIntegrationService,
  ],
  exports: [
    CasesService,
    CaseImportService,
    MatterManagementService,
    ConflictCheckService,
    DeadlineCalculatorService,
    CaseTimelineService,
    RelatedCasesService,
    CourtCalendarIntegrationService,
  ],
})
export class CasesModule {}
