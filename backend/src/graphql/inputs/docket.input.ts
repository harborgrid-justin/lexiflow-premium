import { InputType, Field, ID } from '@nestjs/graphql';
import { DateRangeInput } from './pagination.input';

@InputType()
export class CreateDocketEntryInput {
  @Field(() => ID)
  caseId: string;

  @Field()
  entryNumber: string;

  @Field()
  description: string;

  @Field()
  type: string;

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
}

@InputType()
export class UpdateDocketEntryInput {
  @Field({ nullable: true })
  entryNumber?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  type?: string;

  @Field({ nullable: true })
  status?: string;

  @Field(() => Date, { nullable: true })
  filedDate?: Date;

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
}

@InputType()
export class DocketEntryFilterInput {
  @Field(() => ID, { nullable: true })
  caseId?: string;

  @Field(() => [String], { nullable: true })
  type?: string[];

  @Field(() => [String], { nullable: true })
  status?: string[];

  @Field(() => DateRangeInput, { nullable: true })
  filedDate?: DateRangeInput;

  @Field({ nullable: true })
  filedBy?: string;

  @Field({ nullable: true })
  search?: string;
}

@InputType()
export class BulkCreateDocketEntriesInput {
  @Field(() => ID)
  caseId: string;

  @Field(() => [CreateDocketEntryInput])
  entries: CreateDocketEntryInput[];
}
