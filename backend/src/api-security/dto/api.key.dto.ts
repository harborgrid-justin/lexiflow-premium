import { IsString, IsOptional, IsArray, IsEnum, IsNumber, IsDate, IsIP, Min, Max, ArrayMinSize, IsBoolean } from 'class-validator';
import { ApiProperty, PartialType, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum ApiKeyScope {
  READ = 'read',
  WRITE = 'write',
  DELETE = 'delete',
  ADMIN = 'admin',
  DOCUMENTS_READ = 'documents:read',
  DOCUMENTS_WRITE = 'documents:write',
  DOCUMENTS_DELETE = 'documents:delete',
  USERS_READ = 'users:read',
  USERS_WRITE = 'users:write',
  USERS_DELETE = 'users:delete',
  CASES_READ = 'cases:read',
  CASES_WRITE = 'cases:write',
  CASES_DELETE = 'cases:delete',
  WEBHOOKS_MANAGE = 'webhooks:manage',
  API_KEYS_MANAGE = 'api-keys:manage',
}

export enum ApiKeyRotationPolicy {
  MANUAL = 'manual',
  QUARTERLY = 'quarterly',
  BIANNUALLY = 'biannually',
  ANNUALLY = 'annually',
}

export class CreateApiKeyDto {
  @ApiProperty({ description: 'Name for the API key' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Description of the API key purpose', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Scopes for the API key',
    enum: ApiKeyScope,
    isArray: true,
    default: [ApiKeyScope.READ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(ApiKeyScope, { each: true })
  scopes!: ApiKeyScope[];

  @ApiProperty({ description: 'IP addresses allowed to use this API key', required: false, isArray: true })
  @IsOptional()
  @IsArray()
  @IsIP(undefined, { each: true })
  ipWhitelist?: string[];

  @ApiProperty({ description: 'Expiration date for the API key', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expiresAt?: Date;

  @ApiProperty({ description: 'Rate limit per hour', required: false, minimum: 10, maximum: 100000 })
  @IsOptional()
  @IsNumber()
  @Min(10)
  @Max(100000)
  rateLimit?: number;

  @ApiProperty({ description: 'Maximum number of requests allowed per day (quota)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(1000000)
  dailyQuota?: number;

  @ApiProperty({ description: 'Maximum number of requests allowed per month (quota)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1000)
  @Max(100000000)
  monthlyQuota?: number;

  @ApiProperty({
    description: 'Automatic rotation policy for the API key',
    enum: ApiKeyRotationPolicy,
    required: false,
    default: ApiKeyRotationPolicy.MANUAL
  })
  @IsOptional()
  @IsEnum(ApiKeyRotationPolicy)
  rotationPolicy?: ApiKeyRotationPolicy;

  @ApiProperty({ description: 'Enable automatic rotation reminders', required: false, default: true })
  @IsOptional()
  @IsBoolean()
  rotationRemindersEnabled?: boolean;

  @ApiProperty({ description: 'Days before expiration to send reminder', required: false, default: 30 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(90)
  rotationReminderDays?: number;
}

export class UpdateApiKeyDto extends PartialType(
  OmitType(CreateApiKeyDto, [] as const),
) {
  @ApiProperty({ description: 'Activate or deactivate the API key', required: false })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class ApiKeyResponseDto {
  @ApiProperty({ description: 'Unique identifier for the API key' })
  id!: string;

  @ApiProperty({ description: 'Name of the API key' })
  name!: string;

  @ApiProperty({ description: 'Description of the API key purpose', required: false })
  description?: string;

  @ApiProperty({ description: 'Prefix of the API key for identification' })
  keyPrefix!: string;

  @ApiProperty({ description: 'Scopes assigned to the API key', enum: ApiKeyScope, isArray: true })
  scopes!: ApiKeyScope[];

  @ApiProperty({ description: 'IP addresses allowed to use this API key', required: false, isArray: true })
  ipWhitelist?: string[];

  @ApiProperty({ description: 'Expiration date of the API key', required: false })
  expiresAt?: Date;

  @ApiProperty({ description: 'Rate limit per hour' })
  rateLimit!: number;

  @ApiProperty({ description: 'Daily quota for requests', required: false })
  dailyQuota?: number;

  @ApiProperty({ description: 'Monthly quota for requests', required: false })
  monthlyQuota?: number;

  @ApiProperty({ description: 'Last time the API key was used', required: false })
  lastUsedAt?: Date;

  @ApiProperty({ description: 'Total number of requests made with this API key' })
  requestCount!: number;

  @ApiProperty({ description: 'Whether the API key is active' })
  active!: boolean;

  @ApiProperty({ description: 'Rotation policy for the API key', enum: ApiKeyRotationPolicy })
  rotationPolicy!: ApiKeyRotationPolicy;

  @ApiProperty({ description: 'Whether rotation reminders are enabled' })
  rotationRemindersEnabled!: boolean;

  @ApiProperty({ description: 'Days before expiration to send reminder' })
  rotationReminderDays!: number;

  @ApiProperty({ description: 'Next rotation reminder date', required: false })
  nextRotationReminderAt?: Date;

  @ApiProperty({ description: 'Last rotation date', required: false })
  lastRotatedAt?: Date;

  @ApiProperty({ description: 'Date when the API key was created' })
  createdAt!: Date;

  @ApiProperty({ description: 'Date when the API key was last updated' })
  updatedAt!: Date;

  @ApiProperty({ description: 'User ID who owns this API key' })
  userId!: string;
}

export class ApiKeyWithSecretDto extends ApiKeyResponseDto {
  @ApiProperty({ description: 'The actual API key (only shown once upon creation)' })
  key!: string;
}

export class ApiKeyUsageStatsDto {
  @ApiProperty({ description: 'API key identifier' })
  id!: string;

  @ApiProperty({ description: 'API key name' })
  name!: string;

  @ApiProperty({ description: 'Total requests made' })
  totalRequests!: number;

  @ApiProperty({ description: 'Last used timestamp', required: false })
  lastUsedAt?: Date;

  @ApiProperty({ description: 'Requests in current hour' })
  currentHourRequests!: number;

  @ApiProperty({ description: 'Requests today' })
  todayRequests!: number;

  @ApiProperty({ description: 'Requests this month' })
  monthRequests!: number;

  @ApiProperty({ description: 'Rate limit per hour' })
  rateLimit!: number;

  @ApiProperty({ description: 'Daily quota', required: false })
  dailyQuota?: number;

  @ApiProperty({ description: 'Monthly quota', required: false })
  monthlyQuota?: number;

  @ApiProperty({ description: 'Rate limit reset time', required: false })
  rateLimitResetAt?: Date;

  @ApiProperty({ description: 'Daily quota reset time', required: false })
  dailyQuotaResetAt?: Date;

  @ApiProperty({ description: 'Monthly quota reset time', required: false })
  monthlyQuotaResetAt?: Date;

  @ApiProperty({ description: 'Percentage of hourly rate limit used' })
  rateLimitUsagePercentage!: number;

  @ApiProperty({ description: 'Percentage of daily quota used', required: false })
  dailyQuotaUsagePercentage?: number;

  @ApiProperty({ description: 'Percentage of monthly quota used', required: false })
  monthlyQuotaUsagePercentage?: number;
}
