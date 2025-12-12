import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { UserType } from './user.type';

export enum TimeEntryStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  BILLED = 'BILLED',
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  SENT = 'SENT',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

registerEnumType(TimeEntryStatus, { name: 'TimeEntryStatus' });
registerEnumType(InvoiceStatus, { name: 'InvoiceStatus' });

@ObjectType()
export class TimeEntryType {
  @Field(() => ID)
  id: string;

  @Field()
  description: string;

  @Field()
  hours: number;

  @Field()
  rate: string; // Money scalar

  @Field()
  amount: string; // Money scalar

  @Field(() => TimeEntryStatus)
  status: TimeEntryStatus;

  @Field(() => Date)
  entryDate: Date;

  @Field({ nullable: true })
  caseId?: string;

  @Field({ nullable: true })
  taskCode?: string;

  @Field({ nullable: true })
  activityCode?: string;

  @Field(() => Boolean)
  billable: boolean;

  @Field(() => UserType)
  user: UserType;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class InvoiceLineItemType {
  @Field(() => ID)
  id: string;

  @Field()
  description: string;

  @Field()
  quantity: number;

  @Field()
  rate: string; // Money scalar

  @Field()
  amount: string; // Money scalar

  @Field({ nullable: true })
  timeEntryId?: string;
}

@ObjectType()
export class InvoiceType {
  @Field(() => ID)
  id: string;

  @Field()
  invoiceNumber: string;

  @Field(() => InvoiceStatus)
  status: InvoiceStatus;

  @Field()
  subtotal: string; // Money scalar

  @Field()
  tax: string; // Money scalar

  @Field()
  total: string; // Money scalar

  @Field({ nullable: true })
  discount?: string; // Money scalar

  @Field(() => Date)
  invoiceDate: Date;

  @Field(() => Date)
  dueDate: Date;

  @Field(() => Date, { nullable: true })
  paidDate?: Date;

  @Field({ nullable: true })
  caseId?: string;

  @Field({ nullable: true })
  clientId?: string;

  @Field({ nullable: true })
  notes?: string;

  @Field(() => [InvoiceLineItemType])
  lineItems: InvoiceLineItemType[];

  @Field(() => UserType)
  createdBy: UserType;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class RateTableType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  role: string;

  @Field()
  rate: string; // Money scalar

  @Field({ nullable: true })
  effectiveDate?: Date;

  @Field({ nullable: true })
  expirationDate?: Date;

  @Field(() => Date)
  createdAt: Date;
}

@ObjectType()
export class FeeAgreementType {
  @Field(() => ID)
  id: string;

  @Field()
  type: string;

  @Field({ nullable: true })
  rate?: string; // Money scalar

  @Field({ nullable: true })
  percentage?: number;

  @Field({ nullable: true })
  flatFee?: string; // Money scalar

  @Field({ nullable: true })
  retainer?: string; // Money scalar

  @Field(() => Date)
  effectiveDate: Date;

  @Field(() => Date, { nullable: true })
  expirationDate?: Date;

  @Field({ nullable: true })
  terms?: string;

  @Field(() => Date)
  createdAt: Date;
}

@ObjectType()
export class TrustTransactionType {
  @Field(() => ID)
  id: string;

  @Field()
  type: string;

  @Field()
  amount: string; // Money scalar

  @Field()
  balance: string; // Money scalar

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  reference?: string;

  @Field(() => Date)
  transactionDate: Date;

  @Field(() => UserType)
  createdBy: UserType;

  @Field(() => Date)
  createdAt: Date;
}

@ObjectType()
export class ExpenseType {
  @Field(() => ID)
  id: string;

  @Field()
  description: string;

  @Field()
  amount: string; // Money scalar

  @Field()
  category: string;

  @Field({ nullable: true })
  vendor?: string;

  @Field({ nullable: true })
  caseId?: string;

  @Field(() => Date)
  expenseDate: Date;

  @Field()
  billable: boolean;

  @Field({ nullable: true })
  receiptUrl?: string;

  @Field(() => UserType)
  user: UserType;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class TimeEntryEdge {
  @Field(() => TimeEntryType)
  node: TimeEntryType;

  @Field()
  cursor: string;
}

@ObjectType()
export class TimeEntryConnection {
  @Field(() => [TimeEntryEdge])
  edges: TimeEntryEdge[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;

  @Field()
  totalCount: number;
}

@ObjectType()
export class InvoiceEdge {
  @Field(() => InvoiceType)
  node: InvoiceType;

  @Field()
  cursor: string;
}

@ObjectType()
export class InvoiceConnection {
  @Field(() => [InvoiceEdge])
  edges: InvoiceEdge[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;

  @Field()
  totalCount: number;
}

@ObjectType()
export class PageInfo {
  @Field()
  hasNextPage: boolean;

  @Field()
  hasPreviousPage: boolean;

  @Field({ nullable: true })
  startCursor?: string;

  @Field({ nullable: true })
  endCursor?: string;
}

@ObjectType()
export class BillingMetrics {
  @Field()
  totalTimeEntries: number;

  @Field()
  totalHours: number;

  @Field()
  totalBillable: string; // Money scalar

  @Field()
  totalExpenses: string; // Money scalar

  @Field()
  totalInvoiced: string; // Money scalar

  @Field()
  totalPaid: string; // Money scalar

  @Field()
  outstandingBalance: string; // Money scalar

  @Field()
  overdueInvoices: number;

  @Field(() => [BillingByStatusMetric])
  invoicesByStatus: BillingByStatusMetric[];
}

@ObjectType()
export class BillingByStatusMetric {
  @Field()
  status: string;

  @Field()
  count: number;

  @Field()
  amount: string; // Money scalar
}
