import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpenseFilterDto } from './dto/expense-filter.dto';
import { Expense } from './entities/expense.entity';

@ApiTags('Billing - Expenses')
@ApiBearerAuth('JWT-auth')
@Public() // Allow public access for development
@Controller('billing/expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createExpenseDto: CreateExpenseDto): Promise<Expense> {
    return await this.expensesService.create(createExpenseDto);
  }

  @Get()
  async findAll(@Query() filterDto: ExpenseFilterDto): Promise<{ data: Expense[]; total: number }> {
    return await this.expensesService.findAll(filterDto);
  }

  @Get('case/:caseId')
  async findByCase(@Param('caseId') caseId: string): Promise<Expense[]> {
    return await this.expensesService.findByCase(caseId);
  }

  @Get('case/:caseId/unbilled')
  async getUnbilledByCase(@Param('caseId') caseId: string): Promise<Expense[]> {
    return await this.expensesService.getUnbilledByCase(caseId);
  }

  @Get('case/:caseId/totals')
  async getTotalsByCase(
    @Param('caseId') caseId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<{ total: number; billable: number; billed: number; unbilled: number }> {
    return await this.expensesService.getTotalsByCase(caseId, startDate, endDate);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Expense> {
    return await this.expensesService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ): Promise<Expense> {
    return await this.expensesService.update(id, updateExpenseDto);
  }

  @Put(':id/approve')
  async approve(@Param('id') id: string, @Body('approvedBy') approvedBy: string): Promise<Expense> {
    return await this.expensesService.approve(id, approvedBy);
  }

  @Put(':id/bill')
  async bill(
    @Param('id') id: string,
    @Body('invoiceId') invoiceId: string,
    @Body('billedBy') billedBy: string,
  ): Promise<Expense> {
    return await this.expensesService.bill(id, invoiceId, billedBy);
  }

  @Put(':id/reimburse')
  async reimburse(@Param('id') id: string, @Body('reimbursedBy') reimbursedBy: string): Promise<Expense> {
    return await this.expensesService.reimburse(id, reimbursedBy);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.expensesService.remove(id);
  }
}

