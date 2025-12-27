import { IsString, IsNumber, IsOptional, IsEnum, IsArray, IsBoolean, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { InvoiceStatus, BillingModel } from '@billing/invoices/entities/invoice.entity';
import { InvoiceItemType } from '@billing/invoices/entities/invoice-item.entity';

export class CreateInvoiceItemDto {
  @IsEnum(InvoiceItemType)
  type!: InvoiceItemType;

  @IsOptional()
  @IsString()
  date?: string;

  @IsString()
  description!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  rate?: number;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsOptional()
  @IsString()
  timeEntryId?: string;

  @IsOptional()
  @IsString()
  expenseId?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  userName?: string;

  @IsOptional()
  @IsString()
  activity?: string;

  @IsOptional()
  @IsString()
  ledesCode?: string;

  @IsOptional()
  @IsString()
  phaseCode?: string;

  @IsOptional()
  @IsString()
  taskCode?: string;
}

export class CreateInvoiceDto {
  @IsString()
  invoiceNumber!: string;

  @IsString()
  caseId!: string;

  @IsString()
  clientId!: string;

  @IsString()
  clientName!: string;

  @IsString()
  matterDescription!: string;

  @IsString()
  invoiceDate!: string;

  @IsString()
  dueDate!: string;

  @IsOptional()
  @IsString()
  periodStart?: string;

  @IsOptional()
  @IsString()
  periodEnd?: string;

  @IsEnum(BillingModel)
  billingModel!: BillingModel;

  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @IsNumber()
  @Min(0)
  subtotal!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  taxRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  terms?: string;

  @IsOptional()
  @IsString()
  billingAddress?: string;

  @IsOptional()
  @IsString()
  jurisdiction?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  feeAgreementId?: string;

  @IsOptional()
  @IsString()
  internalNotes?: string;

  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @IsOptional()
  @IsArray()
  @Type(() => CreateInvoiceItemDto)
  items?: CreateInvoiceItemDto[];
}
