import { PartialType } from '@nestjs/mapped-types';
import { CreateExpenseDto } from './create-expense.dto';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ExpenseStatus } from '@billing/expenses/entities/expense.entity';

export class UpdateExpenseDto extends PartialType(CreateExpenseDto) {
  @IsOptional()
  @IsEnum(ExpenseStatus)
  status?: ExpenseStatus;

  @IsOptional()
  @IsString()
  invoiceId?: string;

  @IsOptional()
  @IsString()
  approvedBy?: string;

  @IsOptional()
  @IsString()
  billedBy?: string;

  @IsOptional()
  @IsString()
  reimbursedBy?: string;
}
