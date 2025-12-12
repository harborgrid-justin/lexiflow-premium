import { Module } from '@nestjs/common';
import { TimeEntriesModule } from './time-entries/time-entries.module';
import { InvoicesModule } from './invoices/invoices.module';
import { RateTablesModule } from './rate-tables/rate-tables.module';
import { TrustAccountsModule } from './trust-accounts/trust-accounts.module';
import { ExpensesModule } from './expenses/expenses.module';
import { FeeAgreementsModule } from './fee-agreements/fee-agreements.module';
import { BillingAnalyticsModule } from './analytics/billing-analytics.module';

@Module({
  imports: [
    TimeEntriesModule,
    InvoicesModule,
    RateTablesModule,
    TrustAccountsModule,
    ExpensesModule,
    FeeAgreementsModule,
    BillingAnalyticsModule,
  ],
  exports: [
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
