import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TimeEntry } from "../billing/time-entries/entities/time-entry.entity";
import { CaseTeamMember } from "../case-teams/entities/case-team.entity";
import { User } from "../users/entities/user.entity";
import { Employee } from "./entities/employee.entity";
import { TimeOffRequest } from "./entities/time-off-request.entity";
import { HRController } from "./hr.controller";
import { HRService } from "./hr.service";

/**
 * HR Module
 * Human resources management for law firms
 * Features:
 * - Employee profiles and directory
 * - Time-off request management
 * - Timesheet and attendance tracking
 * - Performance reviews and evaluations
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Employee,
      TimeOffRequest,
      CaseTeamMember,
      TimeEntry,
      User,
    ]),
  ],
  controllers: [HRController],
  providers: [HRService],
  exports: [HRService],
})
export class HRModule {}
