import { IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PacerSearchDto {
  @ApiProperty({ description: 'Case number to search for', required: false })
  @IsOptional()
  @IsString()
  caseNumber?: string;

  @ApiProperty({ description: 'Party name to search for', required: false })
  @IsOptional()
  @IsString()
  partyName?: string;

  @ApiProperty({ description: 'Court to search in', required: false })
  @IsOptional()
  @IsString()
  court?: string;

  @ApiProperty({ description: 'Filing date from', required: false })
  @IsOptional()
  @IsDateString()
  filingDateFrom?: string;

  @ApiProperty({ description: 'Filing date to', required: false })
  @IsOptional()
  @IsDateString()
  filingDateTo?: string;

  @ApiProperty({ description: 'Nature of suit', required: false })
  @IsOptional()
  @IsString()
  natureOfSuit?: string;
}

export class PacerIntegrationSyncDto {
  @ApiProperty({ description: 'Case number to sync from PACER' })
  @IsString()
  caseNumber!: string;

  @ApiProperty({ description: 'Court identifier' })
  @IsString()
  court!: string;
}

export interface PacerCase {
  caseNumber: string;
  title: string;
  court: string;
  filingDate: Date;
  caseType: string;
  nature: string;
  parties: PacerParty[];
  docketEntries: PacerDocketEntry[];
}

export interface PacerParty {
  name: string;
  type: string;
  role: string;
}

export interface PacerDocketEntry {
  entryNumber: string;
  filedDate: Date;
  description: string;
  filedBy: string;
  documentUrl?: string;
}
