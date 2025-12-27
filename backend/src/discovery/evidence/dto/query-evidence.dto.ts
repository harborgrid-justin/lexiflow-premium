import { IsString, IsOptional, IsEnum } from 'class-validator';
import { EvidenceType, AdmissibilityStatus } from '@discovery/evidence/entities/evidence.entity';

export class QueryEvidenceDto {
  @IsString()
  @IsOptional()
  caseId?: string;

  @IsEnum(EvidenceType)
  @IsOptional()
  type?: EvidenceType;

  @IsEnum(AdmissibilityStatus)
  @IsOptional()
  admissibility?: AdmissibilityStatus;

  @IsString()
  @IsOptional()
  custodian?: string;

  @IsString()
  @IsOptional()
  status?: string;
}
