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

@Resolver(() => TimeEntryType)
export class BillingResolver {
  // Inject BillingService here
  // constructor(private billingService: BillingService) {}

  @Query(() => [TimeEntryType], { name: 'timeEntries' })
  @UseGuards(GqlAuthGuard)
  async getTimeEntries(
    @Args('filter', { nullable: true }) filter?: TimeEntryFilterInput,
  ): Promise<TimeEntryType[]> {
    // TODO: Implement with BillingService
    // return this.billingService.findAllTimeEntries(filter);
    return [];
  }

  @Query(() => TimeEntryType, { name: 'timeEntry', nullable: true })
  @UseGuards(GqlAuthGuard)
  async getTimeEntry(@Args('id', { type: () => ID }) id: string): Promise<TimeEntryType | null> {
    // TODO: Implement with BillingService
    // return this.billingService.findOneTimeEntry(id);
    return null;
  }

  @Mutation(() => TimeEntryType)
  @UseGuards(GqlAuthGuard)
  async createTimeEntry(
    @Args('input') input: CreateTimeEntryInput,
    @CurrentUser() user: any,
  ): Promise<TimeEntryType> {
    // TODO: Implement with BillingService
    // return this.billingService.createTimeEntry(input, user);
    throw new Error('Not implemented');
  }

  @Mutation(() => TimeEntryType)
  @UseGuards(GqlAuthGuard)
  async updateTimeEntry(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateTimeEntryInput,
    @CurrentUser() user: any,
  ): Promise<TimeEntryType> {
    // TODO: Implement with BillingService
    // return this.billingService.updateTimeEntry(id, input, user);
    throw new Error('Not implemented');
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteTimeEntry(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ): Promise<boolean> {
    // TODO: Implement with BillingService
    // await this.billingService.deleteTimeEntry(id, user);
    // return true;
    throw new Error('Not implemented');
  }

  @Query(() => [InvoiceType], { name: 'invoices' })
  @UseGuards(GqlAuthGuard)
  async getInvoices(
    @Args('filter', { nullable: true }) filter?: InvoiceFilterInput,
  ): Promise<InvoiceType[]> {
    // TODO: Implement with BillingService
    // return this.billingService.findAllInvoices(filter);
    return [];
  }

  @Query(() => InvoiceType, { name: 'invoice', nullable: true })
  @UseGuards(GqlAuthGuard)
  async getInvoice(@Args('id', { type: () => ID }) id: string): Promise<InvoiceType | null> {
    // TODO: Implement with BillingService
    // return this.billingService.findOneInvoice(id);
    return null;
  }

  @Mutation(() => InvoiceType)
  @UseGuards(GqlAuthGuard)
  async createInvoice(
    @Args('input') input: CreateInvoiceInput,
    @CurrentUser() user: any,
  ): Promise<InvoiceType> {
    // TODO: Implement with BillingService
    // return this.billingService.createInvoice(input, user);
    throw new Error('Not implemented');
  }

  @Mutation(() => InvoiceType)
  @UseGuards(GqlAuthGuard)
  async sendInvoice(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ): Promise<InvoiceType> {
    // TODO: Implement with BillingService
    // return this.billingService.sendInvoice(id, user);
    throw new Error('Not implemented');
  }

  @Mutation(() => InvoiceType)
  @UseGuards(GqlAuthGuard)
  async markInvoicePaid(
    @Args('id', { type: () => ID }) id: string,
    @Args('paidDate', { type: () => Date }) paidDate: Date,
    @CurrentUser() user: any,
  ): Promise<InvoiceType> {
    // TODO: Implement with BillingService
    // return this.billingService.markInvoicePaid(id, paidDate, user);
    throw new Error('Not implemented');
  }

  @Query(() => [RateTableType], { name: 'rateTables' })
  @UseGuards(GqlAuthGuard)
  async getRateTables(): Promise<RateTableType[]> {
    // TODO: Implement with BillingService
    return [];
  }

  @Query(() => [FeeAgreementType], { name: 'feeAgreements' })
  @UseGuards(GqlAuthGuard)
  async getFeeAgreements(
    @Args('caseId', { type: () => ID, nullable: true }) caseId?: string,
  ): Promise<FeeAgreementType[]> {
    // TODO: Implement with BillingService
    return [];
  }
}
