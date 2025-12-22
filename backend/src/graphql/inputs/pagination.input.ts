import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class PaginationInput {
  @Field(() => Int, { nullable: true, defaultValue: 20 })
  first?: number;

  @Field({ nullable: true })
  after?: string;

  @Field(() => Int, { nullable: true })
  last?: number;

  @Field({ nullable: true })
  before?: string;

  @Field(() => Int, { nullable: true, defaultValue: 1 })
  page?: number;

  @Field(() => Int, { nullable: true, defaultValue: 10 })
  limit?: number;

  @Field({ nullable: true })
  sortBy?: string;

  @Field({ nullable: true, defaultValue: 'ASC' })
  sortOrder?: 'ASC' | 'DESC';
}

@InputType()
export class SortInput {
  @Field()
  field!: string;

  @Field({ defaultValue: 'ASC' })
  direction!: 'ASC' | 'DESC';
}

@InputType()
export class DateRangeInput {
  @Field(() => Date, { nullable: true })
  start?: Date;

  @Field(() => Date, { nullable: true })
  end?: Date;
}
