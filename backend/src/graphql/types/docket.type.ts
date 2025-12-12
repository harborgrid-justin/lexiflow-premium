import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { CaseType } from './case.type';
import { UserType } from './user.type';
import { DocumentType } from './document.type';

export enum DocketEntryType {
  PLEADING = 'PLEADING',
  MOTION = 'MOTION',
  ORDER = 'ORDER',
  NOTICE = 'NOTICE',
  JUDGMENT = 'JUDGMENT',
  DISCOVERY = 'DISCOVERY',
  CORRESPONDENCE = 'CORRESPONDENCE',
  EXHIBIT = 'EXHIBIT',
  TRANSCRIPT = 'TRANSCRIPT',
  MINUTE_ORDER = 'MINUTE_ORDER',
  STIPULATION = 'STIPULATION',
  BRIEF = 'BRIEF',
  MEMORANDUM = 'MEMORANDUM',
  OTHER = 'OTHER',
}

export enum DocketEntryStatus {
  FILED = 'FILED',
  PENDING = 'PENDING',
  SERVED = 'SERVED',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
}

registerEnumType(DocketEntryType, { name: 'DocketEntryType' });
registerEnumType(DocketEntryStatus, { name: 'DocketEntryStatus' });

@ObjectType()
export class DocketEntryType {
  @Field(() => ID)
  id: string;

  @Field()
  entryNumber: string;

  @Field()
  description: string;

  @Field(() => DocketEntryType)
  type: DocketEntryType;

  @Field(() => DocketEntryStatus)
  status: DocketEntryStatus;

  @Field(() => Date)
  filedDate: Date;

  @Field({ nullable: true })
  filedBy?: string;

  @Field({ nullable: true })
  filedByParty?: string;

  @Field({ nullable: true })
  servedOn?: string;

  @Field(() => Date, { nullable: true })
  servedDate?: Date;

  @Field({ nullable: true })
  notes?: string;

  @Field(() => ID)
  caseId: string;

  @Field(() => CaseType, { nullable: true })
  case?: CaseType;

  @Field(() => [DocumentType], { nullable: true })
  documents?: DocumentType[];

  @Field(() => UserType)
  createdBy: UserType;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class DocketEntryEdge {
  @Field(() => DocketEntryType)
  node: DocketEntryType;

  @Field()
  cursor: string;
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
export class DocketEntryConnection {
  @Field(() => [DocketEntryEdge])
  edges: DocketEntryEdge[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;

  @Field()
  totalCount: number;
}

@ObjectType()
export class DocketMetrics {
  @Field()
  totalEntries: number;

  @Field()
  entriesThisMonth: number;

  @Field()
  entriesThisWeek: number;

  @Field(() => [DocketTypeMetric])
  byType: DocketTypeMetric[];

  @Field(() => [DocketStatusMetric])
  byStatus: DocketStatusMetric[];
}

@ObjectType()
export class DocketTypeMetric {
  @Field()
  type: string;

  @Field()
  count: number;
}

@ObjectType()
export class DocketStatusMetric {
  @Field()
  status: string;

  @Field()
  count: number;
}
