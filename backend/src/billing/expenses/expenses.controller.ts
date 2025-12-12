import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpenseFilterDto } from './dto/expense-filter.dto';
import { Expense } from './entities/expense.entity';

@ApiTags('expenses')
@ApiBearerAuth()
@Controller('api/v1/billing/expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('receipt'))
  @ApiOperation({
    summary: 'Create new expense',
    description: 'Record a billable or non-billable expense with optional receipt attachment'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        caseId: { type: 'string', format: 'uuid' },
        description: { type: 'string', example: 'Court filing fee' },
        amount: { type: 'number', example: 350.00 },
        date: { type: 'string', format: 'date' },
        category: { type: 'string', enum: ['filing_fee', 'travel', 'postage', 'copying', 'expert_witness', 'other'] },
        vendor: { type: 'string', example: 'Superior Court' },
        billable: { type: 'boolean', example: true },
        receipt: { type: 'string', format: 'binary' }
      },
      required: ['caseId', 'description', 'amount', 'date', 'category']
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Expense created successfully',
    type: Expense,
  })
  @ApiResponse({ status: 400, description: 'Invalid expense data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createExpenseDto: CreateExpenseDto,
    @UploadedFile() receipt?: Express.Multer.File,
  ): Promise<Expense> {
    return await this.expensesService.create(createExpenseDto, receipt);
  }

  @Get()
  @ApiOperation({
    summary: 'List all expenses with filtering and pagination',
    description: 'Retrieve paginated list of expenses with filters for case, category, date range, billable status'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20, description: 'Items per page' })
  @ApiQuery({ name: 'caseId', required: false, type: String, description: 'Filter by case UUID' })
  @ApiQuery({ name: 'category', required: false, type: String, description: 'Filter by expense category' })
  @ApiQuery({ name: 'billable', required: false, type: Boolean, description: 'Filter by billable status' })
  @ApiQuery({ name: 'billed', required: false, type: Boolean, description: 'Filter by billed status' })
  @ApiQuery({ name: 'approved', required: false, type: Boolean, description: 'Filter by approval status' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Filter by start date (ISO 8601)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'Filter by end date (ISO 8601)' })
  @ApiQuery({ name: 'minAmount', required: false, type: Number, description: 'Minimum expense amount' })
  @ApiQuery({ name: 'maxAmount', required: false, type: Number, description: 'Maximum expense amount' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, example: 'date', description: 'Sort field' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], example: 'DESC', description: 'Sort order' })
  @ApiResponse({
    status: 200,
    description: 'Expenses retrieved successfully',
    schema: {
      example: {
        data: [],
        total: 85,
        page: 1,
        limit: 20,
        totalPages: 5
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Query() filterDto: ExpenseFilterDto): Promise<{ data: Expense[]; total: number }> {
    return await this.expensesService.findAll(filterDto);
  }

  @Get('case/:caseId')
  @ApiOperation({
    summary: 'Get expenses for a specific case',
    description: 'Retrieve all expenses associated with a particular case'
  })
  @ApiParam({ name: 'caseId', type: String, format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000', description: 'Case UUID' })
  @ApiResponse({
    status: 200,
    description: 'Expenses retrieved successfully',
    type: [Expense],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findByCase(@Param('caseId', ParseUUIDPipe) caseId: string): Promise<Expense[]> {
    return await this.expensesService.findByCase(caseId);
  }

  @Get('case/:caseId/unbilled')
  @ApiOperation({
    summary: 'Get unbilled expenses for a case',
    description: 'Retrieve all expenses for a case that have not been billed yet'
  })
  @ApiParam({ name: 'caseId', type: String, format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000', description: 'Case UUID' })
  @ApiResponse({
    status: 200,
    description: 'Unbilled expenses retrieved successfully',
    type: [Expense],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUnbilledByCase(@Param('caseId', ParseUUIDPipe) caseId: string): Promise<Expense[]> {
    return await this.expensesService.getUnbilledByCase(caseId);
  }

  @Get('case/:caseId/totals')
  @ApiOperation({
    summary: 'Get expense totals for a case',
    description: 'Calculate total expense amounts for a case, broken down by billable, billed, and unbilled'
  })
  @ApiParam({ name: 'caseId', type: String, format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000', description: 'Case UUID' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date for totals calculation' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date for totals calculation' })
  @ApiResponse({
    status: 200,
    description: 'Totals calculated successfully',
    schema: {
      example: {
        total: 5000,
        billable: 4500,
        billed: 3000,
        unbilled: 1500,
        byCategory: {
          filing_fee: 1200,
          travel: 800,
          expert_witness: 2000,
          other: 1000
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getTotalsByCase(
    @Param('caseId', ParseUUIDPipe) caseId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<{ total: number; billable: number; billed: number; unbilled: number }> {
    return await this.expensesService.getTotalsByCase(caseId, startDate, endDate);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get expense by ID',
    description: 'Retrieve detailed information about a specific expense including receipt'
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', example: '323e4567-e89b-12d3-a456-426614174002', description: 'Expense UUID' })
  @ApiResponse({
    status: 200,
    description: 'Expense retrieved successfully',
    type: Expense,
  })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Expense> {
    return await this.expensesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Full update of expense',
    description: 'Replace all expense fields with new data. Cannot update billed expenses.'
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', example: '323e4567-e89b-12d3-a456-426614174002', description: 'Expense UUID' })
  @ApiBody({ type: UpdateExpenseDto })
  @ApiResponse({
    status: 200,
    description: 'Expense updated successfully',
    type: Expense,
  })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  @ApiResponse({ status: 400, description: 'Invalid expense data or expense already billed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ): Promise<Expense> {
    return await this.expensesService.update(id, updateExpenseDto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Partial update of expense',
    description: 'Update specific fields of an expense without affecting other fields'
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', example: '323e4567-e89b-12d3-a456-426614174002', description: 'Expense UUID' })
  @ApiBody({ type: UpdateExpenseDto })
  @ApiResponse({
    status: 200,
    description: 'Expense updated successfully',
    type: Expense,
  })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  @ApiResponse({ status: 400, description: 'Invalid expense data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async partialUpdate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateExpenseDto: Partial<UpdateExpenseDto>,
  ): Promise<Expense> {
    return await this.expensesService.update(id, updateExpenseDto);
  }

  @Put(':id/approve')
  @ApiOperation({
    summary: 'Approve expense',
    description: 'Mark an expense as approved by a supervisor. Required before billing or reimbursement.'
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', example: '323e4567-e89b-12d3-a456-426614174002', description: 'Expense UUID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        approvedBy: { type: 'string', format: 'uuid', example: '423e4567-e89b-12d3-a456-426614174003' },
        notes: { type: 'string', example: 'Approved for billing to client' }
      },
      required: ['approvedBy']
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Expense approved successfully',
    type: Expense,
  })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  @ApiResponse({ status: 400, description: 'Expense already approved or billed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async approve(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('approvedBy') approvedBy: string,
  ): Promise<Expense> {
    return await this.expensesService.approve(id, approvedBy);
  }

  @Put(':id/bill')
  @ApiOperation({
    summary: 'Mark expense as billed',
    description: 'Associate an expense with an invoice. Locks the expense from further editing.'
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', example: '323e4567-e89b-12d3-a456-426614174002', description: 'Expense UUID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        invoiceId: { type: 'string', format: 'uuid', example: '523e4567-e89b-12d3-a456-426614174005' },
        billedBy: { type: 'string', format: 'uuid', example: '423e4567-e89b-12d3-a456-426614174003' }
      },
      required: ['invoiceId', 'billedBy']
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Expense marked as billed successfully',
    type: Expense,
  })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  @ApiResponse({ status: 400, description: 'Expense already billed or not approved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async bill(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('invoiceId') invoiceId: string,
    @Body('billedBy') billedBy: string,
  ): Promise<Expense> {
    return await this.expensesService.bill(id, invoiceId, billedBy);
  }

  @Put(':id/reimburse')
  @ApiOperation({
    summary: 'Mark expense as reimbursed',
    description: 'Record reimbursement payment to employee for out-of-pocket expense'
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', example: '323e4567-e89b-12d3-a456-426614174002', description: 'Expense UUID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        reimbursedBy: { type: 'string', format: 'uuid' },
        reimbursedDate: { type: 'string', format: 'date' },
        paymentMethod: { type: 'string', enum: ['check', 'direct_deposit', 'cash'], example: 'direct_deposit' },
        notes: { type: 'string' }
      },
      required: ['reimbursedBy']
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Expense marked as reimbursed successfully',
    type: Expense,
  })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  @ApiResponse({ status: 400, description: 'Expense already reimbursed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async reimburse(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reimbursedBy') reimbursedBy: string,
  ): Promise<Expense> {
    return await this.expensesService.reimburse(id, reimbursedBy);
  }

  @Get(':id/receipt')
  @ApiOperation({
    summary: 'Download expense receipt',
    description: 'Download the receipt file attached to an expense'
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', example: '323e4567-e89b-12d3-a456-426614174002', description: 'Expense UUID' })
  @ApiResponse({
    status: 200,
    description: 'Receipt downloaded successfully',
    content: { 'application/octet-stream': {} }
  })
  @ApiResponse({ status: 404, description: 'Expense or receipt not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async downloadReceipt(@Param('id', ParseUUIDPipe) id: string) {
    return await this.expensesService.downloadReceipt(id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete expense',
    description: 'Soft delete an expense. Cannot delete billed or reimbursed expenses.'
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', example: '323e4567-e89b-12d3-a456-426614174002', description: 'Expense UUID' })
  @ApiResponse({ status: 204, description: 'Expense deleted successfully' })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete billed or reimbursed expense' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.expensesService.remove(id);
  }

  @Post('bulk/approve')
  @ApiOperation({
    summary: 'Bulk approve expenses',
    description: 'Approve multiple expenses at once for efficient review workflow'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        expenseIds: { type: 'array', items: { type: 'string', format: 'uuid' } },
        approvedBy: { type: 'string', format: 'uuid' }
      },
      required: ['expenseIds', 'approvedBy']
    }
  })
  @ApiResponse({ status: 200, description: 'Expenses approved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid expense IDs or already approved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async bulkApprove(@Body() body: { expenseIds: string[]; approvedBy: string }) {
    return await this.expensesService.bulkApprove(body.expenseIds, body.approvedBy);
  }

  @Get('export')
  @ApiOperation({
    summary: 'Export expenses',
    description: 'Export expenses to CSV or Excel format for accounting or reporting'
  })
  @ApiQuery({ name: 'format', required: true, enum: ['csv', 'excel'], description: 'Export format' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date filter' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date filter' })
  @ApiQuery({ name: 'caseId', required: false, type: String, description: 'Filter by case' })
  @ApiResponse({
    status: 200,
    description: 'Export file generated successfully',
    content: { 'application/octet-stream': {} }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async export(
    @Query('format') format: 'csv' | 'excel',
    @Query() filters: ExpenseFilterDto,
  ) {
    return await this.expensesService.export(format, filters);
  }
}
