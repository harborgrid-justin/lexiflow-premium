import { IsString, IsNumber, IsOptional, IsBoolean, IsEnum, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TimeEntryStatus } from '@billing/time-entries/entities/time-entry.entity';

export class CreateTimeEntryDto {
  @ApiProperty({
    description: 'Case ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsString()
  caseId!: string;

  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174001'
  })
  @IsString()
  userId!: string;

  @ApiProperty({
    description: 'Date of time entry (ISO date string YYYY-MM-DD)',
    example: '2025-12-15'
  })
  @IsString()
  date!: string; // ISO date string YYYY-MM-DD

  @ApiProperty({
    description: 'Duration in hours (0.01 to 24)',
    example: 2.5,
    minimum: 0.01,
    maximum: 24
  })
  @IsNumber()
  @Min(0.01)
  @Max(24)
  duration!: number; // in hours

  @ApiProperty({
    description: 'Description of work performed',
    example: 'Reviewed discovery documents and prepared response'
  })
  @IsString()
  description!: string;

  @ApiPropertyOptional({
    description: 'Activity type or code',
    example: 'L100 - Legal Research'
  })
  @IsOptional()
  @IsString()
  activity?: string;

  @ApiPropertyOptional({
    description: 'LEDES activity code',
    example: 'L110'
  })
  @IsOptional()
  @IsString()
  ledesCode?: string;

  @ApiProperty({
    description: 'Hourly rate for this time entry',
    example: 350.00,
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  rate!: number;

  @ApiPropertyOptional({
    description: 'Time entry status',
    enum: TimeEntryStatus,
    example: TimeEntryStatus.DRAFT
  })
  @IsOptional()
  @IsEnum(TimeEntryStatus)
  status?: TimeEntryStatus;

  @ApiPropertyOptional({
    description: 'Whether this entry is billable',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  billable?: boolean;

  @IsOptional()
  @IsString()
  rateTableId?: string;

  @IsOptional()
  @IsString()
  internalNotes?: string;

  @IsOptional()
  @IsString()
  taskCode?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discount?: number; // percentage

  @IsOptional()
  @IsString()
  phaseCode?: string;

  @IsOptional()
  @IsString()
  expenseCategory?: string;
}
