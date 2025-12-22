import { IsString, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TimeOffType {
  VACATION = 'Vacation',
  SICK = 'Sick',
  PERSONAL = 'Personal',
  UNPAID = 'Unpaid'
}

export enum TimeOffStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  DENIED = 'Denied',
  CANCELLED = 'Cancelled'
}

export class CreateTimeOffDto {
  @ApiProperty()
  @IsString()
  employeeId!: string;

  @ApiProperty({ enum: TimeOffType })
  @IsEnum(TimeOffType)
  type!: TimeOffType;

  @ApiProperty()
  @IsDateString()
  startDate!: string;

  @ApiProperty()
  @IsDateString()
  endDate!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiProperty({ enum: TimeOffStatus, default: TimeOffStatus.PENDING })
  @IsEnum(TimeOffStatus)
  status!: TimeOffStatus;
}
