import { IsString, IsUUID, IsNotEmpty, IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class PacerSyncDto {
  @IsUUID()
  @IsNotEmpty()
  caseId: string;

  @IsString()
  @IsNotEmpty()
  pacerCaseNumber: string;

  @IsString()
  @IsOptional()
  court?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate?: Date;
}

export class PacerSyncResultDto {
  success: boolean;
  entriesAdded: number;
  entriesUpdated: number;
  lastSyncDate: Date;
  errors?: string[];
}
