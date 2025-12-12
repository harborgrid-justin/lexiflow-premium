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
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto, RecordPaymentDto } from './dto/update-invoice.dto';
import { InvoiceFilterDto } from './dto/invoice-filter.dto';
import { Invoice } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';

@Controller('api/v1/billing/invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    return await this.invoicesService.create(createInvoiceDto);
  }

  @Get()
  async findAll(@Query() filterDto: InvoiceFilterDto): Promise<{ data: Invoice[]; total: number }> {
    return await this.invoicesService.findAll(filterDto);
  }

  @Get('overdue')
  async getOverdueInvoices(): Promise<Invoice[]> {
    return await this.invoicesService.getOverdueInvoices();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Invoice & { items: InvoiceItem[] }> {
    return await this.invoicesService.findOneWithItems(id);
  }

  @Get(':id/pdf')
  async generatePdf(@Param('id') id: string): Promise<{ url: string }> {
    return await this.invoicesService.generatePdf(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
  ): Promise<Invoice> {
    return await this.invoicesService.update(id, updateInvoiceDto);
  }

  @Post(':id/send')
  async send(@Param('id') id: string, @Body('sentBy') sentBy: string): Promise<Invoice> {
    return await this.invoicesService.send(id, sentBy);
  }

  @Post(':id/record-payment')
  async recordPayment(
    @Param('id') id: string,
    @Body() recordPaymentDto: RecordPaymentDto,
  ): Promise<Invoice> {
    return await this.invoicesService.recordPayment(id, recordPaymentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.invoicesService.remove(id);
  }
}
