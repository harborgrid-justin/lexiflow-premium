import { IsString, IsNumber, IsOptional, IsEnum, IsBoolean, Min } from 'class-validator';
import { FeeAgreementType, FeeAgreementStatus } from '../entities/fee-agreement.entity';

export class CreateFeeAgreementDto {
  @IsString()
  agreementNumber: string;

  @IsString()
  clientId: string;

  @IsString()
  clientName: string;

  @IsOptional()
  @IsString()
  caseId?: string;

  @IsOptional()
  @IsString()
  matterDescription?: string;

  @IsEnum(FeeAgreementType)
  agreementType: FeeAgreementType;

  @IsOptional()
  @IsEnum(FeeAgreementStatus)
  status?: FeeAgreementStatus;

  @IsString()
  effectiveDate: string;

  @IsOptional()
  @IsString()
  terminationDate?: string;

  // Hourly billing fields
  @IsOptional()
  @IsNumber()
  @Min(0)
  standardRate?: number;

  @IsOptional()
  @IsString()
  rateTableId?: string;

  // Fixed fee fields
  @IsOptional()
  @IsNumber()
  @Min(0)
  fixedFeeAmount?: number;

  @IsOptional()
  @IsString()
  paymentSchedule?: string;

  // Contingency fields
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Min(100)
  contingencyPercentage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumRecovery?: number;

  // Retainer fields
  @IsOptional()
  @IsNumber()
  @Min(0)
  retainerAmount?: number;

  @IsOptional()
  @IsBoolean()
  retainerRefundable?: boolean;

  @IsOptional()
  @IsString()
  retainerReplenishment?: string;

  // Subscription fields
  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyFee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  includedHours?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  overageRate?: number;

  // Expense handling
  @IsOptional()
  @IsBoolean()
  expensesBillable?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  expenseMarkup?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  expenseCap?: number;

  // Billing terms
  @IsOptional()
  @IsNumber()
  @Min(1)
  paymentTermsDays?: number;

  @IsOptional()
  @IsString()
  billingFrequency?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  latePaymentRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPercentage?: number;

  @IsOptional()
  @IsString()
  scopeOfWork?: string;

  @IsOptional()
  @IsString()
  terms?: string;

  @IsOptional()
  @IsString()
  specialProvisions?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  documentUrl?: string;

  @IsOptional()
  @IsString()
  responsibleAttorney?: string;
}
