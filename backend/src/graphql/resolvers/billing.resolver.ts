import { Resolver, Query, Mutation, Args, ID } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import {
  TimeEntryType,
  InvoiceType,
  RateTableType,
  FeeAgreementType,
} from "@graphql/types/billing.type";
import {
  CreateTimeEntryInput,
  UpdateTimeEntryInput,
  TimeEntryFilterInput,
  CreateInvoiceInput,
  InvoiceFilterInput,
} from "@graphql/inputs/billing.input";
import { CurrentUser } from "@auth/decorators/current-user.decorator";
import { GqlAuthGuard } from "@auth/guards/gql-auth.guard";
import { BillingService } from "@billing/billing.service";
import { TimeEntriesService } from "@billing/time-entries/time-entries.service";
import { RateTablesService } from "@billing/rate-tables/rate-tables.service";
import { FeeAgreementsService } from "@billing/fee-agreements/fee-agreements.service";
import { AuthenticatedUser } from "@auth/interfaces/authenticated-user.interface";

@Resolver(() => TimeEntryType)
export class BillingResolver {
  constructor(
    private billingService: BillingService,
    private timeEntriesService: TimeEntriesService,
    private rateTablesService: RateTablesService,
    private feeAgreementsService: FeeAgreementsService
  ) {}

  @Query(() => [TimeEntryType], { name: "timeEntries" })
  @UseGuards(GqlAuthGuard)
  async getTimeEntries(
    @Args("filter", { nullable: true }) filter?: TimeEntryFilterInput
  ): Promise<TimeEntryType[]> {
    if (filter?.caseId) {
      return this.billingService.findTimeEntriesByCaseId(
        filter.caseId
      ) as unknown;
    }
    return this.billingService.findAllTimeEntries() as unknown;
  }

  @Query(() => TimeEntryType, { name: "timeEntry", nullable: true })
  @UseGuards(GqlAuthGuard)
  async getTimeEntry(
    @Args("id", { type: () => ID }) id: string
  ): Promise<TimeEntryType | null> {
    try {
      const timeEntry = await this.timeEntriesService.findOne(id);
      return timeEntry as unknown;
    } catch {
      return null;
    }
  }

  @Mutation(() => TimeEntryType)
  @UseGuards(GqlAuthGuard)
  async createTimeEntry(
    @Args("input") input: CreateTimeEntryInput,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<TimeEntryType> {
    const timeEntryData = {
      ...input,
      userId: user?.id || "system",
    };
    const timeEntry = await this.billingService.createTimeEntry(timeEntryData);
    return timeEntry as unknown;
  }

  @Mutation(() => TimeEntryType)
  @UseGuards(GqlAuthGuard)
  async updateTimeEntry(
    @Args("id", { type: () => ID }) id: string,
    @Args("input") input: UpdateTimeEntryInput,
    @CurrentUser() _user: AuthenticatedUser
  ): Promise<TimeEntryType> {
    const timeEntry = await this.billingService.updateTimeEntry(id, input);
    return timeEntry as unknown;
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteTimeEntry(
    @Args("id", { type: () => ID }) id: string,
    @CurrentUser() _user: AuthenticatedUser
  ): Promise<boolean> {
    await this.billingService.deleteTimeEntry(id);
    return true;
  }

  @Query(() => [InvoiceType], { name: "invoices" })
  @UseGuards(GqlAuthGuard)
  async getInvoices(
    @Args("_filter", { nullable: true }) _filter?: InvoiceFilterInput
  ): Promise<InvoiceType[]> {
    // For now return all - can add filter support later
    return this.billingService.findAllInvoices() as unknown;
  }

  @Query(() => InvoiceType, { name: "invoice", nullable: true })
  @UseGuards(GqlAuthGuard)
  async getInvoice(
    @Args("id", { type: () => ID }) id: string
  ): Promise<InvoiceType | null> {
    try {
      const invoice = await this.billingService.findInvoiceById(id);
      return invoice as unknown;
    } catch {
      return null;
    }
  }

  @Mutation(() => InvoiceType)
  @UseGuards(GqlAuthGuard)
  async createInvoice(
    @Args("input") input: CreateInvoiceInput,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<InvoiceType> {
    const invoiceData = {
      ...input,
      createdBy: user?.id || "system",
    };
    const invoice = await this.billingService.createInvoice(invoiceData);
    return invoice as unknown;
  }

  @Mutation(() => InvoiceType)
  @UseGuards(GqlAuthGuard)
  async sendInvoice(
    @Args("id", { type: () => ID }) id: string,
    @CurrentUser() _user: AuthenticatedUser
  ): Promise<InvoiceType> {
    const invoice = await this.billingService.sendInvoice(id);
    return invoice as unknown;
  }

  @Mutation(() => InvoiceType)
  @UseGuards(GqlAuthGuard)
  async markInvoicePaid(
    @Args("id", { type: () => ID }) id: string,
    @Args("_paidDate", { type: () => Date }) _paidDate: Date,
    @CurrentUser() _user: AuthenticatedUser
  ): Promise<InvoiceType> {
    const invoice = await this.billingService.markInvoicePaid(id);
    return invoice as unknown;
  }

  @Query(() => [RateTableType], { name: "rateTables" })
  @UseGuards(GqlAuthGuard)
  async getRateTables(): Promise<RateTableType[]> {
    const rateTables = await this.rateTablesService.findAll();
    return rateTables as unknown;
  }

  @Query(() => [FeeAgreementType], { name: "feeAgreements" })
  @UseGuards(GqlAuthGuard)
  async getFeeAgreements(
    @Args("caseId", { type: () => ID, nullable: true }) caseId?: string
  ): Promise<FeeAgreementType[]> {
    const agreements = await this.feeAgreementsService.findAll();
    // Filter by caseId if provided
    if (caseId) {
      return agreements.filter(
        (a: unknown) => (a as unknown).caseId === caseId
      ) as unknown;
    }
    return agreements as unknown;
  }
}
