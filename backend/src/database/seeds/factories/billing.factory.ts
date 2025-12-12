import { faker } from '@faker-js/faker';
import { DataFactory } from './data-factory';

export interface BillingFactoryOptions {
  billable?: boolean;
  status?: string;
}

export class BillingFactory {
  /**
   * Generate a random time entry
   */
  static generateTimeEntry(userId: string, caseId: string, options: BillingFactoryOptions = {}): any {
    const date = faker.date.recent({ days: 60 });
    const duration = faker.number.float({ min: 0.25, max: 12, multipleOf: 0.25 });
    const role = faker.helpers.arrayElement([
      'partner',
      'senior_associate',
      'associate',
      'junior_associate',
      'paralegal',
    ]);
    const rate = DataFactory.generateBillingRate(role);
    const total = duration * rate;

    const status = options.status || faker.helpers.arrayElement([
      'Draft',
      'Submitted',
      'Approved',
      'Billed',
    ]);

    return {
      caseId,
      userId,
      date: date.toISOString().split('T')[0],
      duration,
      description: DataFactory.generateTimeEntryDescription(),
      activity: faker.helpers.arrayElement([
        'Research',
        'Court Appearance',
        'Client Meeting',
        'Document Review',
        'Drafting',
        'Phone Conference',
        'Email Correspondence',
        'Trial Preparation',
      ]),
      ledesCode: `L${faker.number.int({ min: 100, max: 999 })}`,
      rate,
      total,
      status,
      billable: options.billable ?? faker.datatype.boolean({ probability: 0.9 }),
      taskCode: `TASK-${faker.string.alphanumeric(6)}`,
      discount: faker.datatype.boolean({ probability: 0.1 }) ? faker.number.int({ min: 5, max: 20 }) : 0,
      phaseCode: faker.helpers.arrayElement(['Discovery', 'Trial', 'Appeal', 'Settlement']),
    };
  }

  /**
   * Generate multiple time entries
   */
  static generateTimeEntries(userId: string, caseId: string, count: number, options: BillingFactoryOptions = {}): any[] {
    const entries = [];
    for (let i = 0; i < count; i++) {
      entries.push(this.generateTimeEntry(userId, caseId, options));
    }
    return entries;
  }

  /**
   * Generate a random expense
   */
  static generateExpense(userId: string, caseId: string, options: BillingFactoryOptions = {}): any {
    const category = faker.helpers.arrayElement([
      'Court Fees',
      'Filing Fees',
      'Expert Witness',
      'Deposition',
      'Travel',
      'Meals',
      'Lodging',
      'Copies',
      'Postage',
      'Research',
      'Transcripts',
      'Process Service',
      'Technology',
      'Other',
    ]);

    const amount = this.getAmountForCategory(category);
    const status = options.status || faker.helpers.arrayElement([
      'Draft',
      'Submitted',
      'Approved',
      'Billed',
      'Reimbursed',
    ]);

    return {
      caseId,
      userId,
      expenseDate: faker.date.recent({ days: 60 }).toISOString().split('T')[0],
      category,
      description: DataFactory.generateExpenseDescription(category.toLowerCase().replace(' ', '_')),
      amount,
      currency: 'USD',
      quantity: faker.number.int({ min: 1, max: 10 }),
      unitPrice: amount / faker.number.int({ min: 1, max: 10 }),
      status,
      billable: options.billable ?? true,
      reimbursable: faker.datatype.boolean({ probability: 0.3 }),
      vendor: faker.company.name(),
      receiptNumber: `RCT-${faker.string.alphanumeric(8).toUpperCase()}`,
      markup: faker.datatype.boolean({ probability: 0.2 }) ? faker.number.int({ min: 5, max: 15 }) : 0,
      glCode: `GL-${faker.number.int({ min: 1000, max: 9999 })}`,
      paymentMethod: faker.helpers.arrayElement(['Cash', 'Credit Card', 'Check', 'Wire Transfer']),
    };
  }

