import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { CaseType } from './case.type';

export enum PartyRole {
  PLAINTIFF = 'PLAINTIFF',
  DEFENDANT = 'DEFENDANT',
  THIRD_PARTY = 'THIRD_PARTY',
  INTERVENOR = 'INTERVENOR',
  WITNESS = 'WITNESS',
  EXPERT_WITNESS = 'EXPERT_WITNESS',
  PETITIONER = 'PETITIONER',
  RESPONDENT = 'RESPONDENT',
  APPELLANT = 'APPELLANT',
  APPELLEE = 'APPELLEE',
}

export enum PartyType {
  INDIVIDUAL = 'INDIVIDUAL',
  CORPORATION = 'CORPORATION',
  LLC = 'LLC',
  PARTNERSHIP = 'PARTNERSHIP',
  GOVERNMENT_ENTITY = 'GOVERNMENT_ENTITY',
  NON_PROFIT = 'NON_PROFIT',
  TRUST = 'TRUST',
  ESTATE = 'ESTATE',
}

registerEnumType(PartyRole, { name: 'PartyRole' });
registerEnumType(PartyType, { name: 'PartyType' });

@ObjectType()
export class AddressType {
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

@ObjectType()
export class PartyContactType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field()
  isPrimary: boolean;

  @Field(() => Date)
  createdAt: Date;
}

@ObjectType()
export class PartyType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => PartyRole)
  role: PartyRole;

  @Field(() => PartyType, { nullable: true })
  type?: PartyType;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  fax?: string;

  @Field(() => AddressType, { nullable: true })
  address?: AddressType;

  @Field({ nullable: true })
  notes?: string;

  @Field(() => [PartyContactType], { nullable: true })
  contacts?: PartyContactType[];

  @Field(() => ID)
  caseId: string;

  @Field(() => CaseType, { nullable: true })
  case?: CaseType;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class PartyEdge {
  @Field(() => PartyType)
  node: PartyType;

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
export class PartyConnection {
  @Field(() => [PartyEdge])
  edges: PartyEdge[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;

  @Field()
  totalCount: number;
}
