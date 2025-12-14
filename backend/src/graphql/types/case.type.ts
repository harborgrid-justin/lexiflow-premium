import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { UserType } from './user.type';
import { DocumentType } from './document.type';

export enum CaseStatus {
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  PENDING = 'PENDING',
  ARCHIVED = 'ARCHIVED',
}

export enum CaseCategory {
  CIVIL = 'CIVIL',
  CRIMINAL = 'CRIMINAL',
  FAMILY = 'FAMILY',
  CORPORATE = 'CORPORATE',
  INTELLECTUAL_PROPERTY = 'INTELLECTUAL_PROPERTY',
  IMMIGRATION = 'IMMIGRATION',
  REAL_ESTATE = 'REAL_ESTATE',
  EMPLOYMENT = 'EMPLOYMENT',
}

registerEnumType(CaseStatus, { name: 'CaseStatus' });
registerEnumType(CaseCategory, { name: 'CaseCategory' });

@ObjectType()
export class PartyType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  role: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class CaseTeamMemberType {
  @Field(() => ID)
  id: string;

  @Field(() => UserType)
  user: UserType;

  @Field()
  role: string;

  @Field({ nullable: true })
  billable?: boolean;

  @Field(() => Date)
  joinedAt: Date;
}

@ObjectType()
export class CasePhaseType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  status: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Date)
  startDate: Date;

  @Field(() => Date, { nullable: true })
  endDate?: Date;

  @Field(() => Date)
  createdAt: Date;
}

@ObjectType()
export class MotionType {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  type: string;

  @Field()
  status: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Date)
  filedDate: Date;

  @Field(() => Date, { nullable: true })
  hearingDate?: Date;

  @Field(() => Date)
  createdAt: Date;
}

@ObjectType()
export class DocketEntryType {
  @Field(() => ID)
  id: string;

  @Field()
  entryNumber: string;

  @Field()
  description: string;

  @Field(() => Date)
  filedDate: Date;

  @Field({ nullable: true })
  filedBy?: string;

  @Field(() => Date)
  createdAt: Date;
}

@ObjectType()
export class CaseType {
  @Field(() => ID)
  id: string;

  @Field()
  caseNumber: string;

  @Field()
  title: string;

  @Field(() => CaseType)
  type: CaseType;

  @Field(() => CaseStatus)
  status: CaseStatus;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  court?: string;

  @Field({ nullable: true })
  jurisdiction?: string;

  @Field(() => Date, { nullable: true })
  filingDate?: Date;

  @Field(() => Date, { nullable: true })
  closedDate?: Date;

  @Field(() => [PartyType], { nullable: true })
  parties?: PartyType[];

  @Field(() => [CaseTeamMemberType], { nullable: true })
  teamMembers?: CaseTeamMemberType[];

  @Field(() => [CasePhaseType], { nullable: true })
  phases?: CasePhaseType[];

  @Field(() => [MotionType], { nullable: true })
  motions?: MotionType[];

  @Field(() => [DocketEntryType], { nullable: true })
  docketEntries?: DocketEntryType[];

  @Field(() => [DocumentType], { nullable: true })
  documents?: DocumentType[];

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => UserType)
  createdBy: UserType;
}

@ObjectType()
export class CaseEdge {
  @Field(() => CaseType)
  node: CaseType;

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
export class CaseConnection {
  @Field(() => [CaseEdge])
  edges: CaseEdge[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;

  @Field()
  totalCount: number;
}

@ObjectType()
export class CaseMetrics {
  @Field()
  totalCases: number;

  @Field()
  activeCases: number;

  @Field()
  closedCases: number;

  @Field()
  pendingCases: number;

  @Field(() => [CaseTypeMetric])
  byType: CaseTypeMetric[];

  @Field(() => [CaseStatusMetric])
  byStatus: CaseStatusMetric[];
}

@ObjectType()
export class CaseTypeMetric {
  @Field()
  type: string;

  @Field()
  count: number;
}

@ObjectType()
export class CaseStatusMetric {
  @Field()
  status: string;

  @Field()
  count: number;
}
