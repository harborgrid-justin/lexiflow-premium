import { InputType, Field, ID } from '@nestjs/graphql';
import { DateRangeInput } from './pagination.input';

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

  @Field({ nullable: true })
  filedBy?: string;

  @Field({ nullable: true })
  opposingParty?: string;

  @Field({ nullable: true })
  relief?: string;

  @Field(() => ID, { nullable: true })
  assignedToId?: string;
}

@InputType()
export class UpdateMotionInput {
  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  type?: string;

  @Field({ nullable: true })
  status?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Date, { nullable: true })
  filedDate?: Date;

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

  @Field(() => ID, { nullable: true })
  assignedToId?: string;
}

@InputType()
export class MotionFilterInput {
  @Field(() => ID, { nullable: true })
  caseId?: string;

  @Field(() => [String], { nullable: true })
  status?: string[];

  @Field(() => [String], { nullable: true })
  type?: string[];

  @Field(() => DateRangeInput, { nullable: true })
  filedDate?: DateRangeInput;

  @Field(() => DateRangeInput, { nullable: true })
  hearingDate?: DateRangeInput;

  @Field({ nullable: true })
  search?: string;

  @Field(() => [ID], { nullable: true })
  assignedTo?: string[];
}

@InputType()
export class CreateMotionHearingInput {
  @Field(() => ID)
  motionId: string;

  @Field(() => Date)
  scheduledDate: Date;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  judge?: string;

  @Field({ nullable: true })
  notes?: string;
}

@InputType()
export class UpdateMotionHearingInput {
  @Field(() => Date, { nullable: true })
  scheduledDate?: Date;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  judge?: string;

  @Field({ nullable: true })
  notes?: string;

  @Field({ nullable: true })
  outcome?: string;
}
