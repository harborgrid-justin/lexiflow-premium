import { InputType, Field, ID } from '@nestjs/graphql';
import { DateRangeInput } from './pagination.input';

@InputType()
export class CreateTimeEntryInput {
  @Field()
  description: string;

  @Field()
  hours: number;

  @Field()
  rate: string; // Money scalar

  @Field(() => Date)
  entryDate: Date;

  @Field(() => ID, { nullable: true })
  caseId?: string;

  @Field({ nullable: true })
  taskCode?: string;

  @Field({ nullable: true })
  activityCode?: string;

  @Field({ defaultValue: true })
  billable: boolean;
}

@InputType()
export class UpdateTimeEntryInput {
  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  hours?: number;

  @Field({ nullable: true })
  rate?: string; // Money scalar

  @Field(() => Date, { nullable: true })
  entryDate?: Date;

  @Field({ nullable: true })
  taskCode?: string;

  @Field({ nullable: true })
  activityCode?: string;

  @Field({ nullable: true })
  billable?: boolean;

  @Field({ nullable: true })
  status?: string;
}

@InputType()
export class TimeEntryFilterInput {
  @Field(() => [ID], { nullable: true })
  userId?: string[];

  @Field(() => ID, { nullable: true })
  caseId?: string;

  @Field(() => [String], { nullable: true })
  status?: string[];

  @Field(() => DateRangeInput, { nullable: true })
  entryDate?: DateRangeInput;

  @Field({ nullable: true })
  billable?: boolean;
}

@InputType()
export class CreateInvoiceInput {
  @Field()
  invoiceNumber: string;

  @Field(() => ID, { nullable: true })
  caseId?: string;

  @Field(() => ID, { nullable: true })
  clientId?: string;

  @Field(() => Date)
  invoiceDate: Date;

  @Field(() => Date)
  dueDate: Date;

  @Field(() => [InvoiceLineItemInput])
  lineItems: InvoiceLineItemInput[];

  @Field({ nullable: true })
  notes?: string;

  @Field({ nullable: true })
  discount?: string; // Money scalar

  @Field({ nullable: true })
  tax?: string; // Money scalar
}

@InputType()
export class InvoiceLineItemInput {
  @Field()
  description: string;

  @Field()
  quantity: number;

  @Field()
  rate: string; // Money scalar

  @Field(() => ID, { nullable: true })
  timeEntryId?: string;
}

@InputType()
export class InvoiceFilterInput {
  @Field(() => [String], { nullable: true })
  status?: string[];

  @Field(() => ID, { nullable: true })
  caseId?: string;

  @Field(() => ID, { nullable: true })
  clientId?: string;

  @Field(() => DateRangeInput, { nullable: true })
  invoiceDate?: DateRangeInput;

  @Field(() => DateRangeInput, { nullable: true })
  dueDate?: DateRangeInput;
}
