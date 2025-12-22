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
import { ApiTags, ApiBearerAuth, ApiOperation , ApiResponse }from '@nestjs/swagger';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpenseFilterDto } from './dto/expense-filter.dto';
import { Expense } from './entities/expense.entity';

@ApiTags('Billing - Expenses')
@ApiBearerAuth('JWT-auth')

@Controller('billing/expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async create(@Body() createExpenseDto: CreateExpenseDto): Promise<Expense> {
    return await this.expensesService.create(createExpenseDto);
  }

  @Get()
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(@Query() filterDto: ExpenseFilterDto): Promise<{ data: Expense[]; total: number }> {
    return await this.expensesService.findAll(filterDto);
  }

  @Get('case/:caseId')
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findByCase(@Param('caseId') caseId: string): Promise<Expense[]> {
    return await this.expensesService.findByCase(caseId);
  }

  @Get('case/:caseId/unbilled')
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getUnbilledByCase(@Param('caseId') caseId: string): Promise<Expense[]> {
    return await this.expensesService.getUnbilledByCase(caseId);
  }

  @Get('case/:caseId/totals')
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getTotalsByCase(
    @Param('caseId') caseId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<{ total: number; billable: number; billed: number; unbilled: number }> {
    return await this.expensesService.getTotalsByCase(caseId, startDate, endDate);
  }

  @Get(':id')
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async findOne(@Param('id') id: string): Promise<Expense> {
    return await this.expensesService.findOne(id);
  }

  @Put(':id')
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async update(
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ): Promise<Expense> {
    return await this.expensesService.update(id, updateExpenseDto);
  }

  @Put(':id/approve')
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async approve(@Param('id') id: string, @Body('approvedBy') approvedBy: string): Promise<Expense> {
    return await this.expensesService.approve(id, approvedBy);
  }

  @Put(':id/bill')
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async bill(
    @Param('id') id: string,
    @Body('invoiceId') invoiceId: string,
    @Body('billedBy') billedBy: string,
  ): Promise<Expense> {
    return await this.expensesService.bill(id, invoiceId, billedBy);
  }

  @Put(':id/reimburse')
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async reimburse(@Param('id') id: string, @Body('reimbursedBy') reimbursedBy: string): Promise<Expense> {
    return await this.expensesService.reimburse(id, reimbursedBy);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.expensesService.remove(id);
  }
}

