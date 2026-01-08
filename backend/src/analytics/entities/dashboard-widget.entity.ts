import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/base/base.entity';
import { User } from '@shared-types/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export type WidgetType =
  | 'kpi_card'
  | 'line_chart'
  | 'bar_chart'
  | 'pie_chart'
  | 'area_chart'
  | 'table'
  | 'heatmap'
  | 'gauge'
  | 'timeline'
  | 'custom';

export type WidgetSize = 'small' | 'medium' | 'large' | 'full';

export interface WidgetConfig {
  title: string;
  description?: string;
  dataSource: string;
  refreshInterval?: number; // in seconds
  filters?: Record<string, unknown>;
  chartConfig?: {
    xAxis?: string;
    yAxis?: string | string[];
    colors?: string[];
    showLegend?: boolean;
    showGrid?: boolean;
  };
  thresholds?: {
    warning?: number;
    critical?: number;
  };
}

export interface WidgetPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

@Entity('dashboard_widgets')
@Index(['userId', 'createdAt'])
@Index(['type'])
@Index(['organizationId'])
@Index(['isActive'])
export class DashboardWidget extends BaseEntity {
  @ApiProperty({ description: 'User ID who owns this widget' })
  @Column({ name: 'user_id', type: 'uuid' })
  @Index()
  userId!: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ApiProperty({ description: 'Organization ID', required: false })
  @Column({ name: 'organization_id', type: 'uuid', nullable: true })
  organizationId?: string;

  @ApiProperty({ description: 'Widget type', enum: ['kpi_card', 'line_chart', 'bar_chart', 'pie_chart', 'area_chart', 'table', 'heatmap', 'gauge', 'timeline', 'custom'] })
  @Column({
    type: 'enum',
    enum: ['kpi_card', 'line_chart', 'bar_chart', 'pie_chart', 'area_chart', 'table', 'heatmap', 'gauge', 'timeline', 'custom'],
  })
  type!: WidgetType;

  @ApiProperty({ description: 'Widget configuration' })
  @Column({ type: 'jsonb' })
  config!: WidgetConfig;

  @ApiProperty({ description: 'Widget position on dashboard' })
  @Column({ type: 'jsonb' })
  position!: WidgetPosition;

  @ApiProperty({ description: 'Widget size', enum: ['small', 'medium', 'large', 'full'] })
  @Column({
    type: 'enum',
    enum: ['small', 'medium', 'large', 'full'],
    default: 'medium',
  })
  size!: WidgetSize;

  @ApiProperty({ description: 'Dashboard ID this widget belongs to', required: false })
  @Column({ name: 'dashboard_id', type: 'uuid', nullable: true })
  dashboardId?: string;

  @ApiProperty({ description: 'Whether widget is active' })
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @ApiProperty({ description: 'Widget order/priority' })
  @Column({ type: 'int', default: 0 })
  order!: number;

  @ApiProperty({ description: 'Widget permissions', required: false })
  @Column({ type: 'jsonb', nullable: true })
  permissions?: {
    sharedWith?: string[]; // user IDs
    isPublic?: boolean;
    roles?: string[];
  };

  @ApiProperty({ description: 'Last refresh timestamp', required: false })
  @Column({ name: 'last_refresh_at', type: 'timestamp with time zone', nullable: true })
  lastRefreshAt?: Date;

  @ApiProperty({ description: 'Cached widget data', required: false })
  @Column({ type: 'jsonb', nullable: true })
  cachedData?: Record<string, unknown>;
}
