import { PartialType } from '@nestjs/mapped-types';
import { CreateTimeEntryDto } from './create-time-entry.dto';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { TimeEntryStatus } from '@billing/time-entries/entities/time-entry.entity';

export class UpdateTimeEntryDto extends PartialType(CreateTimeEntryDto) {
  @IsOptional()
  @IsEnum(TimeEntryStatus)
  status?: TimeEntryStatus;

  @IsOptional()
  @IsString()
  invoiceId?: string;

  @IsOptional()
  @IsString()
  approvedBy?: string;

  @IsOptional()
  @IsString()
  billedBy?: string;
}
