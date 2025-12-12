import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsEnum, IsBoolean, IsDateString } from 'class-validator';
import { AuditLogAction, AuditLogResult, AuditLogSeverity } from '../types/compliance.type';

@InputType()
export class AuditLogFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  userId?: string;

  @Field(() => AuditLogAction, { nullable: true })
  @IsEnum(AuditLogAction)
  @IsOptional()
  action?: AuditLogAction;

  @Field({ nullable: true })
  @IsOptional()
  entity?: string;

  @Field({ nullable: true })
  @IsOptional()
  entityId?: string;

  @Field(() => AuditLogResult, { nullable: true })
  @IsEnum(AuditLogResult)
  @IsOptional()
  result?: AuditLogResult;

  @Field(() => AuditLogSeverity, { nullable: true })
  @IsEnum(AuditLogSeverity)
  @IsOptional()
  severity?: AuditLogSeverity;

  @Field({ nullable: true })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @Field({ nullable: true })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  requiresReview?: boolean;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isReviewed?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  ipAddress?: string;

  @Field({ nullable: true })
  @IsOptional()
  search?: string;
}

@InputType()
export class CreateAuditLogInput {
  @Field(() => AuditLogAction)
  @IsEnum(AuditLogAction)
  action: AuditLogAction;

  @Field()
  entity: string;

  @Field({ nullable: true })
  @IsOptional()
  entityId?: string;

  @Field({ nullable: true })
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  details?: string;

  @Field(() => AuditLogSeverity, { nullable: true })
  @IsEnum(AuditLogSeverity)
  @IsOptional()
  severity?: AuditLogSeverity;
}

@InputType()
export class ReviewAuditLogInput {
  @Field()
  auditLogId: string;

  @Field({ nullable: true })
  @IsOptional()
  reviewNotes?: string;
}

@InputType()
export class CreateConflictCheckInput {
  @Field()
  clientName: string;

  @Field()
  partyName: string;

  @Field({ nullable: true })
  @IsOptional()
  additionalParties?: string;

  @Field({ nullable: true })
  @IsOptional()
  caseDescription?: string;
}

@InputType()
export class CreateEthicalWallInput {
  @Field()
  name: string;

  @Field()
  description: string;

  @Field(() => [String])
  restrictedUserIds: string[];

  @Field(() => [String])
  restrictedCaseIds: string[];

  @Field(() => Date)
  effectiveDate: Date;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  expirationDate?: Date;
}

@InputType()
export class UpdateEthicalWallInput {
  @Field({ nullable: true })
  @IsOptional()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  description?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  restrictedUserIds?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  restrictedCaseIds?: string[];

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  expirationDate?: Date;
}
