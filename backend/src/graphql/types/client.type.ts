import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { CaseType } from './case.type';

export enum ClientType {
  INDIVIDUAL = 'individual',
  CORPORATION = 'corporation',
  PARTNERSHIP = 'partnership',
  LLC = 'llc',
  NONPROFIT = 'nonprofit',
  GOVERNMENT = 'government',
  OTHER = 'other',
}

export enum ClientStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PROSPECTIVE = 'prospective',
  FORMER = 'former',
  BLOCKED = 'blocked',
}

export enum PaymentTerms {
  NET_15 = 'net_15',
  NET_30 = 'net_30',
  NET_45 = 'net_45',
  NET_60 = 'net_60',
  DUE_ON_RECEIPT = 'due_on_receipt',
  CUSTOM = 'custom',
}

registerEnumType(ClientType, { name: 'ClientType' });
registerEnumType(ClientStatus, { name: 'ClientStatus' });
registerEnumType(PaymentTerms, { name: 'PaymentTerms' });

@ObjectType()
export class ClientType {
  @Field(() => ID)
  id: string;

  @Field()
  clientNumber: string;

  @Field()
  name: string;

  @Field(() => ClientType)
  clientType: ClientType;

  @Field(() => ClientStatus)
  status: ClientStatus;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  fax?: string;

  @Field({ nullable: true })
  website?: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  city?: string;

  @Field({ nullable: true })
  state?: string;

  @Field({ nullable: true })
  zipCode?: string;

  @Field({ nullable: true })
  country?: string;

  @Field({ nullable: true })
  billingAddress?: string;

  @Field({ nullable: true })
  billingCity?: string;

  @Field({ nullable: true })
  billingState?: string;

  @Field({ nullable: true })
  billingZipCode?: string;

  @Field({ nullable: true })
  billingCountry?: string;

  @Field({ nullable: true })
  taxId?: string;

  @Field({ nullable: true })
  industry?: string;

  @Field(() => Date, { nullable: true })
  establishedDate?: Date;

  @Field({ nullable: true })
  primaryContactName?: string;

  @Field({ nullable: true })
  primaryContactEmail?: string;

  @Field({ nullable: true })
  primaryContactPhone?: string;

  @Field({ nullable: true })
  primaryContactTitle?: string;

  @Field({ nullable: true })
  accountManagerId?: string;

  @Field({ nullable: true })
  referralSource?: string;

  @Field(() => Date, { nullable: true })
  clientSince?: Date;

  @Field(() => PaymentTerms)
  paymentTerms: PaymentTerms;

  @Field({ nullable: true })
  preferredPaymentMethod?: string;

  @Field()
  creditLimit: number;

  @Field()
  currentBalance: number;

  @Field()
  totalBilled: number;

  @Field()
  totalPaid: number;

  @Field()
  totalCases: number;

  @Field()
  activeCases: number;

  @Field()
  isVip: boolean;

  @Field()
  requiresConflictCheck: boolean;

  @Field(() => Date, { nullable: true })
  lastConflictCheckDate?: Date;

  @Field()
  hasRetainer: boolean;

  @Field({ nullable: true })
  retainerAmount?: number;

  @Field({ nullable: true })
  retainerBalance?: number;

  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Field({ nullable: true })
  notes?: string;

  @Field(() => [CaseType], { nullable: true })
  cases?: CaseType[];

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class ClientEdge {
  @Field(() => ClientType)
  node: ClientType;

  @Field()
  cursor: string;
}

@ObjectType()
export class ClientConnection {
  @Field(() => [ClientEdge])
  edges: ClientEdge[];

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
export class ClientMetrics {
  @Field()
  totalClients: number;

  @Field()
  activeClients: number;

  @Field()
  prospectiveClients: number;

  @Field()
  formerClients: number;

  @Field()
  totalRevenue: number;

  @Field()
  outstandingBalance: number;

  @Field(() => [ClientTypeMetric])
  byType: ClientTypeMetric[];

  @Field(() => [ClientStatusMetric])
  byStatus: ClientStatusMetric[];
}

@ObjectType()
export class ClientTypeMetric {
  @Field()
  type: string;

  @Field()
  count: number;
}

@ObjectType()
export class ClientStatusMetric {
  @Field()
  status: string;

  @Field()
  count: number;
}
