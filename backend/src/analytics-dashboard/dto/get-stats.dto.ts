import { IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetStatsDto {
  @ApiProperty({
    description: 'Start date for statistics',
    required: false
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'End date for statistics',
    required: false
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
