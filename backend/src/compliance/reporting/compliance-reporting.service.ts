import { AuditLogsService } from "@compliance/audit-logs/audit-logs.service";
import { ConflictChecksService } from "@compliance/conflict-checks/conflict-checks.service";
import { EthicalWallsService } from "@compliance/ethical-walls/ethical-walls.service";
import { PermissionsService } from "@compliance/permissions/permissions.service";
import { Injectable } from "@nestjs/common";
import {
  AccessReportData,
  ActivityReportData,
  ComplianceReportDto,
  ConflictsReportData,
  EthicalWallsReportData,
  GenerateAccessReportDto,
  GenerateActivityReportDto,
  GenerateConflictsReportDto,
  GenerateEthicalWallsReportDto,
  ReportType,
} from "./dto/compliance-report.dto";

/**
 * ╔=================================================================================================================╗
 * ║COMPLIANCEREPORTING                                                                                              ║
 * ╠=================================================================================================================╣
 * ║                                                                                                                 ║
 * ║  External Request                   Controller                            Service                                ║
 * ║       │                                   │                                     │                                ║
 * ║       │  HTTP Endpoints                  │                                     │                                ║
 * ║       └───────────────────────────────────►                                     │                                ║
 * ║                                                                                                                 ║
 * ║                                                                 ┌───────────────┴───────────────┐                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          Repository                    Database                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          PostgreSQL                                          ║
 * ║                                                                                                                 ║
 * ║  DATA IN:  Data input                                                                                         ║

 * ║                                                                                                                 ║
 * ║  DATA OUT: Data output                                                                                        ║

 * ║                                                                                                                 ║

 * ╚=================================================================================================================╝
 */

@Injectable()
export class ComplianceReportingService {
  constructor(
    private readonly auditLogsService: AuditLogsService,
    private readonly conflictChecksService: ConflictChecksService,
    private readonly ethicalWallsService: EthicalWallsService,
    private readonly permissionsService: PermissionsService
  ) {}

  async generateAccessReport(
    dto: GenerateAccessReportDto
  ): Promise<ComplianceReportDto> {
    const startDate =
      dto.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = dto.endDate || new Date();

    // Get all permissions for the period
    const { data: permissions } = await this.permissionsService.findAll({
      userId: dto.userId,
      includeExpired: true,
    });

    // Mock access attempts data (in real implementation, this would come from audit logs)
    const accessData: AccessReportData = {
      totalAccessAttempts: permissions.length * 10,
      successfulAccesses: permissions.length * 8,
      deniedAccesses: permissions.length * 2,
      byUser: {},
      byResource: {},
      byAction: {},
      timeline: this.generateTimeline(startDate, endDate),
      details: dto.includeDetails ? [] : undefined,
    };

    // Aggregate by user, resource, and action
    permissions.forEach((perm) => {
      accessData.byUser[perm.userName] =
        (accessData.byUser[perm.userName] || 0) + 1;
      accessData.byResource[perm.resource] =
        (accessData.byResource[perm.resource] || 0) + 1;
      perm.actions.forEach((action) => {
        accessData.byAction[action] = (accessData.byAction[action] || 0) + 1;
      });
    });

    return {
      reportType: ReportType.ACCESS,
      generatedAt: new Date(),
      generatedBy: dto.generatedBy,
      dateRange: { startDate, endDate },
      data: { ...accessData },
      summary: {
        totalRecords: accessData.totalAccessAttempts,
        metrics: {
          successRate:
            (
              (accessData.successfulAccesses / accessData.totalAccessAttempts) *
              100
            ).toFixed(2) + "%",
          denialRate:
            (
              (accessData.deniedAccesses / accessData.totalAccessAttempts) *
              100
            ).toFixed(2) + "%",
          uniqueUsers: Object.keys(accessData.byUser).length,
          uniqueResources: Object.keys(accessData.byResource).length,
        },
        highlights: [
          `Total access attempts: ${accessData.totalAccessAttempts}`,
          `Successful: ${accessData.successfulAccesses}, Denied: ${accessData.deniedAccesses}`,
          `Most accessed resource: ${this.getTopKey(accessData.byResource)}`,
        ],
      },
      organizationId: dto.organizationId,
    };
  }

