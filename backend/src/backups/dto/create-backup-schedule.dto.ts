import { IsString, IsOptional, IsBoolean, IsArray, IsNotEmpty, IsNumber, IsEnum, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum BackupType {
  FULL = 'full',
  INCREMENTAL = 'incremental',
  DIFFERENTIAL = 'differential',
}

export class CreateBackupScheduleDto {
  @ApiProperty({ 
    description: 'Backup schedule name',
    example: 'Daily Full Backup',
    maxLength: 255
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @ApiProperty({ 
    description: 'Cron expression for schedule',
    example: '0 2 * * *'
  })
  @IsString()
  @IsNotEmpty()
  cronExpression!: string;

  @ApiProperty({ 
    description: 'Backup type',
    enum: BackupType,
    example: BackupType.FULL
  })
  @IsEnum(BackupType)
  @IsNotEmpty()
  type!: BackupType;

  @ApiPropertyOptional({ 
    description: 'List of databases to backup',
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  databases?: string[];

  @ApiPropertyOptional({ 
    description: 'Whether schedule is enabled',
    default: true
  })
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @ApiPropertyOptional({ 
    description: 'Number of days to retain backups',
    default: 7
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  retentionDays?: number;

  @ApiPropertyOptional({ 
    description: 'Storage location or path',
    maxLength: 500
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  storageLocation?: string;

  @ApiPropertyOptional({ 
    description: 'Whether to compress backup',
    default: true
  })
  @IsBoolean()
  @IsOptional()
  compressed?: boolean;

  @ApiPropertyOptional({ 
    description: 'Whether to encrypt backup',
    default: false
  })
  @IsBoolean()
  @IsOptional()
  encrypted?: boolean;
}
