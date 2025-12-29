import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Invoice, InvoiceStatus } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto, RecordPaymentDto } from './dto/update-invoice.dto';
import { InvoiceFilterDto } from './dto/invoice-filter.dto';
import { validateSortField, validateSortOrder } from '@common/utils/query-validation.util';

@Injectable()
export class InvoicesService {
  private readonly logger = new Logger(InvoicesService.name);

  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private readonly invoiceItemRepository: Repository<InvoiceItem>,
  ) {}

  async create(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    const { items, taxRate, discountAmount, ...invoiceData } = createInvoiceDto;

    // Calculate totals
    const subtotal = createInvoiceDto.subtotal;
    const taxAmount = taxRate ? subtotal * (taxRate / 100) : 0;
    const totalAmount = subtotal + taxAmount - (discountAmount || 0);
    const balanceDue = totalAmount;

    const invoice = this.invoiceRepository.create({
      ...invoiceData,
      taxRate: taxRate || 0,
      taxAmount,
      discountAmount: discountAmount || 0,
      totalAmount,
      balanceDue,
      paidAmount: 0,
      status: createInvoiceDto.status || InvoiceStatus.DRAFT,
    });

    const savedInvoice = await this.invoiceRepository.save(invoice);

    // Create invoice items if provided
    if (items && items.length > 0) {
      const invoiceItems = items.map((item) =>
        this.invoiceItemRepository.create({
          ...item,
          invoiceId: savedInvoice.id,
        }),
      );
      await this.invoiceItemRepository.save(invoiceItems);
    }

    return savedInvoice;
  }

  async findAll(filterDto: InvoiceFilterDto): Promise<{ data: Invoice[]; total: number }> {
    const {
      caseId,
      clientId,
      status,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 50,
      sortBy = 'invoiceDate',
      sortOrder = 'DESC',
    } = filterDto;

    const query = this.invoiceRepository.createQueryBuilder('invoice');

    if (caseId) {
      query.andWhere('invoice.caseId = :caseId', { caseId });
    }

    if (clientId) {
      query.andWhere('invoice.clientId = :clientId', { clientId });
    }

    if (status) {
      query.andWhere('invoice.status = :status', { status });
    }

    if (startDate && endDate) {
      query.andWhere('invoice.invoiceDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      query.andWhere('invoice.invoiceDate >= :startDate', { startDate });
    } else if (endDate) {
      query.andWhere('invoice.invoiceDate <= :endDate', { endDate });
    }

    if (search) {
      query.andWhere(
        '(invoice.invoiceNumber ILIKE :search OR invoice.clientName ILIKE :search OR invoice.matterDescription ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    query.andWhere('invoice.deletedAt IS NULL');

    const total = await query.getCount();

    // SQL injection protection
    const safeSortField = validateSortField('invoice', sortBy);
    const safeSortOrder = validateSortOrder(sortOrder);

    query
      .orderBy(`invoice.${safeSortField}`, safeSortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const data = await query.getMany();

    return { data, total };
  }

  async findOne(id: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    return invoice;
  }

  async findOneWithItems(id: string): Promise<Invoice & { items: InvoiceItem[] }> {
    const invoice = await this.findOne(id);
    const items = await this.invoiceItemRepository.find({
      where: { invoiceId: id },
      order: { date: 'ASC' },
    });

    return { ...invoice, items } as Invoice & { items: InvoiceItem[] };
  }

  async update(id: string, updateInvoiceDto: UpdateInvoiceDto): Promise<Invoice> {
    const invoice = await this.findOne(id);

    // Recalculate totals if amounts changed
    if (updateInvoiceDto.subtotal !== undefined || updateInvoiceDto.taxRate !== undefined || updateInvoiceDto.discountAmount !== undefined) {
      const subtotal = updateInvoiceDto.subtotal ?? invoice.subtotal;
      const taxRate = updateInvoiceDto.taxRate ?? invoice.taxRate;
      const discountAmount = updateInvoiceDto.discountAmount ?? invoice.discountAmount;
      const taxAmount = subtotal * (taxRate / 100);
      const totalAmount = Number(subtotal) + Number(taxAmount) - Number(discountAmount);
      const paidAmount = updateInvoiceDto.paidAmount ?? invoice.paidAmount;
      const balanceDue = Number(totalAmount) - Number(paidAmount);

      Object.assign(invoice, updateInvoiceDto, { taxAmount, totalAmount, balanceDue });
    } else {
      Object.assign(invoice, updateInvoiceDto);
    }

    return await this.invoiceRepository.save(invoice);
  }

  async remove(id: string): Promise<void> {
    const invoice = await this.findOne(id);
    invoice.deletedAt = new Date();
    await this.invoiceRepository.save(invoice);
  }

  async send(id: string, sentBy?: string): Promise<Invoice> {
    const invoice = await this.findOne(id);
    invoice.status = InvoiceStatus.SENT;
    invoice.sentAt = new Date();
    if (sentBy) {
      invoice.sentBy = sentBy;
    }
    return await this.invoiceRepository.save(invoice);
  }

  async recordPayment(id: string, paymentDto: RecordPaymentDto): Promise<Invoice> {
    const invoice = await this.findOne(id);

    const newPaidAmount = Number(invoice.paidAmount) + Number(paymentDto.amount);
    const balanceDue = Number(invoice.totalAmount) - newPaidAmount;

    invoice.paidAmount = newPaidAmount;
    invoice.balanceDue = balanceDue;
    if (paymentDto.paymentMethod) {
      invoice.paymentMethod = paymentDto.paymentMethod;
    }
    if (paymentDto.paymentReference) {
      invoice.paymentReference = paymentDto.paymentReference;
    }
    if (paymentDto.paymentMethod) {
      invoice.paymentMethod = paymentDto.paymentMethod;
    }
    if (paymentDto.paymentReference) {
      invoice.paymentReference = paymentDto.paymentReference;
    }

    if (balanceDue <= 0) {
      invoice.status = InvoiceStatus.PAID;
      invoice.paidAt = new Date();
    } else if (newPaidAmount > 0) {
      invoice.status = InvoiceStatus.PARTIAL;
    }

    return await this.invoiceRepository.save(invoice);
  }

  async generatePdf(id: string): Promise<{ url: string }> {
    const invoice = await this.findOneWithItems(id);

    // Mock PDF generation logic
    // In a real implementation, this would call a PDF service (e.g., Puppeteer, PDFKit)
    this.logger.log(`Generating PDF for invoice ${id}`);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 500));

    const pdfUrl = `/invoices/${id}/invoice-${invoice.invoiceNumber}.pdf`;

    invoice.pdfUrl = pdfUrl;
    await this.invoiceRepository.save(invoice);

    return { url: pdfUrl };
  }

  async getOverdueInvoices(): Promise<Invoice[]> {
    const today = new Date().toISOString().split('T')[0];

    return await this.invoiceRepository
      .createQueryBuilder('invoice')
      .where('invoice.dueDate < :today', { today })
      .andWhere('invoice.status NOT IN (:...statuses)', {
        statuses: [InvoiceStatus.PAID, InvoiceStatus.WRITTEN_OFF],
      })
      .andWhere('invoice.deletedAt IS NULL')
      .orderBy('invoice.dueDate', 'ASC')
      .getMany();
  }

  async getArAgingReport(): Promise<{
    current: number;
    days30: number;
    days60: number;
    days90: number;
    over90: number;
    total: number;
  }> {
    const today = new Date();
    const invoices = await this.invoiceRepository.find({
      where: { deletedAt: IsNull() },
    });

    const unpaidInvoices = invoices.filter(
      (inv) => inv.status !== InvoiceStatus.PAID && inv.status !== InvoiceStatus.WRITTEN_OFF,
    );

    const aging = {
      current: 0,
      days30: 0,
      days60: 0,
      days90: 0,
      over90: 0,
      total: 0,
    };

    unpaidInvoices.forEach((invoice) => {
      const dueDate = new Date(invoice.dueDate);
      const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      const balance = Number(invoice.balanceDue);

      aging.total += balance;

      if (daysOverdue <= 0) {
        aging.current += balance;
      } else if (daysOverdue <= 30) {
        aging.days30 += balance;
      } else if (daysOverdue <= 60) {
        aging.days60 += balance;
      } else if (daysOverdue <= 90) {
        aging.days90 += balance;
      } else {
        aging.over90 += balance;
      }
    });

    return aging;
  }
}
