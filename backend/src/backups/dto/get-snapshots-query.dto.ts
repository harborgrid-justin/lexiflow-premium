import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum SnapshotStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export class GetSnapshotsQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by snapshot status',
    enum: SnapshotStatus
  })
  @IsEnum(SnapshotStatus)
  @IsOptional()
  status?: SnapshotStatus;

  @ApiPropertyOptional({
    description: 'Filter by database name'
  })
  @IsString()
  @IsOptional()
  database?: string;

  @ApiPropertyOptional({
    description: 'Filter by schedule ID'
  })
  @IsString()
  @IsOptional()
  scheduleId?: string;

  @ApiPropertyOptional({
    description: 'Start date for filtering (ISO format)'
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for filtering (ISO format)'
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Number of records to return',
    example: 50
  })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({
    description: 'Number of records to skip',
    example: 0
  })
  @IsOptional()
  offset?: number;
}
