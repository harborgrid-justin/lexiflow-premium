import { IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum PeriodType {
  DAY = '1d',
  WEEK = '7d',
  MONTH = '30d',
  QUARTER = '90d',
  YEAR = '365d',
  CUSTOM = 'custom'
}

export class GetKPIsDto {
  @ApiProperty({ 
    description: 'Time period for KPIs',
    enum: PeriodType,
    default: PeriodType.MONTH,
    required: false
  })
  @IsOptional()
  @IsEnum(PeriodType)
  period?: PeriodType;

  @ApiProperty({ 
    description: 'Start date for custom period',
    required: false
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ 
    description: 'End date for custom period',
    required: false
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
