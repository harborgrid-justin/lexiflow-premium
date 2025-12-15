import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BillingService } from './billing.service';

@ApiTags('Billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('invoices')
  async getAllInvoices() {
    return this.billingService.findAllInvoices();
  }

  @Get('invoices/:id')
  async getInvoice(@Param('id') id: string) {
    return this.billingService.findInvoiceById(id);
  }

  @Post('invoices')
  async createInvoice(@Body() createDto: any) {
    return this.billingService.createInvoice(createDto);
  }

  @Put('invoices/:id')
  async updateInvoice(@Param('id') id: string, @Body() updateDto: any) {
    return this.billingService.updateInvoice(id, updateDto);
  }

  @Delete('invoices/:id')
  async deleteInvoice(@Param('id') id: string) {
    return this.billingService.deleteInvoice(id);
  }

  @Post('invoices/:id/send')
  async sendInvoice(@Param('id') id: string) {
    return this.billingService.sendInvoice(id);
  }

  @Post('invoices/:id/mark-paid')
  async markPaid(@Param('id') id: string) {
    return this.billingService.markInvoicePaid(id);
  }

  @Get('time-entries')
  async getAllTimeEntries() {
    return this.billingService.findAllTimeEntries();
  }

  @Get('time-entries/case/:caseId')
  async getTimeEntriesByCase(@Param('caseId') caseId: string) {
    return this.billingService.findTimeEntriesByCaseId(caseId);
  }

  @Post('time-entries')
  async createTimeEntry(@Body() createDto: any) {
    return this.billingService.createTimeEntry(createDto);
  }

  @Put('time-entries/:id')
  async updateTimeEntry(@Param('id') id: string, @Body() updateDto: any) {
    return this.billingService.updateTimeEntry(id, updateDto);
  }

  @Delete('time-entries/:id')
  async deleteTimeEntry(@Param('id') id: string) {
    return this.billingService.deleteTimeEntry(id);
  }

  @Get('time-entries/unbilled/:caseId')
  async getUnbilledTimeEntries(@Param('caseId') caseId: string) {
    return this.billingService.getUnbilledTimeEntries(caseId);
  }

  @Get('expenses')
  async getAllExpenses() {
    return this.billingService.findAllExpenses();
  }

  @Post('expenses')
  async createExpense(@Body() createDto: any) {
    return this.billingService.createExpense(createDto);
  }

  @Get('expenses/unbilled/:caseId')
  async getUnbilledExpenses(@Param('caseId') caseId: string) {
    return this.billingService.getUnbilledExpenses(caseId);
  }

  @Post('generate-invoice')
  async generateInvoice(@Body() body: { caseId: string; clientId: string }) {
    return this.billingService.generateInvoice(body.caseId, body.clientId);
  }

  @Get('summary/:caseId')
  async getBillingSummary(@Param('caseId') caseId: string) {
    return this.billingService.getBillingSummary(caseId);
  }
}
