import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { CreateTimeEntryDto } from './time-entries/dto/create-time-entry.dto';
import { UpdateTimeEntryDto } from './time-entries/dto/update-time-entry.dto';
import { CreateExpenseDto } from './expenses/dto/create-expense.dto';

@ApiTags('Billing')
@ApiBearerAuth('JWT-auth')

@Controller('billing')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('invoices')
  @Roles(UserRole.ADMIN, UserRole.PARTNER, UserRole.ATTORNEY, UserRole.PARALEGAL)
  @ApiOperation({ summary: 'Get all invoices' })
  @ApiResponse({ status: 200, description: 'List of invoices' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getAllInvoices() {
    return this.billingService.findAllInvoices();
  }

  @Get('invoices/:id')
  @Roles(UserRole.ADMIN, UserRole.PARTNER, UserRole.ATTORNEY, UserRole.PARALEGAL)
  @ApiOperation({ summary: 'Get invoice by ID' })
  @ApiResponse({ status: 200, description: 'Invoice details' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getInvoice(@Param('id') id: string) {
    return this.billingService.findInvoiceById(id);
  }

  @Post('invoices')
  @Roles(UserRole.ADMIN, UserRole.PARTNER)
  @ApiOperation({ summary: 'Create new invoice' })
  @ApiResponse({ status: 201, description: 'Invoice created' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async createInvoice(@Body() createDto: CreateInvoiceDto) {
    return this.billingService.createInvoice(createDto);
  }

  @Put('invoices/:id')
  @Roles(UserRole.ADMIN, UserRole.PARTNER)
  @ApiOperation({ summary: 'Update invoice' })
  @ApiResponse({ status: 200, description: 'Invoice updated' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async updateInvoice(@Param('id') id: string, @Body() updateDto: UpdateInvoiceDto) {
    return this.billingService.updateInvoice(id, updateDto);
  }

  @Delete('invoices/:id')
  @Roles(UserRole.ADMIN, UserRole.PARTNER)
  @ApiOperation({ summary: 'Delete invoice' })
  @ApiResponse({ status: 200, description: 'Invoice deleted' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async deleteInvoice(@Param('id') id: string) {
    return this.billingService.deleteInvoice(id);
  }

  @Post('invoices/:id/send')
  @Roles(UserRole.ADMIN, UserRole.PARTNER, UserRole.ATTORNEY)
  @ApiOperation({ summary: 'Send invoice to client' })
  @ApiResponse({ status: 200, description: 'Invoice sent' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async sendInvoice(@Param('id') id: string) {
    return this.billingService.sendInvoice(id);
  }

  @Post('invoices/:id/mark-paid')
  @Roles(UserRole.ADMIN, UserRole.PARTNER)
  @ApiOperation({ summary: 'Mark invoice as paid' })
  @ApiResponse({ status: 200, description: 'Invoice marked as paid' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async markPaid(@Param('id') id: string) {
    return this.billingService.markInvoicePaid(id);
  }

  @Get('time-entries')
  @Roles(UserRole.ADMIN, UserRole.PARTNER, UserRole.ATTORNEY, UserRole.PARALEGAL)
  @ApiOperation({ summary: 'Get all time entries' })
  @ApiResponse({ status: 200, description: 'List of time entries' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getAllTimeEntries() {
    return this.billingService.findAllTimeEntries();
  }

  @Get('time-entries/case/:caseId')
  @Roles(UserRole.ADMIN, UserRole.PARTNER, UserRole.ATTORNEY, UserRole.PARALEGAL)
  @ApiOperation({ summary: 'Get time entries by case' })
  @ApiResponse({ status: 200, description: 'List of time entries for case' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'caseId', description: 'Case ID' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getTimeEntriesByCase(@Param('caseId') caseId: string) {
    return this.billingService.findTimeEntriesByCaseId(caseId);
  }

  @Post('time-entries')
  @Roles(UserRole.ADMIN, UserRole.PARTNER, UserRole.ATTORNEY, UserRole.PARALEGAL)
  @ApiOperation({ summary: 'Create time entry' })
  @ApiResponse({ status: 201, description: 'Time entry created' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async createTimeEntry(@Body() createDto: CreateTimeEntryDto) {
    return this.billingService.createTimeEntry(createDto);
  }

  @Put('time-entries/:id')
  @Roles(UserRole.ADMIN, UserRole.PARTNER, UserRole.ATTORNEY, UserRole.PARALEGAL)
  @ApiOperation({ summary: 'Update time entry' })
  @ApiResponse({ status: 200, description: 'Time entry updated' })
  @ApiResponse({ status: 404, description: 'Time entry not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'id', description: 'Time entry ID' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async updateTimeEntry(@Param('id') id: string, @Body() updateDto: UpdateTimeEntryDto) {
    return this.billingService.updateTimeEntry(id, updateDto);
  }

  @Delete('time-entries/:id')
  @Roles(UserRole.ADMIN, UserRole.PARTNER, UserRole.ATTORNEY)
  @ApiOperation({ summary: 'Delete time entry' })
  @ApiResponse({ status: 200, description: 'Time entry deleted' })
  @ApiResponse({ status: 404, description: 'Time entry not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'id', description: 'Time entry ID' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async deleteTimeEntry(@Param('id') id: string) {
    return this.billingService.deleteTimeEntry(id);
  }

  @Get('time-entries/unbilled/:caseId')
  @Roles(UserRole.ADMIN, UserRole.PARTNER, UserRole.ATTORNEY, UserRole.PARALEGAL)
  @ApiOperation({ summary: 'Get unbilled time entries for case' })
  @ApiResponse({ status: 200, description: 'List of unbilled time entries' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'caseId', description: 'Case ID' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getUnbilledTimeEntries(@Param('caseId') caseId: string) {
    return this.billingService.getUnbilledTimeEntries(caseId);
  }

  @Get('expenses')
  @Roles(UserRole.ADMIN, UserRole.PARTNER, UserRole.ATTORNEY, UserRole.PARALEGAL)
  @ApiOperation({ summary: 'Get all expenses' })
  @ApiResponse({ status: 200, description: 'List of expenses' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getAllExpenses() {
    return this.billingService.findAllExpenses();
  }

  @Post('expenses')
  @Roles(UserRole.ADMIN, UserRole.PARTNER, UserRole.ATTORNEY, UserRole.PARALEGAL)
  @ApiOperation({ summary: 'Create expense' })
  @ApiResponse({ status: 201, description: 'Expense created' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async createExpense(@Body() createDto: CreateExpenseDto) {
    return this.billingService.createExpense(createDto);
  }

  @Get('expenses/unbilled/:caseId')
  @Roles(UserRole.ADMIN, UserRole.PARTNER, UserRole.ATTORNEY, UserRole.PARALEGAL)
  @ApiOperation({ summary: 'Get unbilled expenses for case' })
  @ApiResponse({ status: 200, description: 'List of unbilled expenses' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'caseId', description: 'Case ID' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getUnbilledExpenses(@Param('caseId') caseId: string) {
    return this.billingService.getUnbilledExpenses(caseId);
  }

  @Post('generate-invoice')
  @Roles(UserRole.ADMIN, UserRole.PARTNER)
  @ApiOperation({ summary: 'Generate invoice from unbilled items' })
  @ApiResponse({ status: 201, description: 'Invoice generated' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  async generateInvoice(@Body() body: { caseId: string; clientId: string }) {
    return this.billingService.generateInvoice(body.caseId, body.clientId);
  }

  @Get('summary/:caseId')
  @Roles(UserRole.ADMIN, UserRole.PARTNER, UserRole.ATTORNEY, UserRole.PARALEGAL)
  @ApiOperation({ summary: 'Get billing summary for case' })
  @ApiResponse({ status: 200, description: 'Billing summary' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'caseId', description: 'Case ID' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getBillingSummary(@Param('caseId') caseId: string) {
    return this.billingService.getBillingSummary(caseId);
  }

  @Get('wip-stats')
  @Roles(UserRole.ADMIN, UserRole.PARTNER, UserRole.ATTORNEY, UserRole.PARALEGAL)
  @ApiOperation({ summary: 'Get WIP (Work In Progress) statistics' })
  @ApiResponse({ status: 200, description: 'WIP statistics by case' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getWIPStats() {
    return this.billingService.getWIPStats();
  }

  @Get('realization-stats')
  @Roles(UserRole.ADMIN, UserRole.PARTNER, UserRole.ATTORNEY, UserRole.PARALEGAL)
  @ApiOperation({ summary: 'Get realization statistics (billed vs write-off)' })
  @ApiResponse({ status: 200, description: 'Realization statistics' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getRealizationStats() {
    return this.billingService.getRealizationStats();
  }

  @Get('overview-stats')
  @Roles(UserRole.ADMIN, UserRole.PARTNER, UserRole.ATTORNEY, UserRole.PARALEGAL)
  @ApiOperation({ summary: 'Get billing overview statistics' })
  @ApiResponse({ 
    status: 200, 
    description: 'Overview statistics including realization rate and total billed',
    schema: {
      type: 'object',
      properties: {
        realization: { type: 'number', example: 92.4 },
        totalBilled: { type: 'number', example: 482000 },
        month: { type: 'string', example: 'December 2025' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getOverviewStats() {
    return this.billingService.getOverviewStats();
  }
}

