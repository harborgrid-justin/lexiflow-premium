import { IsOptional, IsString, IsDateString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetCaseMetricsDto {
  @ApiProperty({ 
    description: 'Start date for metrics',
    required: false
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ 
    description: 'End date for metrics',
    required: false
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ 
    description: 'Filter by case type',
    required: false
  })
  @IsOptional()
  @IsString()
  caseType?: string;

  @ApiProperty({ 
    description: 'Filter by practice area',
    required: false
  })
  @IsOptional()
  @IsString()
  practiceArea?: string;

  @ApiProperty({ 
    description: 'Filter by assigned attorney',
    required: false
  })
  @IsOptional()
  @IsUUID()
  attorneyId?: string;
}
