import {
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
  IsEnum,
  Min,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum InvoiceItemType {
  TIME_ENTRY = 'time_entry',
  EXPENSE = 'expense',
  FLAT_FEE = 'flat_fee',
  ADJUSTMENT = 'adjustment',
  DISCOUNT = 'discount',
}

export class CreateInvoiceItemDto {
  @ApiProperty({ description: 'Invoice ID' })
  @IsUUID()
  @IsNotEmpty()
  invoiceId: string;

  @ApiProperty({ enum: InvoiceItemType, description: 'Type of invoice item' })
  @IsEnum(InvoiceItemType)
  @IsNotEmpty()
  type: InvoiceItemType;

  @ApiProperty({ description: 'Description of the invoice item' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Quantity (e.g., hours, units)', minimum: 0 })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiProperty({ description: 'Rate per unit', minimum: 0 })
  @IsNumber()
  @Min(0)
  rate: number;

  @ApiProperty({ description: 'Total amount (quantity * rate)', minimum: 0 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ description: 'Associated time entry ID' })
  @IsUUID()
  @IsOptional()
  timeEntryId?: string;

  @ApiPropertyOptional({ description: 'Associated expense ID' })
  @IsUUID()
  @IsOptional()
  expenseId?: string;

  @ApiPropertyOptional({ description: 'Date of service' })
  @IsString()
  @IsOptional()
  dateOfService?: string;

  @ApiPropertyOptional({ description: 'Activity code or task code' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  activityCode?: string;

  @ApiPropertyOptional({ description: 'Discount percentage', minimum: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  discount?: number;

  @ApiPropertyOptional({ description: 'Discounted amount after discount' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  discountedAmount?: number;

  @ApiPropertyOptional({ description: 'Tax amount' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  taxAmount?: number;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  metadata?: Record<string, unknown>;
}
