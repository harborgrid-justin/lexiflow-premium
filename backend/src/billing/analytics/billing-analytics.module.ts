import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillingAnalyticsController } from './billing-analytics.controller';
import { BillingAnalyticsService } from './billing-analytics.service';
import { TimeEntry } from '@billing/time-entries/entities/time-entry.entity';
import { Expense } from '@billing/expenses/entities/expense.entity';
import { Invoice } from '@billing/invoices/entities/invoice.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TimeEntry, Expense, Invoice])],
  controllers: [BillingAnalyticsController],
  providers: [BillingAnalyticsService],
  exports: [BillingAnalyticsService],
})
export class BillingAnalyticsModule {}
