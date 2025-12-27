import { IsOptional, IsString, IsEnum, IsBoolean, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ExpenseStatus, ExpenseCategory } from '@billing/expenses/entities/expense.entity';

export class ExpenseFilterDto {
  @IsOptional()
  @IsString()
  caseId?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsEnum(ExpenseStatus)
  status?: ExpenseStatus;

  @IsOptional()
  @IsEnum(ExpenseCategory)
  category?: ExpenseCategory;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  billable?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  reimbursable?: boolean;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  limit?: number = 50;

  @IsOptional()
  @IsString()
  sortBy?: string = 'expenseDate';

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
