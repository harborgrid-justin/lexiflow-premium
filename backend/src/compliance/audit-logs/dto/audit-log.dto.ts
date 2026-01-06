import { Type } from "class-transformer";
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";

export class AuditLogDto {
  id!: string;
  userId!: string;
  userName!: string;
  action!: AuditAction;
  entityType!: AuditEntityType;
  entityId!: string;
  entityName?: string;
  changes?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp!: Date;
  organizationId!: string;
}

export enum AuditAction {
  CREATE = "CREATE",
  READ = "READ",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
  EXPORT = "EXPORT",
  APPROVE = "APPROVE",
  REJECT = "REJECT",
  FILE = "FILE",
  SEND = "SEND",
}

export enum AuditEntityType {
  CASE = "Case",
  DOCUMENT = "Document",
  TIME_ENTRY = "TimeEntry",
  INVOICE = "Invoice",
  USER = "User",
  CLIENT = "Client",
  EVIDENCE = "Evidence",
  DISCOVERY = "Discovery",
  MOTION = "Motion",
}

export class QueryAuditLogsDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsEnum(AuditEntityType)
  entityType?: AuditEntityType;

  @IsOptional()
  @IsString()
  entityId?: string;

  @IsOptional()
  @IsEnum(AuditAction)
  action?: AuditAction;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  sortOrder?: "asc" | "desc";
}

export class CreateAuditLogDto {
  userId!: string;
  userName!: string;
  action!: AuditAction;
  entityType!: AuditEntityType;
  entityId!: string;
  entityName?: string;
  changes?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  organizationId!: string;
}

export class ExportAuditLogsDto {
  format!: "csv" | "json" | "pdf";
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  entityType?: AuditEntityType;
  action?: AuditAction;
}
