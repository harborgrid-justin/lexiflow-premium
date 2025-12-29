import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, IsArray, ValidateNested, IsObject, IsEnum, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Real-time Metrics DTOs for Analytics Dashboard
 */

export enum MetricType {
  ACTIVE_USERS = 'active_users',
  SYSTEM_LOAD = 'system_load',
  API_REQUESTS = 'api_requests',
  CASE_ACTIVITIES = 'case_activities',
  DOCUMENT_UPLOADS = 'document_uploads',
  REVENUE_TODAY = 'revenue_today',
  ERRORS = 'errors',
  PERFORMANCE = 'performance'
}

export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

/**
 * Query Real-time Metrics DTO
 */
export class GetRealtimeMetricsDto {
  @ApiPropertyOptional({
    description: 'Specific metric types to fetch',
    enum: MetricType,
    isArray: true
  })
  @IsOptional()
  @IsArray()
  @IsEnum(MetricType, { each: true })
  metricTypes?: MetricType[];

  @ApiPropertyOptional({ description: 'Refresh interval in seconds' })
  @IsOptional()
  @IsNumber()
  refreshInterval?: number;

  @ApiPropertyOptional({ description: 'Include historical data for comparison' })
  @IsOptional()
  @IsBoolean()
  includeHistory?: boolean;
}

/**
 * Real-time Metric Data Point DTO
 */
export class RealtimeMetricDataDto {
  @ApiProperty({ description: 'Metric type', enum: MetricType })
  @IsEnum(MetricType)
  type!: MetricType;

  @ApiProperty({ description: 'Current value' })
  @IsNumber()
  value!: number;

  @ApiProperty({ description: 'Previous value for comparison' })
  @IsNumber()
  previousValue!: number;

  @ApiProperty({ description: 'Change from previous value' })
  @IsNumber()
  change!: number;

  @ApiProperty({ description: 'Percentage change' })
  @IsNumber()
  changePercentage!: number;

  @ApiProperty({ description: 'Timestamp of the metric' })
  @IsString()
  timestamp!: string;

