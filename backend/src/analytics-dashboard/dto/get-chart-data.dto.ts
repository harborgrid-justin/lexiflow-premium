import { IsOptional, IsDateString, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ChartGranularity {
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly'
}

export class GetChartDataDto {
  @ApiProperty({
    description: 'Start date for chart data',
    required: false
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'End date for chart data',
    required: false
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Data granularity',
    enum: ChartGranularity,
    required: false
  })
  @IsOptional()
  @IsEnum(ChartGranularity)
  granularity?: ChartGranularity;

  @ApiProperty({
    description: 'Filter criteria',
    required: false
  })
  @IsOptional()
  @IsString()
  filter?: string;
}
