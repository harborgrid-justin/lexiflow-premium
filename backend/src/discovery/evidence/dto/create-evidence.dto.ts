import { IsString, IsOptional, IsEnum, IsArray, IsNumber, IsBoolean, IsUUID } from 'class-validator';
import { EvidenceType, AdmissibilityStatus, AuthenticationMethod, HearsayStatus } from '../entities/evidence.entity';

export class CreateEvidenceDto {
  @IsString()
  caseId: string;

  @IsString()
  title: string;

  @IsEnum(EvidenceType)
  @IsOptional()
  type?: EvidenceType;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  collectionDate?: string;

  @IsString()
  @IsOptional()
  collectedBy?: string;

  @IsString()
  @IsOptional()
  custodian?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsEnum(AdmissibilityStatus)
  @IsOptional()
  admissibility?: AdmissibilityStatus;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  blockchainHash?: string;

  @IsUUID()
  @IsOptional()
  trackingUuid?: string;

  @IsArray()
  @IsOptional()
  chainOfCustody?: {
    id: string;
    date: string;
    action: string;
    actor: string;
    notes?: string;
    hash?: string;
  }[];

  @IsString()
  @IsOptional()
  fileSize?: string;

  @IsString()
  @IsOptional()
  fileType?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  linkedRules?: string[];

  @IsString()
  @IsOptional()
  status?: string;

  @IsEnum(AuthenticationMethod)
  @IsOptional()
  authenticationMethod?: AuthenticationMethod;

  @IsEnum(HearsayStatus)
  @IsOptional()
  hearsayStatus?: HearsayStatus;

  @IsBoolean()
  @IsOptional()
  isOriginal?: boolean;

  @IsNumber()
  @IsOptional()
  relevanceScore?: number;

  @IsString()
  @IsOptional()
  expertId?: string;
}