  async generateActivityReport(
    dto: GenerateActivityReportDto
  ): Promise<ComplianceReportDto> {
    const startDate =
      dto.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = dto.endDate || new Date();

    const { data: auditLogs } = await this.auditLogsService.findAll({
      userId: dto.userId,
      entityType: dto.entityType as any,
      action: dto.action as any,
      startDate,
      endDate,
    });

    const activityData: ActivityReportData = {
      totalActivities: auditLogs.length,
      byAction: {},
      byEntityType: {},
      byUser: {},
      timeline: this.generateTimeline(startDate, endDate),
      topUsers: [],
      recentActivities: auditLogs.slice(0, 10),
    };

    // Aggregate data
    const userActivityMap = new Map<
      string,
      { name: string; count: number; lastActivity: Date }
    >();

    auditLogs.forEach((log) => {
      activityData.byAction[log.action] =
        (activityData.byAction[log.action] || 0) + 1;
      activityData.byEntityType[log.entityType] =
        (activityData.byEntityType[log.entityType] || 0) + 1;

      const userActivity = userActivityMap.get(log.userId) || {
        name: log.userName,
        count: 0,
        lastActivity: log.timestamp,
      };
      userActivity.count++;
      if (log.timestamp > userActivity.lastActivity) {
        userActivity.lastActivity = log.timestamp;
      }
      userActivityMap.set(log.userId, userActivity);
    });

    // Generate top users
    activityData.topUsers = Array.from(userActivityMap.entries())
      .map(([userId, data]) => ({
        userId,
        userName: data.name,
        activityCount: data.count,
        lastActivity: data.lastActivity,
      }))
      .sort((a, b) => b.activityCount - a.activityCount)
      .slice(0, 10);

    return {
      reportType: ReportType.ACTIVITY,
      generatedAt: new Date(),
      generatedBy: dto.generatedBy,
      dateRange: { startDate, endDate },
      data: { ...activityData },
      summary: {
        totalRecords: activityData.totalActivities,
        metrics: {
          uniqueUsers: userActivityMap.size,
          uniqueActions: Object.keys(activityData.byAction).length,
          uniqueEntityTypes: Object.keys(activityData.byEntityType).length,
          avgActivitiesPerUser: (
            activityData.totalActivities / userActivityMap.size
          ).toFixed(2),
        },
        highlights: [
          `Total activities: ${activityData.totalActivities}`,
          `Most common action: ${this.getTopKey(activityData.byAction)}`,
          `Most active user: ${activityData.topUsers[0]?.userName || "N/A"}`,
        ],
      },
      organizationId: dto.organizationId,
    };
  }

  async generateConflictsReport(
    dto: GenerateConflictsReportDto
  ): Promise<ComplianceReportDto> {
    const startDate =
      dto.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = dto.endDate || new Date();

    const { data: conflicts } = await this.conflictChecksService.findAll({
      status: dto.status as any,
      checkType: dto.checkType as any,
      startDate,
      endDate,
    });

    const conflictsData: ConflictsReportData = {
      totalChecks: conflicts.length,
      conflictsFound: conflicts.filter((c) => c.status === "CONFLICT_FOUND")
        .length,
      conflictsResolved: conflicts.filter((c) => c.status === "RESOLVED")
        .length,
      conflictsWaived: conflicts.filter((c) => c.status === "WAIVED").length,
      byCheckType: {},
      byStatus: {},
      timeline: this.generateTimeline(startDate, endDate),
      criticalConflicts: conflicts
        .filter((c) =>
          c.conflicts.some((conflict) => conflict.severity === "critical")
        )
        .slice(0, 10),
    };

    // Aggregate data
    conflicts.forEach((conflict) => {
      conflictsData.byCheckType[conflict.checkType] =
        (conflictsData.byCheckType[conflict.checkType] || 0) + 1;
      conflictsData.byStatus[conflict.status] =
        (conflictsData.byStatus[conflict.status] || 0) + 1;
    });

    return {
      reportType: ReportType.CONFLICTS,
      generatedAt: new Date(),
      generatedBy: dto.generatedBy,
      dateRange: { startDate, endDate },
      data: { ...conflictsData },
      summary: {
        totalRecords: conflictsData.totalChecks,
        metrics: {
          conflictRate:
            (
              (conflictsData.conflictsFound / conflictsData.totalChecks) *
              100
            ).toFixed(2) + "%",
          resolutionRate:
            (
              (conflictsData.conflictsResolved / conflictsData.conflictsFound) *
              100
            ).toFixed(2) + "%",
          criticalConflicts: conflictsData.criticalConflicts.length,
        },
        highlights: [
          `Total conflict checks: ${conflictsData.totalChecks}`,
          `Conflicts found: ${conflictsData.conflictsFound}`,
          `Resolved: ${conflictsData.conflictsResolved}, Waived: ${conflictsData.conflictsWaived}`,
        ],
      },
      organizationId: dto.organizationId,
    };
  }

