import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class CreateDiscoveryRequestInput {
  @Field(() => ID)
  caseId: string;

  @Field()
  requestNumber: string;

  @Field()
  type: string;

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

  @Field(() => ID)
  assignedTo: string;
}

@InputType()
export class UpdateDiscoveryRequestInput {
  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  status?: string;

  @Field(() => Date, { nullable: true })
  dueDate?: Date;

  @Field(() => Date, { nullable: true })
  responseDate?: Date;

  @Field(() => ID, { nullable: true })
  assignedTo?: string;
}

@InputType()
export class CreateDepositionInput {
  @Field(() => ID)
  caseId: string;

  @Field()
  deponentName: string;

  @Field()
  deponentRole: string;

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

  @Field(() => [ID], { nullable: true })
  attendingAttorneys?: string[];
}

@InputType()
export class UpdateDepositionInput {
  @Field({ nullable: true })
  deponentName?: string;

  @Field({ nullable: true })
  deponentRole?: string;

  @Field({ nullable: true })
  status?: string;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  videoConferenceLink?: string;

  @Field(() => Date, { nullable: true })
  scheduledDate?: Date;

  @Field({ nullable: true })
  duration?: number;

  @Field({ nullable: true })
  courtReporter?: string;

  @Field({ nullable: true })
  videographer?: string;

  @Field({ nullable: true })
  notes?: string;
}

@InputType()
export class CreateLegalHoldInput {
  @Field(() => ID)
  caseId: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Date)
  issuedDate: Date;

  @Field(() => [String])
  custodians: string[];

  @Field(() => [String])
  dataSources: string[];
}

@InputType()
export class CreatePrivilegeLogEntryInput {
  @Field(() => ID)
  caseId: string;

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
}
