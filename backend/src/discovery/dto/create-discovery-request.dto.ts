import { IsString, IsUUID, IsEnum, IsOptional, IsDateString, IsArray, IsBoolean, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum DiscoveryType {
  INTERROGATORIES = 'interrogatories',
  REQUESTS_FOR_PRODUCTION = 'requests_for_production',
  REQUESTS_FOR_ADMISSION = 'requests_for_admission',
  DEPOSITIONS = 'depositions',
  SUBPOENAS = 'subpoenas'
}

export enum DiscoveryStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  OVERDUE = 'overdue'
}

export class CreateDiscoveryRequestDto {
  @ApiProperty({ description: 'Case ID' })
  @IsUUID()
  caseId: string;

  @ApiProperty({ description: 'Discovery type', enum: DiscoveryType })
  @IsEnum(DiscoveryType)
  type: DiscoveryType;

  @ApiProperty({ description: 'Request title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Request description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Requesting party', required: false })
  @IsOptional()
  @IsString()
  requestingParty?: string;

  @ApiProperty({ description: 'Responding party', required: false })
  @IsOptional()
  @IsString()
  respondingParty?: string;

  @ApiProperty({ description: 'Due date' })
  @IsDateString()
  dueDate: string;

  @ApiProperty({ description: 'Assigned attorney ID', required: false })
  @IsOptional()
  @IsUUID()
  attorneyId?: string;

  @ApiProperty({ 
    description: 'Request status',
    enum: DiscoveryStatus,
    default: DiscoveryStatus.PENDING
  })
  @IsOptional()
  @IsEnum(DiscoveryStatus)
  status?: DiscoveryStatus;

  @ApiProperty({ description: 'Number of items requested', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  itemCount?: number;

  @ApiProperty({ description: 'Related document IDs', required: false })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  documentIds?: string[];
}
