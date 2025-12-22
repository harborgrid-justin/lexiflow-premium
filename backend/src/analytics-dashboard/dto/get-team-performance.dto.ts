import { IsOptional, IsDateString, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetTeamPerformanceDto {
  @ApiProperty({
    description: 'Start date for performance metrics',
    required: false
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'End date for performance metrics',
    required: false
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Filter by team/department',
    required: false
  })
  @IsOptional()
  @IsString()
  teamId?: string;

  @ApiProperty({
    description: 'Filter by specific user',
    required: false
  })
  @IsOptional()
  @IsUUID()
  userId?: string;
}
