import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { CaseType } from './case.type';
import { UserType } from './user.type';
import { DocumentType } from './document.type';

export enum MotionStatus {
  DRAFT = 'DRAFT',
  FILED = 'FILED',
  PENDING = 'PENDING',
  SCHEDULED = 'SCHEDULED',
  HEARD = 'HEARD',
  GRANTED = 'GRANTED',
  DENIED = 'DENIED',
  WITHDRAWN = 'WITHDRAWN',
  CONTINUED = 'CONTINUED',
}

export enum MotionType {
  SUMMARY_JUDGMENT = 'SUMMARY_JUDGMENT',
  DISMISS = 'DISMISS',
  COMPEL_DISCOVERY = 'COMPEL_DISCOVERY',
  PROTECTIVE_ORDER = 'PROTECTIVE_ORDER',
  PRELIMINARY_INJUNCTION = 'PRELIMINARY_INJUNCTION',
  TEMPORARY_RESTRAINING_ORDER = 'TEMPORARY_RESTRAINING_ORDER',
  CHANGE_VENUE = 'CHANGE_VENUE',
  STRIKE = 'STRIKE',
  AMEND = 'AMEND',
  CONTINUANCE = 'CONTINUANCE',
  SANCTIONS = 'SANCTIONS',
  IN_LIMINE = 'IN_LIMINE',
  NEW_TRIAL = 'NEW_TRIAL',
  RECONSIDERATION = 'RECONSIDERATION',
  OTHER = 'OTHER',
}

registerEnumType(MotionStatus, { name: 'MotionStatus' });
registerEnumType(MotionType, { name: 'MotionType' });

@ObjectType()
export class MotionHearingType {
  @Field(() => ID)
  id: string;

  @Field(() => Date)
  scheduledDate: Date;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  judge?: string;

  @Field({ nullable: true })
  notes?: string;

  @Field({ nullable: true })
  outcome?: string;

  @Field(() => Date)
  createdAt: Date;
}

@ObjectType()
export class MotionType {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field(() => MotionType)
  type: MotionType;

  @Field(() => MotionStatus)
  status: MotionStatus;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Date)
  filedDate: Date;

  @Field(() => Date, { nullable: true })
  hearingDate?: Date;

  @Field(() => Date, { nullable: true })
  decisionDate?: Date;

  @Field({ nullable: true })
  ruling?: string;

  @Field({ nullable: true })
  filedBy?: string;

  @Field({ nullable: true })
  opposingParty?: string;

  @Field({ nullable: true })
  relief?: string;

  @Field(() => ID)
  caseId: string;

  @Field(() => CaseType, { nullable: true })
  case?: CaseType;

  @Field(() => UserType, { nullable: true })
  assignedTo?: UserType;

  @Field(() => [DocumentType], { nullable: true })
  documents?: DocumentType[];

  @Field(() => [MotionHearingType], { nullable: true })
  hearings?: MotionHearingType[];

  @Field(() => UserType)
  createdBy: UserType;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class MotionEdge {
  @Field(() => MotionType)
  node: MotionType;

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
export class MotionConnection {
  @Field(() => [MotionEdge])
  edges: MotionEdge[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;

  @Field()
  totalCount: number;
}

@ObjectType()
export class MotionMetrics {
  @Field()
  totalMotions: number;

  @Field()
  pendingMotions: number;

  @Field()
  grantedMotions: number;

  @Field()
  deniedMotions: number;

  @Field(() => [MotionTypeMetric])
  byType: MotionTypeMetric[];

  @Field(() => [MotionStatusMetric])
  byStatus: MotionStatusMetric[];
}

@ObjectType()
export class MotionTypeMetric {
  @Field()
  type: string;

  @Field()
  count: number;
}

@ObjectType()
export class MotionStatusMetric {
  @Field()
  status: string;

  @Field()
  count: number;
}
