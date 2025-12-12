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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto, RecordPaymentDto } from './dto/update-invoice.dto';
import { InvoiceFilterDto } from './dto/invoice-filter.dto';
import { Invoice } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';

@ApiTags('invoices')
@ApiBearerAuth()
@Controller('api/v1/billing/invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @ApiOperation({
    summary: 'Create new invoice',
    description: 'Generate a new invoice with line items, time entries, and expenses for a case or client'
  })
  @ApiBody({ type: CreateInvoiceDto })
  @ApiResponse({
    status: 201,
    description: 'Invoice created successfully',
    type: Invoice,
  })
  @ApiResponse({ status: 400, description: 'Invalid invoice data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    return await this.invoicesService.create(createInvoiceDto);
  }

  @Get()
  @ApiOperation({
    summary: 'List all invoices with filtering and pagination',
    description: 'Retrieve paginated list of invoices with optional filters for case, client, status, date range, and amount'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20, description: 'Items per page' })
  @ApiQuery({ name: 'caseId', required: false, type: String, description: 'Filter by case UUID' })
  @ApiQuery({ name: 'clientId', required: false, type: String, description: 'Filter by client UUID' })
  @ApiQuery({ name: 'status', required: false, enum: ['draft', 'sent', 'paid', 'overdue', 'void'], description: 'Filter by invoice status' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Filter by start date (ISO 8601)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'Filter by end date (ISO 8601)' })
  @ApiQuery({ name: 'minAmount', required: false, type: Number, description: 'Minimum invoice amount' })
  @ApiQuery({ name: 'maxAmount', required: false, type: Number, description: 'Maximum invoice amount' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, example: 'invoiceDate', description: 'Sort field' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], example: 'DESC', description: 'Sort order' })
  @ApiResponse({
    status: 200,
    description: 'Invoices retrieved successfully',
    schema: {
      example: {
        data: [],
        total: 100,
        page: 1,
        limit: 20,
        totalPages: 5
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Query() filterDto: InvoiceFilterDto): Promise<{ data: Invoice[]; total: number }> {
    return await this.invoicesService.findAll(filterDto);
  }

  @Get('overdue')
  @ApiOperation({
    summary: 'Get all overdue invoices',
    description: 'Retrieve all invoices that are past their due date and have not been paid'
  })
  @ApiResponse({
    status: 200,
    description: 'Overdue invoices retrieved successfully',
    type: [Invoice],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getOverdueInvoices(): Promise<Invoice[]> {
    return await this.invoicesService.getOverdueInvoices();
  }

  @Get('statistics')
  @ApiOperation({
    summary: 'Get invoice statistics',
    description: 'Retrieve aggregate statistics including total billed, paid, outstanding, and overdue amounts'
  })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date for statistics' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date for statistics' })
  @ApiResponse({
    status: 200,
    description: 'Invoice statistics retrieved successfully',
    schema: {
      example: {
        totalBilled: 150000,
        totalPaid: 120000,
        totalOutstanding: 30000,
        totalOverdue: 5000,
        invoiceCount: 45,
        paidCount: 38,
        overdueCount: 3
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return await this.invoicesService.getStatistics(startDate, endDate);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get invoice by ID',
    description: 'Retrieve detailed invoice information including all line items, time entries, and expenses'
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000', description: 'Invoice UUID' })
  @ApiResponse({
    status: 200,
    description: 'Invoice retrieved successfully',
    type: Invoice,
  })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Invoice & { items: InvoiceItem[] }> {
    return await this.invoicesService.findOneWithItems(id);
  }

  @Get(':id/pdf')
  @ApiOperation({
    summary: 'Generate invoice PDF',
    description: 'Generate a professional PDF document for the invoice, ready for sending to client'
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000', description: 'Invoice UUID' })
  @ApiResponse({
    status: 200,
    description: 'PDF generated successfully',
    schema: {
      example: {
        url: 'https://storage.lexiflow.com/invoices/invoice-12345.pdf'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async generatePdf(@Param('id', ParseUUIDPipe) id: string): Promise<{ url: string }> {
    return await this.invoicesService.generatePdf(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Full update of invoice',
    description: 'Replace all invoice fields with new data. Cannot update sent or paid invoices.'
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000', description: 'Invoice UUID' })
  @ApiBody({ type: UpdateInvoiceDto })
  @ApiResponse({
    status: 200,
    description: 'Invoice updated successfully',
    type: Invoice,
  })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  @ApiResponse({ status: 400, description: 'Invalid invoice data or cannot update sent/paid invoice' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
  ): Promise<Invoice> {
    return await this.invoicesService.update(id, updateInvoiceDto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Partial update of invoice',
    description: 'Update specific fields of an invoice without affecting other fields'
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000', description: 'Invoice UUID' })
  @ApiBody({ type: UpdateInvoiceDto })
  @ApiResponse({
    status: 200,
    description: 'Invoice updated successfully',
    type: Invoice,
  })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  @ApiResponse({ status: 400, description: 'Invalid invoice data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async partialUpdate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateInvoiceDto: Partial<UpdateInvoiceDto>,
  ): Promise<Invoice> {
    return await this.invoicesService.update(id, updateInvoiceDto);
  }

  @Post(':id/send')
  @ApiOperation({
    summary: 'Send invoice to client',
    description: 'Send the invoice via email to the client with PDF attachment. Updates invoice status to "sent".'
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000', description: 'Invoice UUID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        sentBy: { type: 'string', format: 'uuid', example: '223e4567-e89b-12d3-a456-426614174001' },
        emailAddresses: { type: 'array', items: { type: 'string', format: 'email' }, example: ['client@example.com'] },
        message: { type: 'string', example: 'Please find attached invoice for services rendered.' }
      },
      required: ['sentBy']
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Invoice sent successfully',
    type: Invoice,
  })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  @ApiResponse({ status: 400, description: 'Invoice already sent or invalid status' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async send(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('sentBy') sentBy: string,
  ): Promise<Invoice> {
    return await this.invoicesService.send(id, sentBy);
  }

  @Post(':id/record-payment')
  @ApiOperation({
    summary: 'Record payment for invoice',
    description: 'Record a payment transaction against an invoice. Automatically updates invoice status when fully paid.'
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000', description: 'Invoice UUID' })
  @ApiBody({ type: RecordPaymentDto })
  @ApiResponse({
    status: 200,
    description: 'Payment recorded successfully',
    type: Invoice,
  })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  @ApiResponse({ status: 400, description: 'Invalid payment amount or invoice not sent' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async recordPayment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() recordPaymentDto: RecordPaymentDto,
  ): Promise<Invoice> {
    return await this.invoicesService.recordPayment(id, recordPaymentDto);
  }

  @Post(':id/void')
  @ApiOperation({
    summary: 'Void an invoice',
    description: 'Mark an invoice as void/cancelled. Voids cannot be undone.'
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000', description: 'Invoice UUID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        reason: { type: 'string', example: 'Client dispute' },
        voidedBy: { type: 'string', format: 'uuid' }
      },
      required: ['voidedBy']
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Invoice voided successfully',
    type: Invoice,
  })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  @ApiResponse({ status: 400, description: 'Cannot void paid invoice' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async voidInvoice(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { reason?: string; voidedBy: string },
  ): Promise<Invoice> {
    return await this.invoicesService.voidInvoice(id, body.voidedBy, body.reason);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete invoice',
    description: 'Soft delete an invoice. Only draft invoices can be deleted.'
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000', description: 'Invoice UUID' })
  @ApiResponse({ status: 204, description: 'Invoice deleted successfully' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete sent or paid invoice' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.invoicesService.remove(id);
  }

  @Post('bulk/send')
  @ApiOperation({
    summary: 'Bulk send invoices',
    description: 'Send multiple invoices at once via email'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        invoiceIds: { type: 'array', items: { type: 'string', format: 'uuid' } },
        sentBy: { type: 'string', format: 'uuid' }
      },
      required: ['invoiceIds', 'sentBy']
    }
  })
  @ApiResponse({ status: 200, description: 'Invoices sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid invoice IDs or already sent' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async bulkSend(@Body() body: { invoiceIds: string[]; sentBy: string }) {
    return await this.invoicesService.bulkSend(body.invoiceIds, body.sentBy);
  }

  @Get('export')
  @ApiOperation({
    summary: 'Export invoices',
    description: 'Export invoices to CSV or Excel format for accounting systems'
  })
  @ApiQuery({ name: 'format', required: true, enum: ['csv', 'excel'], description: 'Export format' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date filter' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date filter' })
  @ApiResponse({
    status: 200,
    description: 'Export file generated successfully',
    content: { 'application/octet-stream': {} }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async export(
    @Query('format') format: 'csv' | 'excel',
    @Query() filters: InvoiceFilterDto,
  ) {
    return await this.invoicesService.export(format, filters);
  }
}
