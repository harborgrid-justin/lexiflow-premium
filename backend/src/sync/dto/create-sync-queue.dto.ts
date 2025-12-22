import { IsString, IsOptional, IsNotEmpty, MaxLength, IsUUID, IsEnum, IsNumber, IsObject, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum SyncOperation {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

export enum SyncStatus {
  PENDING = 'pending',
  SYNCING = 'syncing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CONFLICT = 'conflict',
}

export class CreateSyncQueueDto {
  @ApiProperty({ 
    description: 'Sync operation type',
    enum: SyncOperation,
    example: SyncOperation.CREATE
  })
  @IsEnum(SyncOperation)
  @IsNotEmpty()
  operation!: string;

  @ApiProperty({ 
    description: 'Entity type being synced',
    example: 'case',
    maxLength: 100
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  entityType!: string;

  @ApiProperty({ 
    description: 'Entity ID being synced'
  })
  @IsString()
  @IsNotEmpty()
  entityId!: string;

  @ApiProperty({ 
    description: 'Sync payload data'
  })
  @IsObject()
  @IsNotEmpty()
  payload!: Record<string, unknown>;

  @ApiPropertyOptional({ 
    description: 'Sync status',
    enum: SyncStatus,
    default: SyncStatus.PENDING
  })
  @IsEnum(SyncStatus)
  @IsOptional()
  status?: SyncStatus;

  @ApiPropertyOptional({ 
    description: 'Retry count',
    default: 0
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  retryCount?: number;

  @ApiPropertyOptional({ 
    description: 'Error message if failed'
  })
  @IsString()
  @IsOptional()
  error?: string;

  @ApiPropertyOptional({ 
    description: 'User ID who initiated sync'
  })
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({ 
    description: 'When sync was completed'
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  syncedAt?: Date;
}
