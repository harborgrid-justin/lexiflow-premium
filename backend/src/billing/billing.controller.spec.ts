import { Test, TestingModule } from '@nestjs/testing';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { jest } from '@jest/globals';

describe('BillingController', () => {
  let controller: BillingController;
  let service: BillingService;

  const mockInvoice = {
    id: 'invoice-001',
    invoiceNumber: 'INV-2024-001',
    caseId: 'case-001',
    clientId: 'client-001',
    amount: 5000,
    status: 'draft',
    dueDate: new Date('2024-02-15'),
  };

  const mockTimeEntry = {
    id: 'time-001',
    caseId: 'case-001',
    userId: 'user-001',
    description: 'Legal research',
    hours: 2.5,
    rate: 200,
    amount: 500,
    date: new Date('2024-01-15'),
    billable: true,
    billed: false,
  };

  const mockExpense = {
    id: 'expense-001',
    caseId: 'case-001',
    description: 'Filing fee',
    amount: 150,
    category: 'Court Fees',
    billable: true,
    billed: false,
  };

  const mockBillingService = {
    findAllInvoices: jest.fn().mockResolvedValue([mockInvoice]),
    findInvoiceById: jest.fn().mockResolvedValue(mockInvoice),
    createInvoice: jest.fn().mockResolvedValue(mockInvoice),
    updateInvoice: jest.fn().mockResolvedValue(mockInvoice),
    deleteInvoice: jest.fn().mockResolvedValue(undefined),
    sendInvoice: jest.fn().mockResolvedValue({ ...mockInvoice, status: 'sent' }),
    markInvoicePaid: jest.fn().mockResolvedValue({ ...mockInvoice, status: 'paid' }),
    findAllTimeEntries: jest.fn().mockResolvedValue([mockTimeEntry]),
    findTimeEntriesByCaseId: jest.fn().mockResolvedValue([mockTimeEntry]),
    createTimeEntry: jest.fn().mockResolvedValue(mockTimeEntry),
    updateTimeEntry: jest.fn().mockResolvedValue(mockTimeEntry),
    deleteTimeEntry: jest.fn().mockResolvedValue(undefined),
    getUnbilledTimeEntries: jest.fn().mockResolvedValue([mockTimeEntry]),
    findAllExpenses: jest.fn().mockResolvedValue([mockExpense]),
    createExpense: jest.fn().mockResolvedValue(mockExpense),
    getUnbilledExpenses: jest.fn().mockResolvedValue([mockExpense]),
    generateInvoice: jest.fn().mockResolvedValue(mockInvoice),
    getBillingSummary: jest.fn().mockResolvedValue({
      totalHours: 10,
      totalBilled: 2000,
      totalUnbilled: 500,
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BillingController],
      providers: [
        { provide: BillingService, useValue: mockBillingService },
      ],
    }).compile();

    controller = module.get<BillingController>(BillingController);
    service = module.get<BillingService>(BillingService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Invoice Endpoints', () => {
    describe('getAllInvoices', () => {
      it('should return all invoices', async () => {
        const result = await controller.getAllInvoices();

        expect(result).toEqual([mockInvoice]);
        expect(service.findAllInvoices).toHaveBeenCalled();
      });
    });

    describe('getInvoice', () => {
      it('should return an invoice by id', async () => {
        const result = await controller.getInvoice(mockInvoice.id);

        expect(result).toEqual(mockInvoice);
        expect(service.findInvoiceById).toHaveBeenCalledWith(mockInvoice.id);
      });
    });

    describe('createInvoice', () => {
      it('should create a new invoice', async () => {
        const createDto = {
          caseId: 'case-001',
          clientId: 'client-001',
          amount: 5000,
          dueDate: new Date('2024-02-15'),
        };

        const result = await controller.createInvoice(createDto);

        expect(result).toEqual(mockInvoice);
        expect(service.createInvoice).toHaveBeenCalledWith(createDto);
      });
    });

    describe('updateInvoice', () => {
      it('should update an invoice', async () => {
        const updateDto = { status: 'sent' };

        const result = await controller.updateInvoice(mockInvoice.id, updateDto);

        expect(result).toEqual(mockInvoice);
        expect(service.updateInvoice).toHaveBeenCalledWith(mockInvoice.id, updateDto);
      });
    });

    describe('deleteInvoice', () => {
      it('should delete an invoice', async () => {
        await controller.deleteInvoice(mockInvoice.id);

        expect(service.deleteInvoice).toHaveBeenCalledWith(mockInvoice.id);
      });
    });

    describe('sendInvoice', () => {
      it('should send an invoice', async () => {
        const result = await controller.sendInvoice(mockInvoice.id);

        expect(result.status).toBe('sent');
        expect(service.sendInvoice).toHaveBeenCalledWith(mockInvoice.id);
      });
    });

    describe('markPaid', () => {
      it('should mark invoice as paid', async () => {
        const result = await controller.markPaid(mockInvoice.id);

        expect(result.status).toBe('paid');
        expect(service.markInvoicePaid).toHaveBeenCalledWith(mockInvoice.id);
      });
    });
  });

  describe('Time Entry Endpoints', () => {
    describe('getAllTimeEntries', () => {
      it('should return all time entries', async () => {
        const result = await controller.getAllTimeEntries();

        expect(result).toEqual([mockTimeEntry]);
        expect(service.findAllTimeEntries).toHaveBeenCalled();
      });
    });

    describe('getTimeEntriesByCase', () => {
      it('should return time entries for a case', async () => {
        const result = await controller.getTimeEntriesByCase('case-001');

        expect(result).toEqual([mockTimeEntry]);
        expect(service.findTimeEntriesByCaseId).toHaveBeenCalledWith('case-001');
      });
    });

    describe('createTimeEntry', () => {
      it('should create a new time entry', async () => {
        const createDto = {
          caseId: 'case-001',
          userId: 'user-001',
          description: 'Legal research',
          hours: 2.5,
          rate: 200,
          date: new Date('2024-01-15'),
        };

        const result = await controller.createTimeEntry(createDto);

        expect(result).toEqual(mockTimeEntry);
        expect(service.createTimeEntry).toHaveBeenCalledWith(createDto);
      });
    });

    describe('updateTimeEntry', () => {
      it('should update a time entry', async () => {
        const updateDto = { hours: 3 };

        const result = await controller.updateTimeEntry(mockTimeEntry.id, updateDto);

        expect(result).toEqual(mockTimeEntry);
        expect(service.updateTimeEntry).toHaveBeenCalledWith(mockTimeEntry.id, updateDto);
      });
    });

    describe('deleteTimeEntry', () => {
      it('should delete a time entry', async () => {
        await controller.deleteTimeEntry(mockTimeEntry.id);

        expect(service.deleteTimeEntry).toHaveBeenCalledWith(mockTimeEntry.id);
      });
    });

    describe('getUnbilledTimeEntries', () => {
      it('should return unbilled time entries', async () => {
        const result = await controller.getUnbilledTimeEntries('case-001');

        expect(result).toEqual([mockTimeEntry]);
        expect(service.getUnbilledTimeEntries).toHaveBeenCalledWith('case-001');
      });
    });
  });

  describe('Expense Endpoints', () => {
    describe('getAllExpenses', () => {
      it('should return all expenses', async () => {
        const result = await controller.getAllExpenses();

        expect(result).toEqual([mockExpense]);
        expect(service.findAllExpenses).toHaveBeenCalled();
      });
    });

    describe('createExpense', () => {
      it('should create a new expense', async () => {
        const createDto = {
          caseId: 'case-001',
          description: 'Filing fee',
          amount: 150,
          category: 'Court Fees',
          date: new Date('2024-01-15'),
        };

        const result = await controller.createExpense(createDto);

        expect(result).toEqual(mockExpense);
        expect(service.createExpense).toHaveBeenCalledWith(createDto);
      });
    });

    describe('getUnbilledExpenses', () => {
      it('should return unbilled expenses', async () => {
        const result = await controller.getUnbilledExpenses('case-001');

        expect(result).toEqual([mockExpense]);
        expect(service.getUnbilledExpenses).toHaveBeenCalledWith('case-001');
      });
    });
  });

  describe('generateInvoice', () => {
    it('should generate invoice from unbilled items', async () => {
      const result = await controller.generateInvoice({ caseId: 'case-001', clientId: 'client-001' });

      expect(result).toEqual(mockInvoice);
      expect(service.generateInvoice).toHaveBeenCalledWith('case-001', 'client-001');
    });
  });

  describe('getBillingSummary', () => {
    it('should return billing summary for a case', async () => {
      const result = await controller.getBillingSummary('case-001');

      expect(result).toHaveProperty('totalHours', 10);
      expect(result).toHaveProperty('totalBilled', 2000);
      expect(result).toHaveProperty('totalUnbilled', 500);
    });
  });
});