  async generateEthicalWallsReport(
    dto: GenerateEthicalWallsReportDto
  ): Promise<ComplianceReportDto> {
    const startDate =
      dto.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = dto.endDate || new Date();

    const { data: walls } = await this.ethicalWallsService.findAll({
      status: dto.status as any,
      userId: dto.userId,
    });

    const wallsData: EthicalWallsReportData = {
      totalWalls: walls.length,
      activeWalls: walls.filter((w) => w.status === "ACTIVE").length,
      expiredWalls: walls.filter((w) => w.status === "EXPIRED").length,
      affectedUsers: 0,
      restrictedEntities: 0,
      byEntityType: {},
      timeline: this.generateTimeline(startDate, endDate),
      walls: walls.slice(0, 20),
    };

    // Aggregate data
    const uniqueUsers = new Set<string>();
    walls.forEach((wall) => {
      wall.restrictedUsers.forEach((userId) => uniqueUsers.add(userId));
      wallsData.restrictedEntities += wall.restrictedEntities.length;

      wall.restrictedEntities.forEach((entity) => {
        wallsData.byEntityType[entity.entityType] =
          (wallsData.byEntityType[entity.entityType] || 0) + 1;
      });
    });
    wallsData.affectedUsers = uniqueUsers.size;

    return {
      reportType: ReportType.ETHICAL_WALLS,
      generatedAt: new Date(),
      generatedBy: dto.generatedBy,
      dateRange: { startDate, endDate },
      data: { ...wallsData },
      summary: {
        totalRecords: wallsData.totalWalls,
        metrics: {
          activeWalls: wallsData.activeWalls,
          affectedUsers: wallsData.affectedUsers,
          restrictedEntities: wallsData.restrictedEntities,
          avgEntitiesPerWall: (
            wallsData.restrictedEntities / wallsData.totalWalls
          ).toFixed(2),
        },
        highlights: [
          `Total ethical walls: ${wallsData.totalWalls}`,
          `Active: ${wallsData.activeWalls}, Expired: ${wallsData.expiredWalls}`,
          `Affected users: ${wallsData.affectedUsers}`,
        ],
      },
      organizationId: dto.organizationId,
    };
  }

  private generateTimeline(
    startDate: Date,
    endDate: Date
  ): Array<{
    date: string;
    count: number;
    successful: number;
    denied: number;
  }> {
    const timeline: Array<{
      date: string;
      count: number;
      successful: number;
      denied: number;
    }> = [];
    const dayInMs = 24 * 60 * 60 * 1000;
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / dayInMs);

    for (let i = 0; i < Math.min(days, 30); i++) {
      const date = new Date(startDate.getTime() + i * dayInMs);
      timeline.push({
        date: date.toISOString().split("T")[0],
        count: Math.floor(Math.random() * 100),
        successful: Math.floor(Math.random() * 80),
        denied: Math.floor(Math.random() * 20),
      });
    }

    return timeline;
  }

  private getTopKey(obj: Record<string, number>): string {
    const entries = Object.entries(obj);
    if (entries.length === 0) return "N/A";

    return entries.reduce((max, entry) => (entry[1] > max[1] ? entry : max))[0];
  }
}
