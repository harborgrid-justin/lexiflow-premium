import { IsString, IsNumber, IsOptional, IsEnum, IsArray, Min, IsBoolean } from 'class-validator';
import { TransactionType } from '../entities/trust-transaction.entity';

export class CreateTransactionDto {
  @IsEnum(TransactionType)
  transactionType!: TransactionType;

  @IsString()
  transactionDate!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsString()
  description!: string;

  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @IsOptional()
  @IsString()
  checkNumber?: string;

  @IsOptional()
  @IsString()
  payee?: string;

  @IsOptional()
  @IsString()
  payor?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  relatedInvoiceId?: string;

  @IsOptional()
  @IsString()
  relatedCaseId?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  attachments?: string[];

  // COMPLIANCE FIELDS
  @IsOptional()
  @IsString()
  fundsReceivedDate?: string;

  @IsOptional()
  @IsBoolean()
  isAdvancedFee?: boolean;

  @IsOptional()
  @IsBoolean()
  isEarnedFee?: boolean;

  @IsOptional()
  @IsString()
  transactionSource?: string;

  @IsOptional()
  @IsBoolean()
  isOperatingFundTransfer?: boolean;

  @IsOptional()
  @IsBoolean()
  checkVoided?: boolean;

  @IsOptional()
  @IsBoolean()
  clientNotified?: boolean;

  @IsOptional()
  @IsNumber()
  disputedAmount?: number;

  @IsOptional()
  @IsString()
  disputeReason?: string;
}

export class DepositDto {
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsString()
  transactionDate!: string;

  @IsString()
  description!: string;

  @IsOptional()
  @IsString()
  payor?: string;

  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  // COMPLIANCE FIELDS
  @IsOptional()
  @IsString()
  fundsReceivedDate?: string;

  @IsOptional()
  @IsBoolean()
  isAdvancedFee?: boolean;
}

export class WithdrawalDto {
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsString()
  transactionDate!: string;

  @IsString()
  description!: string;

  @IsOptional()
  @IsString()
  payee?: string;

  @IsOptional()
  @IsString()
  checkNumber?: string;

  @IsOptional()
  @IsString()
  relatedInvoiceId?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  // COMPLIANCE FIELDS
  @IsOptional()
  @IsBoolean()
  isEarnedFee?: boolean;

  @IsOptional()
  @IsBoolean()
  isOperatingFundTransfer?: boolean;

  @IsOptional()
  @IsString()
  paymentMethod?: string;
}
