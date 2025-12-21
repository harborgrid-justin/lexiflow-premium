import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { TimeEntryType, InvoiceType, RateTableType, FeeAgreementType } from '../types/billing.type';
import {
  CreateTimeEntryInput,
  UpdateTimeEntryInput,
  TimeEntryFilterInput,
  CreateInvoiceInput,
  InvoiceFilterInput,
} from '../inputs/billing.input';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { BillingService } from '../../billing/billing.service';
import { TimeEntriesService } from '../../billing/time-entries/time-entries.service';
import { InvoicesService } from '../../billing/invoices/invoices.service';
import { RateTablesService } from '../../billing/rate-tables/rate-tables.service';
import { FeeAgreementsService } from '../../billing/fee-agreements/fee-agreements.service';

@Resolver(() => TimeEntryType)
export class BillingResolver {
  constructor(
    private billingService: BillingService,
    private timeEntriesService: TimeEntriesService,
    private invoicesService: InvoicesService,
    private rateTablesService: RateTablesService,
    private feeAgreementsService: FeeAgreementsService,
  ) {}

  @Query(() => [TimeEntryType], { name: 'timeEntries' })
  @UseGuards(GqlAuthGuard)
  async getTimeEntries(
    @Args('filter', { nullable: true }) filter?: TimeEntryFilterInput,
  ): Promise<TimeEntryType[]> {
    if (filter?.caseId) {
      return this.billingService.findTimeEntriesByCaseId(filter.caseId) as any;
    }
    return this.billingService.findAllTimeEntries() as any;
  }

  @Query(() => TimeEntryType, { name: 'timeEntry', nullable: true })
  @UseGuards(GqlAuthGuard)
  async getTimeEntry(@Args('id', { type: () => ID }) id: string): Promise<TimeEntryType | null> {
    try {
      const timeEntry = await this.timeEntriesService.findOne(id);
      return timeEntry as any;
    } catch (error) {
      return null;
    }
  }

  @Mutation(() => TimeEntryType)
  @UseGuards(GqlAuthGuard)
  async createTimeEntry(
    @Args('input') input: CreateTimeEntryInput,
    @CurrentUser() user: any,
  ): Promise<TimeEntryType> {
    const timeEntryData = {
      ...input,
      userId: user?.id || 'system',
    };
    const timeEntry = await this.billingService.createTimeEntry(timeEntryData);
    return timeEntry as any;
  }

  @Mutation(() => TimeEntryType)
  @UseGuards(GqlAuthGuard)
  async updateTimeEntry(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateTimeEntryInput,
    @CurrentUser() user: any,
  ): Promise<TimeEntryType> {
    const timeEntry = await this.billingService.updateTimeEntry(id, input);
    return timeEntry as any;
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteTimeEntry(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    await this.billingService.deleteTimeEntry(id);
    return true;
  }

  @Query(() => [InvoiceType], { name: 'invoices' })
  @UseGuards(GqlAuthGuard)
  async getInvoices(
    @Args('filter', { nullable: true }) filter?: InvoiceFilterInput,
  ): Promise<InvoiceType[]> {
    // For now return all - can add filter support later
    return this.billingService.findAllInvoices() as any;
  }

  @Query(() => InvoiceType, { name: 'invoice', nullable: true })
  @UseGuards(GqlAuthGuard)
  async getInvoice(@Args('id', { type: () => ID }) id: string): Promise<InvoiceType | null> {
    try {
      const invoice = await this.billingService.findInvoiceById(id);
      return invoice as any;
    } catch (error) {
      return null;
    }
  }

  @Mutation(() => InvoiceType)
  @UseGuards(GqlAuthGuard)
  async createInvoice(
    @Args('input') input: CreateInvoiceInput,
    @CurrentUser() user: any,
  ): Promise<InvoiceType> {
    const invoiceData = {
      ...input,
      createdBy: user?.id || 'system',
    };
    const invoice = await this.billingService.createInvoice(invoiceData);
    return invoice as any;
  }

  @Mutation(() => InvoiceType)
  @UseGuards(GqlAuthGuard)
  async sendInvoice(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ): Promise<InvoiceType> {
    const invoice = await this.billingService.sendInvoice(id);
    return invoice as any;
  }

  @Mutation(() => InvoiceType)
  @UseGuards(GqlAuthGuard)
  async markInvoicePaid(
    @Args('id', { type: () => ID }) id: string,
    @Args('paidDate', { type: () => Date }) paidDate: Date,
    @CurrentUser() user: any,
  ): Promise<InvoiceType> {
    const invoice = await this.billingService.markInvoicePaid(id);
    return invoice as any;
  }

  @Query(() => [RateTableType], { name: 'rateTables' })
  @UseGuards(GqlAuthGuard)
  async getRateTables(): Promise<RateTableType[]> {
    const rateTables = await this.rateTablesService.findAll();
    return rateTables as any;
  }

  @Query(() => [FeeAgreementType], { name: 'feeAgreements' })
  @UseGuards(GqlAuthGuard)
  async getFeeAgreements(
    @Args('caseId', { type: () => ID, nullable: true }) caseId?: string,
  ): Promise<FeeAgreementType[]> {
    const agreements = await this.feeAgreementsService.findAll();
    // Filter by caseId if provided
    if (caseId) {
      return agreements.filter((a: any) => a.caseId === caseId) as any;
    }
    return agreements as any;
  }
}