  /**
   * Generate multiple expenses
   */
  static generateExpenses(userId: string, caseId: string, count: number, options: BillingFactoryOptions = {}): any[] {
    const expenses = [];
    for (let i = 0; i < count; i++) {
      expenses.push(this.generateExpense(userId, caseId, options));
    }
    return expenses;
  }

  /**
   * Generate a random invoice
   */
  static generateInvoice(clientId: string, caseId: string, options: any = {}): any {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const sequence = faker.number.int({ min: 1, max: 999 });

    const invoiceDate = faker.date.recent({ days: 30 });
    const dueDate = new Date(invoiceDate);
    dueDate.setDate(dueDate.getDate() + 30);

    const subtotal = faker.number.float({ min: 5000, max: 150000, multipleOf: 0.01 });
    const taxRate = faker.datatype.boolean({ probability: 0.5 }) ? 0 : faker.number.float({ min: 0, max: 10, multipleOf: 0.01 });
    const taxAmount = subtotal * (taxRate / 100);
    const discountAmount = faker.datatype.boolean({ probability: 0.2 }) ? subtotal * 0.05 : 0;
    const totalAmount = subtotal + taxAmount - discountAmount;

    const status = faker.helpers.arrayElement([
      'Draft',
      'Sent',
      'Viewed',
      'Partial',
      'Paid',
      'Overdue',
    ]);

    const paidAmount = status === 'Paid' ? totalAmount : (status === 'Partial' ? totalAmount * 0.5 : 0);

    return {
      invoiceNumber: DataFactory.generateInvoiceNumber(year, month, sequence),
      caseId,
      clientId,
      clientName: faker.company.name(),
      matterDescription: 'Legal services for the period',
      invoiceDate: invoiceDate.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      periodStart: new Date(invoiceDate.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      periodEnd: invoiceDate.toISOString().split('T')[0],
      billingModel: faker.helpers.arrayElement(['Hourly', 'Fixed Fee', 'Contingency', 'Hybrid', 'Retainer']),
      status,
      subtotal,
      taxAmount,
      taxRate,
      discountAmount,
      totalAmount,
      paidAmount,
      balanceDue: totalAmount - paidAmount,
      timeCharges: subtotal * 0.8,
      expenseCharges: subtotal * 0.2,
      notes: 'Thank you for your business',
      terms: 'Payment due within 30 days',
      billingAddress: DataFactory.generateLegalAddress(),
      currency: 'USD',
      sentAt: status !== 'Draft' ? invoiceDate.toISOString() : null,
      viewedAt: (status === 'Viewed' || status === 'Paid') ? new Date(invoiceDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString() : null,
      paidAt: status === 'Paid' ? dueDate.toISOString() : null,
      paymentMethod: status === 'Paid' ? faker.helpers.arrayElement(['Check', 'Wire Transfer', 'Credit Card', 'ACH']) : null,
    };
  }

  /**
   * Generate multiple invoices
   */
  static generateInvoices(clientId: string, caseId: string, count: number, options: any = {}): any[] {
    const invoices = [];
    for (let i = 0; i < count; i++) {
      invoices.push(this.generateInvoice(clientId, caseId, options));
    }
    return invoices;
  }

  /**
   * Get amount for expense category
   */
  private static getAmountForCategory(category: string): number {
    const ranges = {
      'Court Fees': { min: 100, max: 1000 },
      'Filing Fees': { min: 50, max: 500 },
      'Expert Witness': { min: 1000, max: 10000 },
      'Deposition': { min: 500, max: 3000 },
      'Travel': { min: 100, max: 2000 },
      'Meals': { min: 20, max: 200 },
      'Lodging': { min: 100, max: 500 },
      'Copies': { min: 10, max: 500 },
      'Postage': { min: 5, max: 100 },
      'Research': { min: 50, max: 500 },
      'Transcripts': { min: 100, max: 1000 },
      'Process Service': { min: 50, max: 300 },
      'Technology': { min: 100, max: 1000 },
      'Other': { min: 10, max: 500 },
    };

    const range = ranges[category] || { min: 10, max: 500 };
    return faker.number.float({ min: range.min, max: range.max, multipleOf: 0.01 });
  }
}
