import { InputType, Field, ID } from '@nestjs/graphql';
import { IsEmail, IsOptional, IsEnum, IsNumber, IsBoolean, IsString } from 'class-validator';
import { ClientType, ClientStatus, PaymentTerms } from '../types/client.type';

@InputType()
export class CreateClientInput {
  @Field()
  @IsString()
  name: string;

  @Field(() => ClientType)
  @IsEnum(ClientType)
  clientType: ClientType;

  @Field({ nullable: true })
  @IsEmail()
  @IsOptional()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  fax?: string;

  @Field({ nullable: true })
  @IsOptional()
  website?: string;

  @Field({ nullable: true })
  @IsOptional()
  address?: string;

  @Field({ nullable: true })
  @IsOptional()
  city?: string;

  @Field({ nullable: true })
  @IsOptional()
  state?: string;

  @Field({ nullable: true })
  @IsOptional()
  zipCode?: string;

  @Field({ nullable: true })
  @IsOptional()
  country?: string;

  @Field({ nullable: true })
  @IsOptional()
  taxId?: string;

  @Field({ nullable: true })
  @IsOptional()
  industry?: string;

  @Field({ nullable: true })
  @IsOptional()
  primaryContactName?: string;

  @Field({ nullable: true })
  @IsOptional()
  primaryContactEmail?: string;

  @Field({ nullable: true })
  @IsOptional()
  primaryContactPhone?: string;

  @Field({ nullable: true })
  @IsOptional()
  referralSource?: string;

  @Field(() => PaymentTerms, { nullable: true })
  @IsEnum(PaymentTerms)
  @IsOptional()
  paymentTerms?: PaymentTerms;

  @Field({ nullable: true })
  @IsOptional()
  preferredPaymentMethod?: string;

  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  creditLimit?: number;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isVip?: boolean;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  requiresConflictCheck?: boolean;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  tags?: string[];

  @Field({ nullable: true })
  @IsOptional()
  notes?: string;
}

@InputType()
export class UpdateClientInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field(() => ClientType, { nullable: true })
  @IsEnum(ClientType)
  @IsOptional()
  clientType?: ClientType;

  @Field(() => ClientStatus, { nullable: true })
  @IsEnum(ClientStatus)
  @IsOptional()
  status?: ClientStatus;

  @Field({ nullable: true })
  @IsEmail()
  @IsOptional()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  address?: string;

  @Field({ nullable: true })
  @IsOptional()
  city?: string;

  @Field({ nullable: true })
  @IsOptional()
  state?: string;

  @Field({ nullable: true })
  @IsOptional()
  zipCode?: string;

  @Field({ nullable: true })
  @IsOptional()
  country?: string;

  @Field({ nullable: true })
  @IsOptional()
  primaryContactName?: string;

  @Field({ nullable: true })
  @IsOptional()
  primaryContactEmail?: string;

  @Field({ nullable: true })
  @IsOptional()
  primaryContactPhone?: string;

  @Field(() => PaymentTerms, { nullable: true })
  @IsEnum(PaymentTerms)
  @IsOptional()
  paymentTerms?: PaymentTerms;

  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  creditLimit?: number;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isVip?: boolean;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  tags?: string[];

  @Field({ nullable: true })
  @IsOptional()
  notes?: string;
}

@InputType()
export class ClientFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  search?: string;

  @Field(() => ClientStatus, { nullable: true })
  @IsEnum(ClientStatus)
  @IsOptional()
  status?: ClientStatus;

  @Field(() => ClientType, { nullable: true })
  @IsEnum(ClientType)
  @IsOptional()
  clientType?: ClientType;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isVip?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  industry?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  tags?: string[];

  @Field({ nullable: true })
  @IsOptional()
  accountManagerId?: string;
}
