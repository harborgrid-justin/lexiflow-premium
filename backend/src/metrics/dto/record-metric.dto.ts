import { IsString, IsNumber, IsOptional, IsObject, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum MetricType {
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram',
  SUMMARY = 'summary'
}

export class RecordMetricDto {
  @ApiProperty({ description: 'Metric name' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Metric type', enum: MetricType })
  @IsEnum(MetricType)
  type!: MetricType;

  @ApiProperty({ description: 'Metric value' })
  @IsNumber()
  value!: number;

  @ApiProperty({ description: 'Metric labels', required: false })
  @IsOptional()
  @IsObject()
  labels?: Record<string, string>;

  @ApiProperty({ description: 'Timestamp', required: false })
  @IsOptional()
  @IsDateString()
  timestamp?: string;
}
