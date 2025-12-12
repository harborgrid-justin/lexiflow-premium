import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { UserType } from './user.type';

export enum AuditLogAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  ACCESS = 'access',
  DOWNLOAD = 'download',
  UPLOAD = 'upload',
  EXPORT = 'export',
  IMPORT = 'import',
  APPROVE = 'approve',
  REJECT = 'reject',
  SUBMIT = 'submit',
  ARCHIVE = 'archive',
  RESTORE = 'restore',
  SHARE = 'share',
  UNSHARE = 'unshare',
  OTHER = 'other',
}

export enum AuditLogResult {
  SUCCESS = 'success',
  FAILURE = 'failure',
  WARNING = 'warning',
  INFO = 'info',
}

export enum AuditLogSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

registerEnumType(AuditLogAction, { name: 'AuditLogAction' });
registerEnumType(AuditLogResult, { name: 'AuditLogResult' });
registerEnumType(AuditLogSeverity, { name: 'AuditLogSeverity' });

@ObjectType()
export class AuditLogType {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  userId?: string;

  @Field({ nullable: true })
  userName?: string;

  @Field(() => AuditLogAction)
  action: AuditLogAction;

  @Field()
  entity: string;

  @Field({ nullable: true })
  entityId?: string;

  @Field(() => Date)
  timestamp: Date;

  @Field({ nullable: true })
  ipAddress?: string;

  @Field({ nullable: true })
  userAgent?: string;

  @Field({ nullable: true })
  method?: string;

  @Field({ nullable: true })
  endpoint?: string;

  @Field({ nullable: true })
  statusCode?: number;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  details?: string;

  @Field(() => AuditLogResult)
  result: AuditLogResult;

  @Field({ nullable: true })
  errorMessage?: string;

  @Field({ nullable: true })
  duration?: number;

  @Field({ nullable: true })
  sessionId?: string;

  @Field({ nullable: true })
  requestId?: string;

  @Field({ nullable: true })
  correlationId?: string;

  @Field({ nullable: true })
  resource?: string;

  @Field({ nullable: true })
  resourceId?: string;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  deviceType?: string;

  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Field(() => AuditLogSeverity)
  severity: AuditLogSeverity;

  @Field()
  requiresReview: boolean;

  @Field()
  isReviewed: boolean;

  @Field({ nullable: true })
  reviewedBy?: string;

  @Field(() => Date, { nullable: true })
  reviewedAt?: Date;

  @Field(() => UserType, { nullable: true })
  user?: UserType;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class AuditLogEdge {
  @Field(() => AuditLogType)
  node: AuditLogType;

  @Field()
  cursor: string;
}

@ObjectType()
export class AuditLogConnection {
  @Field(() => [AuditLogEdge])
  edges: AuditLogEdge[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;

  @Field()
  totalCount: number;
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
export class ComplianceMetrics {
  @Field()
  totalAuditLogs: number;

  @Field()
  criticalEvents: number;

  @Field()
  failedLogins: number;

  @Field()
  dataExports: number;

  @Field()
  privilegedAccess: number;

  @Field()
  pendingReviews: number;

  @Field(() => [AuditLogActionMetric])
  byAction: AuditLogActionMetric[];

  @Field(() => [AuditLogSeverityMetric])
  bySeverity: AuditLogSeverityMetric[];
}

@ObjectType()
export class AuditLogActionMetric {
  @Field()
  action: string;

  @Field()
  count: number;
}

@ObjectType()
export class AuditLogSeverityMetric {
  @Field()
  severity: string;

  @Field()
  count: number;
}

@ObjectType()
export class ConflictCheckType {
  @Field(() => ID)
  id: string;

  @Field()
  clientName: string;

  @Field()
  partyName: string;

  @Field()
  checkStatus: string;

  @Field({ nullable: true })
  conflictFound?: boolean;

  @Field({ nullable: true })
  conflictDetails?: string;

  @Field({ nullable: true })
  checkedBy?: string;

  @Field(() => Date)
  checkedAt: Date;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class EthicalWallType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field(() => [String])
  restrictedUserIds: string[];

  @Field(() => [String])
  restrictedCaseIds: string[];

  @Field()
  isActive: boolean;

  @Field(() => Date)
  effectiveDate: Date;

  @Field(() => Date, { nullable: true })
  expirationDate?: Date;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