  @ApiPropertyOptional({ description: 'Unit of measurement' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({ description: 'Trend direction' })
  @IsOptional()
  @IsString()
  trend?: 'up' | 'down' | 'stable';

  @ApiPropertyOptional({ description: 'Alert if threshold exceeded', type: 'object', additionalProperties: true })
  @IsOptional()
  @IsObject()
  alert?: {
    severity: AlertSeverity;
    message: string;
    threshold: number;
  };
}

/**
 * Real-time Metrics Response DTO
 */
export class RealtimeMetricsResponseDto {
  @ApiProperty({ type: [RealtimeMetricDataDto], description: 'Real-time metric data points' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RealtimeMetricDataDto)
  metrics!: RealtimeMetricDataDto[];

  @ApiProperty({ description: 'Timestamp of the snapshot' })
  @IsString()
  timestamp!: string;

  @ApiPropertyOptional({ description: 'Next refresh timestamp' })
  @IsOptional()
  @IsString()
  nextRefresh?: string;

  @ApiPropertyOptional({ description: 'System status' })
  @IsOptional()
  @IsString()
  systemStatus?: 'healthy' | 'degraded' | 'down';

  @ApiPropertyOptional({ description: 'Active alerts count' })
  @IsOptional()
  @IsNumber()
  activeAlerts?: number;
}

/**
 * Active Users Real-time DTO
 */
export class ActiveUsersRealtimeDto {
  @ApiProperty({ description: 'Current active users count' })
  @IsNumber()
  currentActiveUsers!: number;

  @ApiProperty({ description: 'Peak active users today' })
  @IsNumber()
  peakActiveUsers!: number;

  @ApiProperty({ description: 'Active users by role', type: 'object', additionalProperties: true })
  @IsObject()
  usersByRole!: Record<string, number>;

  @ApiProperty({ description: 'Recent logins in last hour' })
  @IsNumber()
  recentLogins!: number;

  @ApiProperty({ description: 'Average session duration in minutes' })
  @IsNumber()
  avgSessionDuration!: number;

  @ApiProperty({ description: 'Timestamp' })
  @IsString()
  timestamp!: string;
}

/**
 * System Performance Real-time DTO
 */
export class SystemPerformanceRealtimeDto {
  @ApiProperty({ description: 'CPU usage percentage' })
  @IsNumber()
  cpuUsage!: number;

  @ApiProperty({ description: 'Memory usage percentage' })
  @IsNumber()
  memoryUsage!: number;

  @ApiProperty({ description: 'Database connections count' })
  @IsNumber()
  databaseConnections!: number;

  @ApiProperty({ description: 'API response time in milliseconds' })
  @IsNumber()
  avgResponseTime!: number;

  @ApiProperty({ description: 'Requests per minute' })
  @IsNumber()
  requestsPerMinute!: number;

  @ApiProperty({ description: 'Error rate percentage' })
  @IsNumber()
  errorRate!: number;

  @ApiProperty({ description: 'Timestamp' })
  @IsString()
  timestamp!: string;

  @ApiPropertyOptional({ description: 'System health status' })
  @IsOptional()
  @IsString()
  healthStatus?: 'healthy' | 'degraded' | 'critical';
}

/**
 * Case Activity Real-time DTO
 */
export class CaseActivityRealtimeDto {
  @ApiProperty({ description: 'Cases created today' })
  @IsNumber()
  casesCreatedToday!: number;

  @ApiProperty({ description: 'Cases updated in last hour' })
  @IsNumber()
  recentCaseUpdates!: number;

  @ApiProperty({ description: 'Active cases being worked on' })
  @IsNumber()
  activeCases!: number;

  @ApiProperty({ description: 'Documents uploaded today' })
  @IsNumber()
  documentsUploadedToday!: number;

  @ApiProperty({ description: 'Tasks completed today' })
  @IsNumber()
  tasksCompletedToday!: number;

  @ApiProperty({ description: 'Timestamp' })
  @IsString()
  timestamp!: string;
}

/**
 * Revenue Real-time DTO
 */
export class RevenueRealtimeDto {
  @ApiProperty({ description: 'Revenue generated today' })
  @IsNumber()
  revenueToday!: number;

  @ApiProperty({ description: 'Revenue this week' })
  @IsNumber()
  revenueThisWeek!: number;

  @ApiProperty({ description: 'Revenue this month' })
  @IsNumber()
  revenueThisMonth!: number;

  @ApiProperty({ description: 'Billable hours today' })
  @IsNumber()
  billableHoursToday!: number;

  @ApiProperty({ description: 'Invoices generated today' })
  @IsNumber()
  invoicesGeneratedToday!: number;

  @ApiProperty({ description: 'Payments received today' })
  @IsNumber()
  paymentsReceivedToday!: number;

  @ApiProperty({ description: 'Timestamp' })
  @IsString()
  timestamp!: string;

  @ApiPropertyOptional({ description: 'Comparison to yesterday' })
  @IsOptional()
  @IsNumber()
  comparisonToYesterday?: number;
}

/**
 * Alert DTO
 */
export class AlertDto {
  @ApiProperty({ description: 'Alert ID' })
  @IsString()
  id!: string;

  @ApiProperty({ description: 'Alert severity', enum: AlertSeverity })
  @IsEnum(AlertSeverity)
  severity!: AlertSeverity;

  @ApiProperty({ description: 'Alert title' })
  @IsString()
  title!: string;

  @ApiProperty({ description: 'Alert message' })
  @IsString()
  message!: string;

  @ApiProperty({ description: 'Alert type' })
  @IsString()
  type!: string;

  @ApiProperty({ description: 'Timestamp' })
  @IsString()
  timestamp!: string;

  @ApiPropertyOptional({ description: 'Related entity ID' })
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiPropertyOptional({ description: 'Action URL' })
  @IsOptional()
  @IsString()
  actionUrl?: string;

  @ApiPropertyOptional({ description: 'Acknowledged flag' })
  @IsOptional()
  @IsBoolean()
  acknowledged?: boolean;
}

/**
 * Alerts Response DTO
 */
export class AlertsResponseDto {
  @ApiProperty({ type: [AlertDto], description: 'List of alerts' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AlertDto)
  alerts!: AlertDto[];

  @ApiProperty({ description: 'Total alerts count' })
  @IsNumber()
  totalCount!: number;

  @ApiProperty({ description: 'Critical alerts count' })
  @IsNumber()
  criticalCount!: number;

  @ApiProperty({ description: 'Warning alerts count' })
  @IsNumber()
  warningCount!: number;

  @ApiProperty({ description: 'Timestamp' })
  @IsString()
  timestamp!: string;
}
