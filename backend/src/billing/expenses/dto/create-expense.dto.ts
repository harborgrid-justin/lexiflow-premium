import { IsString, IsNumber, IsDate, IsOptional, IsBoolean, IsEnum, IsArray, Min } from 'class-validator';
import { ExpenseStatus, ExpenseCategory } from '../entities/expense.entity';

export class CreateExpenseDto {
  @IsString()
  caseId: string;

  @IsString()
  userId: string;

  @IsString()
  expenseDate: string;

  @IsEnum(ExpenseCategory)
  category: ExpenseCategory;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  unitPrice?: number;

  @IsOptional()
  @IsEnum(ExpenseStatus)
  status?: ExpenseStatus;

  @IsOptional()
  @IsBoolean()
  billable?: boolean;

  @IsOptional()
  @IsBoolean()
  reimbursable?: boolean;

  @IsOptional()
  @IsString()
  vendor?: string;

  @IsOptional()
  @IsString()
  receiptNumber?: string;

  @IsOptional()
  @IsArray()
  receiptUrls?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Min(100)
  markup?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  glCode?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;
}
