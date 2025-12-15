import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { ComplianceCheck } from './entities/compliance-check.entity';
import { AuditLog } from './entities/audit-log.entity';
import { ComplianceRule } from './entities/compliance-rule.entity';

// Main service
import { ComplianceService } from './compliance.service';

// Audit Logs
import { AuditLogsController } from './audit-logs/audit-logs.controller';
import { AuditLogsService } from './audit-logs/audit-logs.service';
import { AuditLogInterceptor } from './audit-logs/audit-log.interceptor';

// Conflict Checks
import { ConflictChecksController } from './conflict-checks/conflict-checks.controller';
import { ConflictChecksService } from './conflict-checks/conflict-checks.service';

// Ethical Walls
import { EthicalWallsController } from './ethical-walls/ethical-walls.controller';
import { EthicalWallsService } from './ethical-walls/ethical-walls.service';
import { EthicalWallGuard } from './ethical-walls/ethical-wall.guard';

// RLS Policies
import { RlsPoliciesController } from './rls-policies/rls-policies.controller';
import { RlsPoliciesService } from './rls-policies/rls-policies.service';

// Permissions
import { PermissionsController } from './permissions/permissions.controller';
import { PermissionsService } from './permissions/permissions.service';

// Compliance Reporting
import { ComplianceReportingController } from './reporting/compliance-reporting.controller';
import { ComplianceReportingService } from './reporting/compliance-reporting.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ComplianceCheck, AuditLog, ComplianceRule]),
  ],
  controllers: [
    AuditLogsController,
    ConflictChecksController,
    EthicalWallsController,
    RlsPoliciesController,
    PermissionsController,
    ComplianceReportingController,
  ],
  providers: [
    // Main Service
    ComplianceService,
    
    // Services
    AuditLogsService,
    ConflictChecksService,
    EthicalWallsService,
    RlsPoliciesService,
    PermissionsService,
    ComplianceReportingService,

    // Guards and Interceptors
    AuditLogInterceptor,
    EthicalWallGuard,
  ],
  exports: [
    // Export main service
    ComplianceService,
    
    // Export services so they can be used in other modules
    AuditLogsService,
    ConflictChecksService,
    EthicalWallsService,
    RlsPoliciesService,
    PermissionsService,
    ComplianceReportingService,

    // Export guards and interceptors
    AuditLogInterceptor,
    EthicalWallGuard,
  ],
})
export class ComplianceModule {}
