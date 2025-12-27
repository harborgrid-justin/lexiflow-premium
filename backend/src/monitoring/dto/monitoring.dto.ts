import { IsString, IsEnum, IsOptional, IsBoolean, IsNumber, IsObject, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { AlertSeverity } from '@monitoring/entities/system-alert.entity';

export class GetMetricsQueryDto {
  @ApiPropertyOptional({ description: 'Metric name filter' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Start timestamp' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End timestamp' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 50 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;
}

export class RecordMetricDto {
  @ApiProperty({ description: 'Metric name' })
  @IsString()
  @IsNotEmpty()
  metricName!: string;

  @ApiProperty({ description: 'Metric value' })
  @IsNumber()
  value!: number;

  @ApiPropertyOptional({ description: 'Metric unit' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({ description: 'Tags', type: Object })
  @IsOptional()
  @IsObject()
  tags?: Record<string, unknown>;
}

export class GetAlertsQueryDto {
  @ApiPropertyOptional({ enum: AlertSeverity, description: 'Alert severity filter' })
  @IsOptional()
  @IsEnum(AlertSeverity)
  severity?: AlertSeverity;

  @ApiPropertyOptional({ description: 'Filter by resolved status' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  resolved?: boolean;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 50 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;
}

export class CreateAlertDto {
  @ApiProperty({ description: 'Alert title' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ description: 'Alert message' })
  @IsString()
  @IsNotEmpty()
  message!: string;

  @ApiProperty({ enum: AlertSeverity, description: 'Alert severity' })
  @IsEnum(AlertSeverity)
  severity!: AlertSeverity;

  @ApiProperty({ description: 'Alert source/component' })
  @IsString()
  @IsNotEmpty()
  source!: string;
}

export class AcknowledgeAlertDto {
  @ApiProperty({ description: 'User ID acknowledging the alert' })
  @IsString()
  userId!: string;
}
