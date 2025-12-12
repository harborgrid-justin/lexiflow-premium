import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class AddressInput {
  @Field({ nullable: true })
  street?: string;

  @Field({ nullable: true })
  city?: string;

  @Field({ nullable: true })
  state?: string;

  @Field({ nullable: true })
  zipCode?: string;

  @Field({ nullable: true })
  country?: string;
}

@InputType()
export class CreatePartyInput {
  @Field(() => ID)
  caseId: string;

  @Field()
  name: string;

  @Field()
  role: string;

  @Field({ nullable: true })
  type?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  fax?: string;

  @Field(() => AddressInput, { nullable: true })
  address?: AddressInput;

  @Field({ nullable: true })
  notes?: string;
}

@InputType()
export class UpdatePartyInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  role?: string;

  @Field({ nullable: true })
  type?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  fax?: string;

  @Field(() => AddressInput, { nullable: true })
  address?: AddressInput;

  @Field({ nullable: true })
  notes?: string;
}

@InputType()
export class PartyFilterInput {
  @Field(() => ID, { nullable: true })
  caseId?: string;

  @Field(() => [String], { nullable: true })
  roles?: string[];

  @Field(() => [String], { nullable: true })
  types?: string[];

  @Field({ nullable: true })
  search?: string;
}

@InputType()
export class CreatePartyContactInput {
  @Field(() => ID)
  partyId: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true, defaultValue: false })
  isPrimary?: boolean;
}

@InputType()
export class UpdatePartyContactInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  isPrimary?: boolean;
}
