import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeEntriesModule } from './time-entries/time-entries.module';
import { InvoicesModule } from './invoices/invoices.module';
import { RateTablesModule } from './rate-tables/rate-tables.module';
import { TrustAccountsModule } from './trust-accounts/trust-accounts.module';
import { ExpensesModule } from './expenses/expenses.module';
import { FeeAgreementsModule } from './fee-agreements/fee-agreements.module';
import { BillingAnalyticsModule } from './analytics/billing-analytics.module';
import { Invoice } from './invoices/entities/invoice.entity';
import { TimeEntry } from './time-entries/entities/time-entry.entity';
import { Expense } from './expenses/entities/expense.entity';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice, TimeEntry, Expense]),
    TimeEntriesModule,
    InvoicesModule,
    RateTablesModule,
    TrustAccountsModule,
    ExpensesModule,
    FeeAgreementsModule,
    BillingAnalyticsModule,
  ],
  controllers: [BillingController],
  providers: [BillingService],
  exports: [
    BillingService,
    TimeEntriesModule,
    InvoicesModule,
    RateTablesModule,
    TrustAccountsModule,
    ExpensesModule,
    FeeAgreementsModule,
    BillingAnalyticsModule,
  ],
})
export class BillingModule {}
