import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';

describe('Billing Invoice Flow (E2E)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let authToken: string;
  let createdCaseId: string;
  let createdClientId: string;
  let timeEntryIds: string[] = [];
  let expenseIds: string[] = [];
  let invoiceId: string;

  const testUser = {
    email: faker.internet.email(),
    password: 'SecurePass123!',
    firstName: 'Attorney',
    lastName: 'Test',
    role: 'ATTORNEY',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);

    await dataSource.query('DELETE FROM time_entries');
    await dataSource.query('DELETE FROM expenses');
    await dataSource.query('DELETE FROM invoices');
    await dataSource.query('DELETE FROM cases');
    await dataSource.query('DELETE FROM clients');
  });

  afterAll(async () => {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
    await app.close();
  });

  describe('Complete Invoice Lifecycle', () => {
    it('Step 1: Register and authenticate attorney', async () => {
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      expect(registerResponse.body).toHaveProperty('id');
      expect(registerResponse.body.email).toBe(testUser.email);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('access_token');
      expect(loginResponse.body).toHaveProperty('user');
      authToken = loginResponse.body.access_token;
    });

    it('Step 2: Create a client', async () => {
      const clientData = {
        clientType: 'INDIVIDUAL',
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        address: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zipCode: faker.location.zipCode(),
        country: 'USA',
      };

      const response = await request(app.getHttpServer())
        .post('/clients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(clientData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe(clientData.email);
      createdClientId = response.body.id;
    });

    it('Step 3: Create a case for the client', async () => {
      const caseData = {
        caseNumber: `CASE-${Date.now()}`,
        title: 'Contract Dispute Case',
        description: 'Client contract dispute requiring legal representation',
        caseType: 'CIVIL',
        status: 'OPEN',
        priority: 'HIGH',
        clientId: createdClientId,
        courtName: 'Superior Court',
        jurisdiction: 'California',
        filingDate: new Date().toISOString(),
      };

      const response = await request(app.getHttpServer())
        .post('/cases')
        .set('Authorization', `Bearer ${authToken}`)
        .send(caseData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.caseNumber).toBe(caseData.caseNumber);
      expect(response.body.clientId).toBe(createdClientId);
      createdCaseId = response.body.id;
    });

    it('Step 4: Create multiple billable time entries', async () => {
      const timeEntries = [
        {
          caseId: createdCaseId,
          description: 'Initial client consultation',
          hours: 2.5,
          rate: 350,
          date: new Date('2025-01-05').toISOString(),
          billable: true,
          taskType: 'CLIENT_MEETING',
        },
        {
          caseId: createdCaseId,
          description: 'Legal research on contract law',
          hours: 4.0,
          rate: 350,
          date: new Date('2025-01-06').toISOString(),
          billable: true,
          taskType: 'RESEARCH',
        },
        {
          caseId: createdCaseId,
          description: 'Draft demand letter',
          hours: 3.0,
          rate: 350,
          date: new Date('2025-01-08').toISOString(),
          billable: true,
          taskType: 'DRAFTING',
        },
        {
          caseId: createdCaseId,
          description: 'Internal case review (non-billable)',
          hours: 1.0,
          rate: 0,
          date: new Date('2025-01-09').toISOString(),
          billable: false,
          taskType: 'REVIEW',
        },
      ];

      for (const entry of timeEntries) {
        const response = await request(app.getHttpServer())
          .post('/billing/time-entries')
          .set('Authorization', `Bearer ${authToken}`)
          .send(entry)
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.caseId).toBe(createdCaseId);
        expect(response.body.hours).toBe(entry.hours);
        expect(response.body.billable).toBe(entry.billable);
        expect(response.body.invoiced).toBe(false);

        if (entry.billable) {
          timeEntryIds.push(response.body.id);
        }
      }

      expect(timeEntryIds.length).toBe(3);
    });

    it('Step 5: Create billable expenses', async () => {
      const expenses = [
        {
          caseId: createdCaseId,
          description: 'Court filing fees',
          amount: 450,
          category: 'COURT_FEES',
          date: new Date('2025-01-05').toISOString(),
          billable: true,
        },
        {
          caseId: createdCaseId,
          description: 'Legal research database subscription',
          amount: 125,
          category: 'RESEARCH',
          date: new Date('2025-01-06').toISOString(),
          billable: true,
        },
        {
          caseId: createdCaseId,
          description: 'Office supplies (non-billable)',
          amount: 25,
          category: 'OFFICE',
          date: new Date('2025-01-07').toISOString(),
          billable: false,
        },
      ];

      for (const expense of expenses) {
        const response = await request(app.getHttpServer())
          .post('/billing/expenses')
          .set('Authorization', `Bearer ${authToken}`)
          .send(expense)
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.caseId).toBe(createdCaseId);
        expect(response.body.amount).toBe(expense.amount);
        expect(response.body.billable).toBe(expense.billable);
        expect(response.body.invoiced).toBe(false);

        if (expense.billable) {
          expenseIds.push(response.body.id);
        }
      }

      expect(expenseIds.length).toBe(2);
    });

    it('Step 6: Verify unbilled items exist', async () => {
      const timeResponse = await request(app.getHttpServer())
        .get(`/billing/time-entries?caseId=${createdCaseId}&invoiced=false&billable=true`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(timeResponse.body.data.length).toBe(3);

      const expenseResponse = await request(app.getHttpServer())
        .get(`/billing/expenses?caseId=${createdCaseId}&invoiced=false&billable=true`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(expenseResponse.body.data.length).toBe(2);
    });

    it('Step 7: Create invoice with all unbilled items', async () => {
      const invoiceData = {
        caseId: createdCaseId,
        clientId: createdClientId,
        issueDate: new Date('2025-01-15').toISOString(),
        dueDate: new Date('2025-02-15').toISOString(),
        includeUnbilledTime: true,
        includeUnbilledExpenses: true,
        taxRate: 0.0875,
        notes: 'Monthly invoice for services rendered',
      };

      const response = await request(app.getHttpServer())
        .post('/billing/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invoiceData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('invoiceNumber');
      expect(response.body.invoiceNumber).toMatch(/^INV-\d{4}-\d{3,}$/);
      expect(response.body.status).toBe('DRAFT');
      expect(response.body.caseId).toBe(createdCaseId);
      expect(response.body.clientId).toBe(createdClientId);

      const expectedSubtotal = 2.5 * 350 + 4.0 * 350 + 3.0 * 350 + 450 + 125;
      expect(response.body.subtotal).toBe(expectedSubtotal);

      const expectedTax = Math.round(expectedSubtotal * 0.0875 * 100) / 100;
      expect(response.body.taxAmount).toBeCloseTo(expectedTax, 2);

      const expectedTotal = expectedSubtotal + expectedTax;
      expect(response.body.totalAmount).toBeCloseTo(expectedTotal, 2);

      expect(response.body.amountDue).toBe(response.body.totalAmount);
      expect(response.body.amountPaid).toBe(0);

      expect(response.body.lineItems.length).toBeGreaterThan(0);

      invoiceId = response.body.id;
    });

    it('Step 8: Verify time entries and expenses are marked as invoiced', async () => {
      for (const timeId of timeEntryIds) {
        const response = await request(app.getHttpServer())
          .get(`/billing/time-entries/${timeId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.invoiced).toBe(true);
        expect(response.body.invoiceId).toBe(invoiceId);
      }

      for (const expenseId of expenseIds) {
        const response = await request(app.getHttpServer())
          .get(`/billing/expenses/${expenseId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.invoiced).toBe(true);
        expect(response.body.invoiceId).toBe(invoiceId);
      }
    });

    it('Step 9: Send invoice to client', async () => {
      const response = await request(app.getHttpServer())
        .post(`/billing/invoices/${invoiceId}/send`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('SENT');
      expect(response.body.sentDate).toBeDefined();
      expect(new Date(response.body.sentDate)).toBeInstanceOf(Date);
    });

    it('Step 10: Attempt to modify sent invoice (should fail)', async () => {
      const updateData = {
        notes: 'Attempting to modify sent invoice',
      };

      await request(app.getHttpServer())
        .patch(`/billing/invoices/${invoiceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);
    });

    it('Step 11: Record partial payment', async () => {
      const invoiceResponse = await request(app.getHttpServer())
        .get(`/billing/invoices/${invoiceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const partialAmount = Math.round(invoiceResponse.body.totalAmount / 2);

      const paymentData = {
        amount: partialAmount,
        paymentMethod: 'CREDIT_CARD',
        transactionId: `txn-${Date.now()}`,
        paymentDate: new Date('2025-01-20').toISOString(),
        notes: 'Partial payment via credit card',
      };

      const response = await request(app.getHttpServer())
        .post(`/billing/invoices/${invoiceId}/payments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData)
        .expect(200);

      expect(response.body.status).toBe('PARTIALLY_PAID');
      expect(response.body.amountPaid).toBe(partialAmount);
      expect(response.body.amountDue).toBeCloseTo(
        invoiceResponse.body.totalAmount - partialAmount,
        2,
      );
    });

    it('Step 12: Record final payment', async () => {
      const invoiceResponse = await request(app.getHttpServer())
        .get(`/billing/invoices/${invoiceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const remainingAmount = invoiceResponse.body.amountDue;

      const paymentData = {
        amount: remainingAmount,
        paymentMethod: 'BANK_TRANSFER',
        transactionId: `txn-${Date.now()}`,
        paymentDate: new Date('2025-02-01').toISOString(),
        notes: 'Final payment via bank transfer',
      };

      const response = await request(app.getHttpServer())
        .post(`/billing/invoices/${invoiceId}/payments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData)
        .expect(200);

      expect(response.body.status).toBe('PAID');
      expect(response.body.amountDue).toBe(0);
      expect(response.body.paidDate).toBeDefined();
      expect(new Date(response.body.paidDate)).toBeInstanceOf(Date);
    });

    it('Step 13: Download invoice PDF', async () => {
      const response = await request(app.getHttpServer())
        .get(`/billing/invoices/${invoiceId}/pdf`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.headers['content-type']).toBe('application/pdf');
      expect(response.headers['content-disposition']).toContain(
        'attachment; filename=',
      );
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('Step 14: Verify invoice appears in case billing history', async () => {
      const response = await request(app.getHttpServer())
        .get(`/cases/${createdCaseId}/invoices`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body.find((inv: any) => inv.id === invoiceId)).toBeDefined();
    });

    it('Step 15: Verify invoice in billing reports', async () => {
      const response = await request(app.getHttpServer())
        .get('/billing/reports/revenue?startDate=2025-01-01&endDate=2025-12-31')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalRevenue');
      expect(response.body.totalRevenue).toBeGreaterThan(0);
    });
  });

  describe('Invoice Error Handling', () => {
    it('should prevent creating invoice with no billable items', async () => {
      const newCaseResponse = await request(app.getHttpServer())
        .post('/cases')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          caseNumber: `CASE-${Date.now()}`,
          title: 'Empty Case',
          caseType: 'CIVIL',
          status: 'OPEN',
          clientId: createdClientId,
        })
        .expect(201);

      const invoiceData = {
        caseId: newCaseResponse.body.id,
        clientId: createdClientId,
        issueDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        includeUnbilledTime: true,
        includeUnbilledExpenses: true,
      };

      await request(app.getHttpServer())
        .post('/billing/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invoiceData)
        .expect(400);
    });

    it('should prevent payment exceeding invoice total', async () => {
      const invoiceResponse = await request(app.getHttpServer())
        .get(`/billing/invoices/${invoiceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const excessPayment = {
        amount: invoiceResponse.body.totalAmount + 1000,
        paymentMethod: 'CASH',
        transactionId: `txn-${Date.now()}`,
        paymentDate: new Date().toISOString(),
      };

      await request(app.getHttpServer())
        .post(`/billing/invoices/${invoiceId}/payments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(excessPayment)
        .expect(400);
    });

    it('should prevent voiding paid invoices', async () => {
      await request(app.getHttpServer())
        .post(`/billing/invoices/${invoiceId}/void`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  describe('Invoice Authorization', () => {
    it('should prevent unauthorized access to invoices', async () => {
      await request(app.getHttpServer())
        .get(`/billing/invoices/${invoiceId}`)
        .expect(401);
    });

    it('should prevent access with invalid token', async () => {
      await request(app.getHttpServer())
        .get(`/billing/invoices/${invoiceId}`)
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('Performance Tests', () => {
    it('should handle bulk time entry creation efficiently', async () => {
      const bulkEntries = Array.from({ length: 50 }, (_, i) => ({
        caseId: createdCaseId,
        description: `Bulk time entry ${i + 1}`,
        hours: Math.random() * 8,
        rate: 350,
        date: new Date(2025, 0, i + 1).toISOString(),
        billable: true,
        taskType: 'RESEARCH',
      }));

      const startTime = Date.now();

      for (const entry of bulkEntries) {
        await request(app.getHttpServer())
          .post('/billing/time-entries')
          .set('Authorization', `Bearer ${authToken}`)
          .send(entry)
          .expect(201);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(10000);
    });
  });
});
