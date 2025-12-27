import { IsString, IsNumber, IsOptional, IsEnum, IsBoolean, Min } from 'class-validator';
import { TrustAccountType, TrustAccountStatus } from '@billing/trust-accounts/entities/trust-account.entity';

export class CreateTrustAccountDto {
  @IsString()
  accountNumber!: string;

  @IsString()
  accountName!: string;

  @IsEnum(TrustAccountType)
  accountType!: TrustAccountType;

  @IsString()
  clientId!: string;

  @IsString()
  clientName!: string;

  @IsOptional()
  @IsString()
  caseId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  balance?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsEnum(TrustAccountStatus)
  status?: TrustAccountStatus;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  bankAccountNumber?: string;

  @IsOptional()
  @IsString()
  routingNumber?: string;

  @IsOptional()
  @IsString()
  purpose?: string;

  @IsOptional()
  @IsString()
  openedDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumBalance?: number;

  @IsOptional()
  @IsBoolean()
  interestBearing?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  responsibleAttorney?: string;

  // COMPLIANCE FIELDS
  @IsOptional()
  @IsBoolean()
  stateBarApproved?: boolean;

  @IsOptional()
  @IsString()
  jurisdiction?: string;

  @IsOptional()
  @IsString()
  ioltaProgramId?: string;

  @IsOptional()
  @IsBoolean()
  overdraftReportingEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  accountTitleCompliant?: boolean;

  @IsOptional()
  @IsBoolean()
  clientConsentForLocation?: boolean;

  @IsOptional()
  @IsString()
  lastReconciledDate?: string;

  @IsOptional()
  @IsString()
  reconciliationStatus?: string;

  @IsOptional()
  @IsString()
  nextReconciliationDue?: string;

  @IsOptional()
  @IsNumber()
  recordRetentionYears?: number;

  @IsOptional()
  @IsNumber()
  checkNumberRangeStart?: number;

  @IsOptional()
  @IsNumber()
  checkNumberRangeCurrent?: number;

  @IsOptional()
  authorizedSignatories?: string[];

  @IsOptional()
  @IsString()
  primarySignatory?: string;
}
