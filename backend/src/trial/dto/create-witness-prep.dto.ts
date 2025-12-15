import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum WitnessPrepStatus {
  SCHEDULED = 'Scheduled',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled'
}

export class CreateWitnessPrepDto {
  @ApiProperty()
  @IsString()
  witnessName: string;

  @ApiProperty()
  @IsString()
  caseId: string;

  @ApiProperty()
  @IsDateString()
  scheduledDate: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ enum: WitnessPrepStatus, default: WitnessPrepStatus.SCHEDULED })
  @IsEnum(WitnessPrepStatus)
  status: WitnessPrepStatus;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  conductedBy?: string;
}
