export class ComplianceReportDto {
  reportType!: ReportType;
  generatedAt!: Date;
  generatedBy!: string;
  dateRange!: DateRange;
  data: any;
  summary!: ReportSummary;
  organizationId!: string;
}

export enum ReportType {
  ACCESS = 'ACCESS',
  ACTIVITY = 'ACTIVITY',
  CONFLICTS = 'CONFLICTS',
  ETHICAL_WALLS = 'ETHICAL_WALLS',
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface ReportSummary {
  totalRecords: number;
  metrics: Record<string, unknown>;
  highlights: string[];
}

export class GenerateAccessReportDto {
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  resource?: string;
  includeDetails?: boolean;
  organizationId!: string;
  generatedBy!: string;
}

export class AccessReportData {
  totalAccessAttempts!: number;
  successfulAccesses!: number;
  deniedAccesses!: number;
  byUser!: Record<string, number>;
  byResource!: Record<string, number>;
  byAction!: Record<string, number>;
  timeline!: TimelineEntry[];
  details?: AccessDetail[];
}

export interface TimelineEntry {
  date: string;
  count: number;
  successful: number;
  denied: number;
}

export interface AccessDetail {
  timestamp: Date;
  userId: string;
  userName: string;
  resource: string;
  action: string;
  result: 'granted' | 'denied';
  reason: string;
}

export class GenerateActivityReportDto {
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  entityType?: string;
  action?: string;
  organizationId!: string;
  generatedBy!: string;
}

export class ActivityReportData {
  totalActivities!: number;
  byAction!: Record<string, number>;
  byEntityType!: Record<string, number>;
  byUser!: Record<string, number>;
  timeline!: TimelineEntry[];
  topUsers!: UserActivity[];
  recentActivities!: unknown[];
}

export interface UserActivity {
  userId: string;
  userName: string;
  activityCount: number;
  lastActivity: Date;
}

export class GenerateConflictsReportDto {
  startDate?: Date;
  endDate?: Date;
  status?: string;
  checkType?: string;
  organizationId!: string;
  generatedBy!: string;
}

export class ConflictsReportData {
  totalChecks!: number;
  conflictsFound!: number;
  conflictsResolved!: number;
  conflictsWaived!: number;
  byCheckType!: Record<string, number>;
  byStatus!: Record<string, number>;
  timeline!: TimelineEntry[];
  criticalConflicts!: unknown[];
}

export class GenerateEthicalWallsReportDto {
  startDate?: Date;
  endDate?: Date;
  status?: string;
  userId?: string;
  organizationId!: string;
  generatedBy!: string;
}

export class EthicalWallsReportData {
  totalWalls!: number;
  activeWalls!: number;
  expiredWalls!: number;
  affectedUsers!: number;
  restrictedEntities!: number;
  byEntityType!: Record<string, number>;
  timeline!: TimelineEntry[];
  walls!: unknown[];
}
