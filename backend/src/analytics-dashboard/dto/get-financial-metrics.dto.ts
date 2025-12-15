import { IsOptional, IsDateString, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum GroupByType {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year'
}

export class GetFinancialMetricsDto {
  @ApiProperty({ 
    description: 'Start date for financial metrics',
    required: false
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ 
    description: 'End date for financial metrics',
    required: false
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ 
    description: 'Filter by practice area',
    required: false
  })
  @IsOptional()
  @IsString()
  practiceArea?: string;

  @ApiProperty({ 
    description: 'Group results by time period',
    enum: GroupByType,
    required: false
  })
  @IsOptional()
  @IsEnum(GroupByType)
  groupBy?: GroupByType;
}
