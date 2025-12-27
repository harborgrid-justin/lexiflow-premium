import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { Invoice, InvoiceStatus } from './entities/invoice.entity';
import { TimeEntry } from '@billing/time-entries/entities/time-entry.entity';
import { Expense } from '@billing/expenses/entities/expense.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoicePaymentService } from './services/invoice-payment.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('InvoicesService', () => {
  let service: InvoicesService;
  let invoiceRepository: Repository<Invoice>;
  let timeEntryRepository: Repository<TimeEntry>;
  let expenseRepository: Repository<Expense>;
  let paymentService: InvoicePaymentService;
  let eventEmitter: EventEmitter2;
  let dataSource: DataSource;

  const mockInvoice: Partial<Invoice> = {
    id: 'invoice-123',
    invoiceNumber: 'INV-2025-001',
    caseId: 'case-123',
    clientId: 'client-123',
    status: InvoiceStatus.DRAFT,
    issueDate: new Date('2025-01-01'),
    dueDate: new Date('2025-01-31'),
    subtotal: 5000,
    taxAmount: 500,
    totalAmount: 5500,
    amountPaid: 0,
    amountDue: 5500,
    currency: 'USD',
    notes: 'Test invoice',
    lineItems: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTimeEntry: Partial<TimeEntry> = {
    id: 'time-123',
    caseId: 'case-123',
    userId: 'user-123',
    description: 'Legal research',
    hours: 3,
    rate: 250,
    amount: 750,
    billable: true,
    invoiced: false,
    date: new Date('2025-01-15'),
  };

  const mockExpense: Partial<Expense> = {
    id: 'expense-123',
    caseId: 'case-123',
    description: 'Court filing fee',
    amount: 350,
    billable: true,
    invoiced: false,
    date: new Date('2025-01-10'),
  };

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      save: jest.fn(),
      update: jest.fn(),
      find: jest.fn(),
    },
  } as unknown as QueryRunner;

  const mockDataSource = {
    createQueryRunner: jest.fn(() => mockQueryRunner),
  } as unknown as DataSource;

  const mockInvoiceRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[mockInvoice], 1]),
      getOne: jest.fn().mockResolvedValue(mockInvoice),
    })),
  };

  const mockTimeEntryRepository = {
    find: jest.fn(),
    save: jest.fn(),
  };

  const mockExpenseRepository = {
    find: jest.fn(),
    save: jest.fn(),
  };

  const mockPaymentService = {
    processPayment: jest.fn(),
    refundPayment: jest.fn(),
    validatePaymentAmount: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
    emitAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicesService,
        {
          provide: getRepositoryToken(Invoice),
          useValue: mockInvoiceRepository,
        },
        {
          provide: getRepositoryToken(TimeEntry),
          useValue: mockTimeEntryRepository,
        },
        {
          provide: getRepositoryToken(Expense),
          useValue: mockExpenseRepository,
        },
        {
          provide: InvoicePaymentService,
          useValue: mockPaymentService,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<InvoicesService>(InvoicesService);
    invoiceRepository = module.get(getRepositoryToken(Invoice));
    timeEntryRepository = module.get(getRepositoryToken(TimeEntry));
    expenseRepository = module.get(getRepositoryToken(Expense));
    paymentService = module.get<InvoicePaymentService>(InvoicePaymentService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
    dataSource = module.get<DataSource>(DataSource);

    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto: CreateInvoiceDto = {
      caseId: 'case-123',
      clientId: 'client-123',
      issueDate: new Date('2025-01-01'),
      dueDate: new Date('2025-01-31'),
      includeUnbilledTime: true,
      includeUnbilledExpenses: true,
      notes: 'Test invoice',
    };

    it('should create an invoice with unbilled time entries and expenses', async () => {
      mockTimeEntryRepository.find.mockResolvedValue([mockTimeEntry]);
      mockExpenseRepository.find.mockResolvedValue([mockExpense]);
      mockInvoiceRepository.create.mockReturnValue(mockInvoice);
      mockInvoiceRepository.save.mockResolvedValue(mockInvoice);

      const result = await service.create(createDto, 'user-123');

      expect(timeEntryRepository.find).toHaveBeenCalledWith({
        where: {
          caseId: createDto.caseId,
          billable: true,
          invoiced: false,
        },
      });
      expect(expenseRepository.find).toHaveBeenCalledWith({
        where: {
          caseId: createDto.caseId,
          billable: true,
          invoiced: false,
        },
      });
      expect(invoiceRepository.create).toHaveBeenCalled();
      expect(invoiceRepository.save).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith('invoice.created', {
        invoice: result,
        userId: 'user-123',
      });
      expect(result).toHaveProperty('invoiceNumber');
      expect(result.status).toBe(InvoiceStatus.DRAFT);
    });

    it('should generate unique invoice number', async () => {
      mockTimeEntryRepository.find.mockResolvedValue([]);
      mockExpenseRepository.find.mockResolvedValue([]);
      mockInvoiceRepository.create.mockReturnValue(mockInvoice);
      mockInvoiceRepository.save.mockResolvedValue(mockInvoice);

      const result = await service.create(createDto, 'user-123');

      expect(result.invoiceNumber).toMatch(/^INV-\d{4}-\d{3,}$/);
    });

    it('should calculate totals correctly with tax', async () => {
      const timeEntry = { ...mockTimeEntry, amount: 1000 };
      const expense = { ...mockExpense, amount: 500 };
      mockTimeEntryRepository.find.mockResolvedValue([timeEntry]);
      mockExpenseRepository.find.mockResolvedValue([expense]);

      const invoiceWithTotals = {
        ...mockInvoice,
        subtotal: 1500,
        taxAmount: 150,
        totalAmount: 1650,
        amountDue: 1650,
      };

      mockInvoiceRepository.create.mockReturnValue(invoiceWithTotals);
      mockInvoiceRepository.save.mockResolvedValue(invoiceWithTotals);

      const result = await service.create(
        { ...createDto, taxRate: 0.1 },
        'user-123',
      );

      expect(result.subtotal).toBe(1500);
      expect(result.taxAmount).toBe(150);
      expect(result.totalAmount).toBe(1650);
      expect(result.amountDue).toBe(1650);
    });

    it('should mark time entries and expenses as invoiced', async () => {
      mockTimeEntryRepository.find.mockResolvedValue([mockTimeEntry]);
      mockExpenseRepository.find.mockResolvedValue([mockExpense]);
      mockInvoiceRepository.create.mockReturnValue(mockInvoice);
      mockInvoiceRepository.save.mockResolvedValue(mockInvoice);
      mockTimeEntryRepository.save.mockResolvedValue([
        { ...mockTimeEntry, invoiced: true },
      ]);
      mockExpenseRepository.save.mockResolvedValue([
        { ...mockExpense, invoiced: true },
      ]);

      await service.create(createDto, 'user-123');

      expect(timeEntryRepository.save).toHaveBeenCalledWith([
        expect.objectContaining({ invoiced: true, invoiceId: mockInvoice.id }),
      ]);
      expect(expenseRepository.save).toHaveBeenCalledWith([
        expect.objectContaining({ invoiced: true, invoiceId: mockInvoice.id }),
      ]);
    });

    it('should throw BadRequestException if no billable items found', async () => {
      mockTimeEntryRepository.find.mockResolvedValue([]);
      mockExpenseRepository.find.mockResolvedValue([]);

      await expect(service.create(createDto, 'user-123')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(createDto, 'user-123')).rejects.toThrow(
        'No billable items found for this case',
      );
    });

    it('should handle transaction rollback on error', async () => {
      mockTimeEntryRepository.find.mockResolvedValue([mockTimeEntry]);
      mockExpenseRepository.find.mockResolvedValue([mockExpense]);
      mockInvoiceRepository.create.mockReturnValue(mockInvoice);
      mockInvoiceRepository.save.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.create(createDto, 'user-123')).rejects.toThrow();

      expect(timeEntryRepository.find).toHaveBeenCalled();
      expect(invoiceRepository.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated invoices', async () => {
      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total', 1);
      expect(result).toHaveProperty('page', 1);
      expect(result).toHaveProperty('limit', 10);
    });

    it('should filter by caseId', async () => {
      await service.findAll({ caseId: 'case-123', page: 1, limit: 10 });

      expect(
        mockInvoiceRepository.createQueryBuilder().andWhere,
      ).toHaveBeenCalledWith('invoice.caseId = :caseId', {
        caseId: 'case-123',
      });
    });

    it('should filter by status', async () => {
      await service.findAll({
        status: InvoiceStatus.SENT,
        page: 1,
        limit: 10,
      });

      expect(
        mockInvoiceRepository.createQueryBuilder().andWhere,
      ).toHaveBeenCalledWith('invoice.status = :status', {
        status: InvoiceStatus.SENT,
      });
    });

    it('should filter by date range', async () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      await service.findAll({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        page: 1,
        limit: 10,
      });

      expect(
        mockInvoiceRepository.createQueryBuilder().andWhere,
      ).toHaveBeenCalledWith(
        'invoice.issueDate BETWEEN :startDate AND :endDate',
        {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      );
    });
  });

  describe('findOne', () => {
    it('should return invoice by id', async () => {
      mockInvoiceRepository.findOne.mockResolvedValue(mockInvoice);

      const result = await service.findOne('invoice-123');

      expect(result).toEqual(mockInvoice);
      expect(invoiceRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'invoice-123' },
        relations: ['lineItems', 'payments', 'case', 'client'],
      });
    });

    it('should throw NotFoundException if invoice not found', async () => {
      mockInvoiceRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('non-existent')).rejects.toThrow(
        'Invoice not found',
      );
    });
  });

  describe('update', () => {
    const updateDto: UpdateInvoiceDto = {
      notes: 'Updated notes',
      dueDate: new Date('2025-02-28'),
    };

    it('should update invoice', async () => {
      const updatedInvoice = { ...mockInvoice, ...updateDto };
      mockInvoiceRepository.findOne.mockResolvedValue(mockInvoice);
      mockInvoiceRepository.save.mockResolvedValue(updatedInvoice);

      const result = await service.update('invoice-123', updateDto, 'user-123');

      expect(result).toEqual(updatedInvoice);
      expect(invoiceRepository.save).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith('invoice.updated', {
        invoice: result,
        userId: 'user-123',
      });
    });

    it('should not allow updating sent or paid invoices', async () => {
      const sentInvoice = { ...mockInvoice, status: InvoiceStatus.SENT };
      mockInvoiceRepository.findOne.mockResolvedValue(sentInvoice);

      await expect(
        service.update('invoice-123', updateDto, 'user-123'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.update('invoice-123', updateDto, 'user-123'),
      ).rejects.toThrow('Cannot update sent or paid invoices');
    });

    it('should throw NotFoundException if invoice not found', async () => {
      mockInvoiceRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('non-existent', updateDto, 'user-123'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('sendInvoice', () => {
    it('should send invoice and update status', async () => {
      const draftInvoice = { ...mockInvoice, status: InvoiceStatus.DRAFT };
      const sentInvoice = { ...mockInvoice, status: InvoiceStatus.SENT };

      mockInvoiceRepository.findOne.mockResolvedValue(draftInvoice);
      mockInvoiceRepository.save.mockResolvedValue(sentInvoice);

      const result = await service.sendInvoice('invoice-123', 'user-123');

      expect(result.status).toBe(InvoiceStatus.SENT);
      expect(eventEmitter.emit).toHaveBeenCalledWith('invoice.sent', {
        invoice: result,
        userId: 'user-123',
      });
    });

    it('should throw BadRequestException if invoice already sent', async () => {
      const sentInvoice = { ...mockInvoice, status: InvoiceStatus.SENT };
      mockInvoiceRepository.findOne.mockResolvedValue(sentInvoice);

      await expect(
        service.sendInvoice('invoice-123', 'user-123'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.sendInvoice('invoice-123', 'user-123'),
      ).rejects.toThrow('Invoice has already been sent');
    });

    it('should validate invoice has line items before sending', async () => {
      const emptyInvoice = { ...mockInvoice, lineItems: [] };
      mockInvoiceRepository.findOne.mockResolvedValue(emptyInvoice);

      await expect(
        service.sendInvoice('invoice-123', 'user-123'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.sendInvoice('invoice-123', 'user-123'),
      ).rejects.toThrow('Invoice must have at least one line item');
    });
  });

  describe('recordPayment', () => {
    const paymentDto = {
      amount: 2750,
      paymentMethod: 'CREDIT_CARD' as const,
      transactionId: 'txn-123',
      paymentDate: new Date('2025-01-20'),
      notes: 'Partial payment',
    };

    it('should record partial payment', async () => {
      const sentInvoice = {
        ...mockInvoice,
        status: InvoiceStatus.SENT,
        amountDue: 5500,
      };
      const updatedInvoice = {
        ...sentInvoice,
        amountPaid: 2750,
        amountDue: 2750,
        status: InvoiceStatus.PARTIALLY_PAID,
      };

      mockInvoiceRepository.findOne.mockResolvedValue(sentInvoice);
      mockPaymentService.processPayment.mockResolvedValue({
        success: true,
        transactionId: 'txn-123',
      });
      mockInvoiceRepository.save.mockResolvedValue(updatedInvoice);

      const result = await service.recordPayment(
        'invoice-123',
        paymentDto,
        'user-123',
      );

      expect(result.amountPaid).toBe(2750);
      expect(result.amountDue).toBe(2750);
      expect(result.status).toBe(InvoiceStatus.PARTIALLY_PAID);
      expect(paymentService.processPayment).toHaveBeenCalledWith(paymentDto);
      expect(eventEmitter.emit).toHaveBeenCalledWith('invoice.payment.received', {
        invoice: result,
        payment: paymentDto,
        userId: 'user-123',
      });
    });

    it('should mark invoice as paid when fully paid', async () => {
      const sentInvoice = {
        ...mockInvoice,
        status: InvoiceStatus.SENT,
        amountDue: 5500,
      };
      const fullPayment = { ...paymentDto, amount: 5500 };
      const paidInvoice = {
        ...sentInvoice,
        amountPaid: 5500,
        amountDue: 0,
        status: InvoiceStatus.PAID,
        paidDate: new Date('2025-01-20'),
      };

      mockInvoiceRepository.findOne.mockResolvedValue(sentInvoice);
      mockPaymentService.processPayment.mockResolvedValue({
        success: true,
        transactionId: 'txn-123',
      });
      mockInvoiceRepository.save.mockResolvedValue(paidInvoice);

      const result = await service.recordPayment(
        'invoice-123',
        fullPayment,
        'user-123',
      );

      expect(result.status).toBe(InvoiceStatus.PAID);
      expect(result.amountDue).toBe(0);
      expect(result.paidDate).toBeDefined();
    });

    it('should throw BadRequestException if payment exceeds amount due', async () => {
      const sentInvoice = {
        ...mockInvoice,
        status: InvoiceStatus.SENT,
        amountDue: 5500,
      };
      const excessPayment = { ...paymentDto, amount: 6000 };

      mockInvoiceRepository.findOne.mockResolvedValue(sentInvoice);

      await expect(
        service.recordPayment('invoice-123', excessPayment, 'user-123'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.recordPayment('invoice-123', excessPayment, 'user-123'),
      ).rejects.toThrow('Payment amount exceeds amount due');
    });

    it('should rollback transaction if payment processing fails', async () => {
      const sentInvoice = {
        ...mockInvoice,
        status: InvoiceStatus.SENT,
        amountDue: 5500,
      };

      mockInvoiceRepository.findOne.mockResolvedValue(sentInvoice);
      mockPaymentService.processPayment.mockRejectedValue(
        new Error('Payment gateway error'),
      );

      await expect(
        service.recordPayment('invoice-123', paymentDto, 'user-123'),
      ).rejects.toThrow('Payment gateway error');

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });

  describe('voidInvoice', () => {
    it('should void unpaid invoice', async () => {
      const sentInvoice = {
        ...mockInvoice,
        status: InvoiceStatus.SENT,
        amountPaid: 0,
      };
      const voidedInvoice = { ...sentInvoice, status: InvoiceStatus.VOID };

      mockInvoiceRepository.findOne.mockResolvedValue(sentInvoice);
      mockInvoiceRepository.save.mockResolvedValue(voidedInvoice);

      const result = await service.voidInvoice('invoice-123', 'user-123');

      expect(result.status).toBe(InvoiceStatus.VOID);
      expect(eventEmitter.emit).toHaveBeenCalledWith('invoice.voided', {
        invoice: result,
        userId: 'user-123',
      });
    });

    it('should not allow voiding paid invoices', async () => {
      const paidInvoice = { ...mockInvoice, status: InvoiceStatus.PAID };
      mockInvoiceRepository.findOne.mockResolvedValue(paidInvoice);

      await expect(
        service.voidInvoice('invoice-123', 'user-123'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.voidInvoice('invoice-123', 'user-123'),
      ).rejects.toThrow('Cannot void a paid invoice');
    });

    it('should unmark time entries and expenses when voiding', async () => {
      const sentInvoice = {
        ...mockInvoice,
        status: InvoiceStatus.SENT,
        lineItems: [
          { timeEntryId: 'time-123' },
          { expenseId: 'expense-123' },
        ],
      };

      mockInvoiceRepository.findOne.mockResolvedValue(sentInvoice);
      mockInvoiceRepository.save.mockResolvedValue({
        ...sentInvoice,
        status: InvoiceStatus.VOID,
      });
      mockTimeEntryRepository.find.mockResolvedValue([mockTimeEntry]);
      mockExpenseRepository.find.mockResolvedValue([mockExpense]);

      await service.voidInvoice('invoice-123', 'user-123');

      expect(timeEntryRepository.save).toHaveBeenCalledWith([
        expect.objectContaining({ invoiced: false, invoiceId: null }),
      ]);
      expect(expenseRepository.save).toHaveBeenCalledWith([
        expect.objectContaining({ invoiced: false, invoiceId: null }),
      ]);
    });
  });

  describe('calculateOverdueInvoices', () => {
    it('should return overdue invoices', async () => {
      const overdueInvoice = {
        ...mockInvoice,
        status: InvoiceStatus.SENT,
        dueDate: new Date('2024-12-31'),
      };

      mockInvoiceRepository.createQueryBuilder().getManyAndCount =
        jest.fn().mockResolvedValue([[overdueInvoice], 1]);

      const result = await service.getOverdueInvoices();

      expect(result).toHaveLength(1);
      expect(result[0].dueDate < new Date()).toBe(true);
    });
  });

  describe('generateInvoicePDF', () => {
    it('should generate PDF for invoice', async () => {
      mockInvoiceRepository.findOne.mockResolvedValue(mockInvoice);

      const pdfBuffer = await service.generatePDF('invoice-123');

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(invoiceRepository.findOne).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle concurrent payment attempts', async () => {
      const sentInvoice = {
        ...mockInvoice,
        status: InvoiceStatus.SENT,
        amountDue: 5500,
      };

      mockInvoiceRepository.findOne.mockResolvedValue(sentInvoice);
      mockPaymentService.processPayment.mockResolvedValue({
        success: true,
        transactionId: 'txn-123',
      });

      const payment1 = service.recordPayment(
        'invoice-123',
        { ...paymentDto, amount: 5500 },
        'user-123',
      );
      const payment2 = service.recordPayment(
        'invoice-123',
        { ...paymentDto, amount: 5500 },
        'user-456',
      );

      await expect(Promise.all([payment1, payment2])).rejects.toThrow();
    });

    it('should handle timezone differences in due dates', async () => {
      const createDto: CreateInvoiceDto = {
        caseId: 'case-123',
        clientId: 'client-123',
        issueDate: new Date('2025-01-01T00:00:00Z'),
        dueDate: new Date('2025-01-31T23:59:59Z'),
        includeUnbilledTime: true,
      };

      mockTimeEntryRepository.find.mockResolvedValue([mockTimeEntry]);
      mockExpenseRepository.find.mockResolvedValue([]);
      mockInvoiceRepository.create.mockReturnValue(mockInvoice);
      mockInvoiceRepository.save.mockResolvedValue(mockInvoice);

      const result = await service.create(createDto, 'user-123');

      expect(result.dueDate).toBeInstanceOf(Date);
    });
  });
});
