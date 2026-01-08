import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/base/base.entity';
import { User } from '@shared-types/entities/user.entity';
import { ReportTemplate } from './report-template.entity';
import { ApiProperty } from '@nestjs/swagger';

export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface ExecutionMetadata {
  startTime?: Date;
  endTime?: Date;
  duration?: number; // milliseconds
  rowCount?: number;
  fileSize?: number; // bytes
  error?: string;
  warnings?: string[];
  dataRange?: {
    startDate: string;
    endDate: string;
  };
}

@Entity('report_executions')
@Index(['templateId', 'generatedAt'])
@Index(['status', 'generatedAt'])
@Index(['executedBy', 'generatedAt'])
@Index(['organizationId', 'generatedAt'])
@Index(['generatedAt'])
export class ReportExecution extends BaseEntity {
  @ApiProperty({ description: 'Report template ID' })
  @Column({ name: 'template_id', type: 'uuid' })
  @Index()
  templateId!: string;

  @ManyToOne(() => ReportTemplate, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'template_id' })
  template!: ReportTemplate;

  @ApiProperty({ description: 'Execution status', enum: ['pending', 'running', 'completed', 'failed', 'cancelled'] })
  @Column({
    type: 'enum',
    enum: ['pending', 'running', 'completed', 'failed', 'cancelled'],
    default: 'pending',
  })
  status!: ExecutionStatus;

  @ApiProperty({ description: 'Generated timestamp' })
  @Column({ name: 'generated_at', type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  generatedAt!: Date;

  @ApiProperty({ description: 'File path to generated report', required: false })
  @Column({ name: 'file_path', type: 'varchar', length: 1024, nullable: true })
  filePath?: string;

  @ApiProperty({ description: 'File URL for download', required: false })
  @Column({ name: 'file_url', type: 'varchar', length: 1024, nullable: true })
  fileUrl?: string;

  @ApiProperty({ description: 'Report format' })
  @Column({ type: 'varchar', length: 50 })
  format!: string;

  @ApiProperty({ description: 'User who executed this report' })
  @Column({ name: 'executed_by', type: 'uuid' })
  executedBy!: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'executed_by' })
  executor!: User;

  @ApiProperty({ description: 'Organization ID', required: false })
  @Column({ name: 'organization_id', type: 'uuid', nullable: true })
  organizationId?: string;

  @ApiProperty({ description: 'Execution parameters used', required: false })
  @Column({ type: 'jsonb', nullable: true })
  parameters?: Record<string, unknown>;

  @ApiProperty({ description: 'Execution metadata' })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: ExecutionMetadata;

  @ApiProperty({ description: 'File size in bytes', required: false })
  @Column({ name: 'file_size', type: 'bigint', nullable: true })
  fileSize?: number;

  @ApiProperty({ description: 'Number of records in report', required: false })
  @Column({ name: 'record_count', type: 'int', nullable: true })
  recordCount?: number;

  @ApiProperty({ description: 'Execution duration in milliseconds', required: false })
  @Column({ name: 'duration_ms', type: 'int', nullable: true })
  durationMs?: number;

  @ApiProperty({ description: 'Error message if execution failed', required: false })
  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage?: string;

  @ApiProperty({ description: 'Stack trace if execution failed', required: false })
  @Column({ name: 'error_stack', type: 'text', nullable: true })
  errorStack?: string;

  @ApiProperty({ description: 'Whether this was a scheduled execution' })
  @Column({ name: 'is_scheduled', type: 'boolean', default: false })
  isScheduled!: boolean;

  @ApiProperty({ description: 'Report expiration date', required: false })
  @Column({ name: 'expires_at', type: 'timestamp with time zone', nullable: true })
  expiresAt?: Date;

  @ApiProperty({ description: 'Number of times report was downloaded' })
  @Column({ name: 'download_count', type: 'int', default: 0 })
  downloadCount!: number;

  @ApiProperty({ description: 'Last download timestamp', required: false })
  @Column({ name: 'last_downloaded_at', type: 'timestamp with time zone', nullable: true })
  lastDownloadedAt?: Date;
}
