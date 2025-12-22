import { IsString, IsNumber, IsOptional, IsEnum, IsArray, Min } from 'class-validator';
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
}
