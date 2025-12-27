import { PartialType } from '@nestjs/mapped-types';
import { CreateInvoiceDto } from './create-invoice.dto';
import { IsOptional, IsString, IsNumber, IsEnum, Min } from 'class-validator';
import { InvoiceStatus } from '@billing/invoices/entities/invoice.entity';

export class UpdateInvoiceDto extends PartialType(CreateInvoiceDto) {
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  paidAmount?: number;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  paymentReference?: string;
}

export class RecordPaymentDto {
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsString()
  paymentDate!: string;

  @IsString()
  paymentMethod!: string;

  @IsOptional()
  @IsString()
  paymentReference?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
