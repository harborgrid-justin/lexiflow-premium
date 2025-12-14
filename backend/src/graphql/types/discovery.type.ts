import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { UserType } from './user.type';
import { DocumentType } from './document.type';

export enum DiscoveryType {
  INTERROGATORY = 'INTERROGATORY',
  REQUEST_FOR_PRODUCTION = 'REQUEST_FOR_PRODUCTION',
  REQUEST_FOR_ADMISSION = 'REQUEST_FOR_ADMISSION',
  SUBPOENA = 'SUBPOENA',
}

export enum DiscoveryRequestStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  RECEIVED = 'RECEIVED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  OVERDUE = 'OVERDUE',
}

export enum DepositionStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  POSTPONED = 'POSTPONED',
}

registerEnumType(DiscoveryType, { name: 'DiscoveryType' });
registerEnumType(DiscoveryRequestStatus, { name: 'DiscoveryRequestStatus' });
registerEnumType(DepositionStatus, { name: 'DepositionStatus' });

@ObjectType()
export class DiscoveryRequestType {
  @Field(() => ID)
  id: string;

  @Field()
  requestNumber: string;

  @Field(() => DiscoveryRequestType)
  type: DiscoveryRequestType;

  @Field(() => DiscoveryRequestStatus)
  status: DiscoveryRequestStatus;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  requestingParty: string;

  @Field()
  respondingParty: string;

  @Field(() => Date)
  requestDate: Date;

  @Field(() => Date)
  dueDate: Date;

  @Field(() => Date, { nullable: true })
  responseDate?: Date;

  @Field(() => [DocumentType], { nullable: true })
  documents?: DocumentType[];

  @Field(() => UserType)
  assignedTo: UserType;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class DepositionType {
  @Field(() => ID)
  id: string;

  @Field()
  deponentName: string;

  @Field()
  deponentRole: string;

  @Field(() => DepositionStatus)
  status: DepositionStatus;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  videoConferenceLink?: string;

  @Field(() => Date)
  scheduledDate: Date;

  @Field({ nullable: true })
  duration?: number;

  @Field({ nullable: true })
  courtReporter?: string;

  @Field({ nullable: true })
  videographer?: string;

  @Field({ nullable: true })
  notes?: string;

  @Field(() => [UserType], { nullable: true })
  attorneys?: UserType[];

  @Field(() => DocumentType, { nullable: true })
  transcript?: DocumentType;

  @Field(() => [DocumentType], { nullable: true })
  exhibits?: DocumentType[];

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class ESISourceType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  type: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  custodian?: string;

  @Field({ nullable: true })
  estimatedSize?: string;

  @Field(() => Date, { nullable: true })
  dateRange?: Date;

  @Field(() => Boolean)
  preserved: boolean;

  @Field(() => Date)
  createdAt: Date;
}

@ObjectType()
export class LegalHoldType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  status: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Date)
  issuedDate: Date;

  @Field(() => Date, { nullable: true })
  releasedDate?: Date;

  @Field(() => [String])
  custodians: string[];

  @Field(() => [String])
  dataSources: string[];

  @Field(() => UserType)
  issuedBy: UserType;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class PrivilegeLogEntryType {
  @Field(() => ID)
  id: string;

  @Field()
  documentId: string;

  @Field()
  privilegeType: string;

  @Field()
  author: string;

  @Field()
  recipient: string;

  @Field(() => Date)
  documentDate: Date;

  @Field()
  description: string;

  @Field({ nullable: true })
  batesNumber?: string;

  @Field(() => Date)
  createdAt: Date;
}
