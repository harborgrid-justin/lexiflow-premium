import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimeEntry } from '../../../billing/time-entries/entities/time-entry.entity';
import { Invoice } from '../../../billing/invoices/entities/invoice.entity';
import { Expense } from '../../../billing/expenses/entities/expense.entity';
import { Case } from '../../../cases/entities/case.entity';
import { User } from '../../../entities/user.entity';
import { Client } from '../../../entities/client.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class BillingSeeder {
  private readonly logger = new Logger(BillingSeeder.name);

  constructor(
    @InjectRepository(TimeEntry)
    private readonly timeEntryRepository: Repository<TimeEntry>,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    @InjectRepository(Case)
    private readonly caseRepository: Repository<Case>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  async seed(): Promise<void> {
    this.logger.log('Starting billing seeding...');

    try {
      await this.seedTimeEntries();
      await this.seedInvoices();
      await this.seedExpenses();

      this.logger.log('Successfully completed billing seeding');
    } catch (error) {
      this.logger.error(`Error seeding billing data: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async seedTimeEntries(): Promise<void> {
    const existingCount = await this.timeEntryRepository.count();
    if (existingCount > 0) {
      this.logger.log(`Time entries already exist (${existingCount}). Skipping seed.`);
      return;
    }

    const timeEntriesPath = path.join(__dirname, '../test-data/time-entries.json');
    const timeEntriesData = JSON.parse(fs.readFileSync(timeEntriesPath, 'utf8'));

    const cases = await this.caseRepository.find();
    const users = await this.userRepository.find();

    const timeEntries = [];
    for (const entryData of timeEntriesData) {
      if (!entryData.caseId && cases.length > 0) {
        entryData.caseId = cases[Math.floor(Math.random() * cases.length)].id;
      }
      if (!entryData.userId && users.length > 0) {
        entryData.userId = users[Math.floor(Math.random() * users.length)].id;
      }

      const timeEntry = this.timeEntryRepository.create(entryData);
      timeEntries.push(timeEntry);
    }

    await this.timeEntryRepository.save(timeEntries);
    this.logger.log(`Seeded ${timeEntries.length} time entries`);
  }

  private async seedInvoices(): Promise<void> {
    const existingCount = await this.invoiceRepository.count();
    if (existingCount > 0) {
      this.logger.log(`Invoices already exist (${existingCount}). Skipping seed.`);
      return;
    }

    const invoicesPath = path.join(__dirname, '../test-data/invoices.json');
    const invoicesData = JSON.parse(fs.readFileSync(invoicesPath, 'utf8'));

    const cases = await this.caseRepository.find();
    const clients = await this.clientRepository.find();

    const invoices = [];
    for (const invoiceData of invoicesData) {
      if (!invoiceData.caseId && cases.length > 0) {
        invoiceData.caseId = cases[Math.floor(Math.random() * cases.length)].id;
      }
      if (!invoiceData.clientId && clients.length > 0) {
        invoiceData.clientId = clients[Math.floor(Math.random() * clients.length)].id;
      }

      const invoice = this.invoiceRepository.create(invoiceData);
      invoices.push(invoice);
    }

    await this.invoiceRepository.save(invoices);
    this.logger.log(`Seeded ${invoices.length} invoices`);
  }

  private async seedExpenses(): Promise<void> {
    const existingCount = await this.expenseRepository.count();
    if (existingCount > 0) {
      this.logger.log(`Expenses already exist (${existingCount}). Skipping seed.`);
      return;
    }

    const expensesPath = path.join(__dirname, '../test-data/expenses.json');
    if (!fs.existsSync(expensesPath)) {
      this.logger.log('Expenses data file not found. Skipping.');
      return;
    }

    const expensesData = JSON.parse(fs.readFileSync(expensesPath, 'utf8'));

    const cases = await this.caseRepository.find();
    const users = await this.userRepository.find();

    const expenses = [];
    for (const expenseData of expensesData) {
      if (!expenseData.caseId && cases.length > 0) {
        expenseData.caseId = cases[Math.floor(Math.random() * cases.length)].id;
      }
      if (!expenseData.userId && users.length > 0) {
        expenseData.userId = users[Math.floor(Math.random() * users.length)].id;
      }

      const expense = this.expenseRepository.create(expenseData);
      expenses.push(expense);
    }

    await this.expenseRepository.save(expenses);
    this.logger.log(`Seeded ${expenses.length} expenses`);
  }

  async clear(): Promise<void> {
    this.logger.log('Clearing billing data...');
    await this.timeEntryRepository.clear();
    await this.invoiceRepository.clear();
    await this.expenseRepository.clear();
    this.logger.log('Billing data cleared');
  }
}
