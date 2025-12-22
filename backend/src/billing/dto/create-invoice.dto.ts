import { IsString, IsNumber, IsEnum, IsOptional, IsUUID, IsDateString, IsBoolean, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled'
}

class InvoiceLineItemDto {
  @ApiProperty({ description: 'Description of the item' })
  @IsString()
  description!: string;

  @ApiProperty({ description: 'Quantity' })
  @IsNumber()
  @Min(0)
  quantity!: number;

  @ApiProperty({ description: 'Unit rate' })
  @IsNumber()
  @Min(0)
  rate!: number;

  @ApiProperty({ description: 'Total amount' })
  @IsNumber()
  @Min(0)
  amount!: number;
}

export class CreateInvoiceDto {
  @ApiProperty({ description: 'Case ID' })
  @IsUUID()
  caseId!: string;

  @ApiProperty({ description: 'Client ID' })
  @IsUUID()
  clientId!: string;

  @ApiProperty({ description: 'Invoice number', required: false })
  @IsOptional()
  @IsString()
  invoiceNumber?: string;

  @ApiProperty({ description: 'Issue date' })
  @IsDateString()
  issueDate!: string;

  @ApiProperty({ description: 'Due date' })
  @IsDateString()
  dueDate!: string;

  @ApiProperty({ 
    description: 'Invoice status',
    enum: InvoiceStatus,
    default: InvoiceStatus.DRAFT
  })
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @ApiProperty({ description: 'Line items', type: [InvoiceLineItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceLineItemDto)
  lineItems!: InvoiceLineItemDto[];

  @ApiProperty({ description: 'Subtotal amount' })
  @IsNumber()
  @Min(0)
  subtotal!: number;

  @ApiProperty({ description: 'Tax amount', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tax?: number;

  @ApiProperty({ description: 'Total amount' })
  @IsNumber()
  @Min(0)
  total!: number;

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
