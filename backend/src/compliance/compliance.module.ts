import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

/**
 * Compliance Module
 * Legal compliance, audit trails, and conflict checking
 * 
 * Features:
 * - Automated compliance rule enforcement
 * - Comprehensive audit logging with interceptors
 * - Conflict of interest checks
 * - Ethics rule validation
 * - Regulatory compliance tracking
 * 
 * Sub-modules:
 * - AuditLogs: Complete audit trail for all system actions
 * - ConflictChecks: Automated conflict detection for parties/attorneys
 * - ComplianceRules: Configurable compliance rule engine
 */

// Entities
import { ComplianceCheck } from './entities/compliance-check.entity';
import { AuditLog } from './entities/audit-log.entity';
import { ComplianceRule } from './entities/compliance-rule.entity';
import { Consent } from './entities/consent.entity';
import { DataRetentionPolicy, DataRetentionRecord } from './entities/dataRetention.entity';

// Main controller & service
import { ComplianceController } from './compliance.controller';
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

// Enterprise Compliance Services
import { GdprComplianceService } from './services/gdprCompliance.service';
import { AuditTrailService } from './services/auditTrail.service';
import { DataRetentionService } from './services/dataRetention.service';
import { DataClassificationService } from './services/dataClassification.service';

// User Entity (needed for GDPR service)
import { User } from '@users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ComplianceCheck,
      AuditLog,
      ComplianceRule,
      Consent,
      DataRetentionPolicy,
      DataRetentionRecord,
      User,
    ]),
  ],
  controllers: [
    ComplianceController,
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

    // Enterprise Compliance Services
    GdprComplianceService,
    AuditTrailService,
    DataRetentionService,
    DataClassificationService,

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

    // Export enterprise compliance services
    GdprComplianceService,
    AuditTrailService,
    DataRetentionService,
    DataClassificationService,

    // Export guards and interceptors
    AuditLogInterceptor,
    EthicalWallGuard,
  ],
})
export class ComplianceModule {}
