import { InputType, Field, ID } from '@nestjs/graphql';
import { PaginationInput, SortInput, DateRangeInput } from './pagination.input';

@InputType()
export class CreateCaseInput {
  @Field()
  caseNumber: string;

  @Field()
  title: string;

  @Field()
  type: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  court?: string;

  @Field({ nullable: true })
  jurisdiction?: string;

  @Field(() => Date, { nullable: true })
  filingDate?: Date;

  @Field(() => [String], { nullable: true })
  tags?: string[];
}

@InputType()
export class UpdateCaseInput {
  @Field({ nullable: true })
  caseNumber?: string;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  type?: string;

  @Field({ nullable: true })
  status?: string;

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

  @Field(() => [String], { nullable: true })
  tags?: string[];
}

@InputType()
export class CaseFilterInput {
  @Field(() => [String], { nullable: true })
  status?: string[];

  @Field(() => [String], { nullable: true })
  type?: string[];

  @Field({ nullable: true })
  court?: string;

  @Field({ nullable: true })
  jurisdiction?: string;

  @Field(() => DateRangeInput, { nullable: true })
  filingDate?: DateRangeInput;

  @Field({ nullable: true })
  search?: string;

  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Field(() => [ID], { nullable: true })
  assignedTo?: string[];
}

@InputType()
export class AddPartyInput {
  @Field(() => ID)
  caseId: string;

  @Field()
  name: string;

  @Field()
  role: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  address?: string;
}

@InputType()
export class AddTeamMemberInput {
  @Field(() => ID)
  caseId: string;

  @Field(() => ID)
  userId: string;

  @Field()
  role: string;

  @Field({ nullable: true })
  billable?: boolean;
}

@InputType()
export class CreateMotionInput {
  @Field(() => ID)
  caseId: string;

  @Field()
  title: string;

  @Field()
  type: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Date)
  filedDate: Date;

  @Field(() => Date, { nullable: true })
  hearingDate?: Date;
}

@InputType()
export class CreateDocketEntryInput {
  @Field(() => ID)
  caseId: string;

  @Field()
  entryNumber: string;

  @Field()
  description: string;

  @Field(() => Date)
  filedDate: Date;

  @Field({ nullable: true })
  filedBy?: string;
}
