import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { BillingService } from './billing.service';
import { Invoice } from './entities/invoice.entity';
import { TimeEntry } from './entities/time-entry.entity';
import { Expense } from './entities/expense.entity';
import { it, describe, expect, jest, beforeEach } from '@jest/globals';

describe('BillingService', () => {
  let service: BillingService;
  let invoiceRepository: Repository<Invoice>;
  let timeEntryRepository: Repository<TimeEntry>;
  let expenseRepository: Repository<Expense>;

  const mockInvoice = {
    id: 'invoice-001',
    invoiceNumber: 'INV-2024-001',
    caseId: 'case-001',
    clientId: 'client-001',
    amount: 5000,
    status: 'draft',
    dueDate: new Date('2024-02-15'),
    createdAt: new Date(),
    updatedAt: new Date(),
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
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockExpense = {
    id: 'expense-001',
    caseId: 'case-001',
    description: 'Filing fee',
    amount: 150,
    category: 'Court Fees',
    date: new Date('2024-01-15'),
    billable: true,
    billed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockInvoiceRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockTimeEntryRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockExpenseRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingService,
        { provide: getRepositoryToken(Invoice), useValue: mockInvoiceRepository },
        { provide: getRepositoryToken(TimeEntry), useValue: mockTimeEntryRepository },
        { provide: getRepositoryToken(Expense), useValue: mockExpenseRepository },
      ],
    }).compile();

    service = module.get<BillingService>(BillingService);
    invoiceRepository = module.get<Repository<Invoice>>(getRepositoryToken(Invoice));
    timeEntryRepository = module.get<Repository<TimeEntry>>(getRepositoryToken(TimeEntry));
    expenseRepository = module.get<Repository<Expense>>(getRepositoryToken(Expense));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Invoice Operations', () => {
    describe('findAllInvoices', () => {
      it('should return all invoices', async () => {
        mockInvoiceRepository.find.mockResolvedValue([mockInvoice]);

        const result = await service.findAllInvoices();

        expect(result).toEqual([mockInvoice]);
        expect(mockInvoiceRepository.find).toHaveBeenCalled();
      });
    });

    describe('findInvoiceById', () => {
      it('should return an invoice by id', async () => {
        mockInvoiceRepository.findOne.mockResolvedValue(mockInvoice);

        const result = await service.findInvoiceById(mockInvoice.id);

        expect(result).toEqual(mockInvoice);
      });

      it('should throw NotFoundException if invoice not found', async () => {
        mockInvoiceRepository.findOne.mockResolvedValue(null);

        await expect(service.findInvoiceById('non-existent')).rejects.toThrow(
          NotFoundException,
        );
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

        mockInvoiceRepository.create.mockReturnValue(mockInvoice);
        mockInvoiceRepository.save.mockResolvedValue(mockInvoice);

        const result = await service.createInvoice(createDto);

        expect(result).toEqual(mockInvoice);
        expect(mockInvoiceRepository.create).toHaveBeenCalled();
        expect(mockInvoiceRepository.save).toHaveBeenCalled();
      });
    });

    describe('updateInvoice', () => {
      it('should update an invoice', async () => {
        const updateDto = { status: 'sent' };
        mockInvoiceRepository.findOne.mockResolvedValue(mockInvoice);
        mockInvoiceRepository.save.mockResolvedValue({ ...mockInvoice, ...updateDto });

        const result = await service.updateInvoice(mockInvoice.id, updateDto);

        expect(result.status).toBe('sent');
      });
    });

    describe('deleteInvoice', () => {
      it('should delete an invoice', async () => {
        mockInvoiceRepository.findOne.mockResolvedValue(mockInvoice);
        mockInvoiceRepository.delete.mockResolvedValue({ affected: 1 });

        await service.deleteInvoice(mockInvoice.id);

        expect(mockInvoiceRepository.delete).toHaveBeenCalledWith(mockInvoice.id);
      });
    });

    describe('sendInvoice', () => {
      it('should mark invoice as sent', async () => {
        mockInvoiceRepository.findOne.mockResolvedValue(mockInvoice);
        mockInvoiceRepository.save.mockResolvedValue({ ...mockInvoice, status: 'sent', sentAt: expect.any(Date) });

        const result = await service.sendInvoice(mockInvoice.id);

        expect(result.status).toBe('sent');
      });
    });

    describe('markInvoicePaid', () => {
      it('should mark invoice as paid', async () => {
        mockInvoiceRepository.findOne.mockResolvedValue({ ...mockInvoice, status: 'sent' });
        mockInvoiceRepository.save.mockResolvedValue({ ...mockInvoice, status: 'paid', paidAt: expect.any(Date) });

        const result = await service.markInvoicePaid(mockInvoice.id);

        expect(result.status).toBe('paid');
      });
    });
  });

  describe('Time Entry Operations', () => {
    describe('findAllTimeEntries', () => {
      it('should return all time entries', async () => {
        mockTimeEntryRepository.find.mockResolvedValue([mockTimeEntry]);

        const result = await service.findAllTimeEntries();

        expect(result).toEqual([mockTimeEntry]);
      });
    });

    describe('findTimeEntriesByCaseId', () => {
      it('should return time entries for a case', async () => {
        mockTimeEntryRepository.find.mockResolvedValue([mockTimeEntry]);

        const result = await service.findTimeEntriesByCaseId('case-001');

        expect(result).toEqual([mockTimeEntry]);
        expect(mockTimeEntryRepository.find).toHaveBeenCalledWith({
          where: { caseId: 'case-001' },
        });
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

        mockTimeEntryRepository.create.mockReturnValue(mockTimeEntry);
        mockTimeEntryRepository.save.mockResolvedValue(mockTimeEntry);

        const result = await service.createTimeEntry(createDto);

        expect(result).toEqual(mockTimeEntry);
        expect(result.amount).toBe(500);
      });
    });

    describe('updateTimeEntry', () => {
      it('should update a time entry', async () => {
        const updateDto = { hours: 3, rate: 200 };
        mockTimeEntryRepository.findOne.mockResolvedValue(mockTimeEntry);
        mockTimeEntryRepository.save.mockResolvedValue({ ...mockTimeEntry, hours: 3, amount: 600 });

        const result = await service.updateTimeEntry(mockTimeEntry.id, updateDto);

        expect(result.hours).toBe(3);
        expect(result.amount).toBe(600);
      });
    });

    describe('deleteTimeEntry', () => {
      it('should delete a time entry', async () => {
        mockTimeEntryRepository.findOne.mockResolvedValue(mockTimeEntry);
        mockTimeEntryRepository.delete.mockResolvedValue({ affected: 1 });

        await service.deleteTimeEntry(mockTimeEntry.id);

        expect(mockTimeEntryRepository.delete).toHaveBeenCalledWith(mockTimeEntry.id);
      });
    });

    describe('getUnbilledTimeEntries', () => {
      it('should return unbilled time entries for a case', async () => {
        mockTimeEntryRepository.find.mockResolvedValue([mockTimeEntry]);

        const result = await service.getUnbilledTimeEntries('case-001');

        expect(result).toEqual([mockTimeEntry]);
        expect(mockTimeEntryRepository.find).toHaveBeenCalledWith({
          where: { caseId: 'case-001', billed: false, billable: true },
        });
      });
    });
  });

  describe('Expense Operations', () => {
    describe('findAllExpenses', () => {
      it('should return all expenses', async () => {
        mockExpenseRepository.find.mockResolvedValue([mockExpense]);

        const result = await service.findAllExpenses();

        expect(result).toEqual([mockExpense]);
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

        mockExpenseRepository.create.mockReturnValue(mockExpense);
        mockExpenseRepository.save.mockResolvedValue(mockExpense);

        const result = await service.createExpense(createDto);

        expect(result).toEqual(mockExpense);
      });
    });

    describe('getUnbilledExpenses', () => {
      it('should return unbilled expenses for a case', async () => {
        mockExpenseRepository.find.mockResolvedValue([mockExpense]);

        const result = await service.getUnbilledExpenses('case-001');

        expect(result).toEqual([mockExpense]);
        expect(mockExpenseRepository.find).toHaveBeenCalledWith({
          where: { caseId: 'case-001', billed: false, billable: true },
        });
      });
    });
  });

  describe('generateInvoice', () => {
    it('should generate invoice from unbilled time and expenses', async () => {
      mockTimeEntryRepository.find.mockResolvedValue([mockTimeEntry]);
      mockExpenseRepository.find.mockResolvedValue([mockExpense]);
      mockInvoiceRepository.create.mockReturnValue({
        ...mockInvoice,
        amount: mockTimeEntry.amount + mockExpense.amount,
      });
      mockInvoiceRepository.save.mockResolvedValue({
        ...mockInvoice,
        amount: 650,
      });
      mockTimeEntryRepository.save.mockResolvedValue({ ...mockTimeEntry, billed: true });
      mockExpenseRepository.save.mockResolvedValue({ ...mockExpense, billed: true });

      const result = await service.generateInvoice('case-001', 'client-001');

      expect(result.amount).toBe(650);
    });
  });

  describe('getBillingSummary', () => {
    const mockQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getRawOne: jest.fn(),
    };

    it('should return billing summary for a case', async () => {
      mockTimeEntryRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getRawOne.mockResolvedValue({
        totalHours: 10,
        totalBilled: 2000,
        totalUnbilled: 500,
      });

      const result = await service.getBillingSummary('case-001');

      expect(result).toHaveProperty('totalHours');
      expect(result).toHaveProperty('totalBilled');
      expect(result).toHaveProperty('totalUnbilled');
    });
  });

  // Additional Tests - Edge Cases and Business Logic
  describe('Invoice Operations - edge cases', () => {
    it('should return empty array when no invoices exist', async () => {
      mockInvoiceRepository.find.mockResolvedValue([]);

      const result = await service.findAllInvoices();

      expect(result).toEqual([]);
    });

    it('should throw NotFoundException when updating non-existent invoice', async () => {
      mockInvoiceRepository.findOne.mockResolvedValue(null);

      await expect(service.updateInvoice('non-existent', { status: 'sent' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when deleting non-existent invoice', async () => {
      mockInvoiceRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteInvoice('non-existent')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when sending non-existent invoice', async () => {
      mockInvoiceRepository.findOne.mockResolvedValue(null);

      await expect(service.sendInvoice('non-existent')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when marking non-existent invoice as paid', async () => {
      mockInvoiceRepository.findOne.mockResolvedValue(null);

      await expect(service.markInvoicePaid('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('Time Entry Operations - edge cases', () => {
    it('should throw NotFoundException when updating non-existent time entry', async () => {
      mockTimeEntryRepository.findOne.mockResolvedValue(null);

      await expect(service.updateTimeEntry('non-existent', { hours: 5 })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when deleting non-existent time entry', async () => {
      mockTimeEntryRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteTimeEntry('non-existent')).rejects.toThrow(NotFoundException);
    });

    it('should calculate amount correctly when hours and rate are provided', async () => {
      const createDto = {
        caseId: 'case-001',
        userId: 'user-001',
        description: 'Work',
        hours: 5,
        rate: 150,
        date: new Date(),
      };

      const expectedEntry = { ...mockTimeEntry, hours: 5, rate: 150, amount: 750 };
      mockTimeEntryRepository.create.mockReturnValue(expectedEntry);
      mockTimeEntryRepository.save.mockResolvedValue(expectedEntry);

      const result = await service.createTimeEntry(createDto);

      expect(result.amount).toBe(750);
    });
  });

  describe('generateInvoice - edge cases', () => {
    it('should generate invoice with zero amount when no billable items', async () => {
      mockTimeEntryRepository.find.mockResolvedValue([]);
      mockExpenseRepository.find.mockResolvedValue([]);
      mockInvoiceRepository.create.mockReturnValue({ ...mockInvoice, amount: 0 });
      mockInvoiceRepository.save.mockResolvedValue({ ...mockInvoice, amount: 0 });

      const result = await service.generateInvoice('case-001', 'client-001');

      expect(result.amount).toBe(0);
    });
  });
});
