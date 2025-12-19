import { IsString, IsOptional, IsDate, IsNotEmpty, MaxLength, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBackupSnapshotDto {
  @ApiProperty({ 
    description: 'Backup name',
    example: 'Backup-2025-01-15',
    maxLength: 255
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({ 
    description: 'Backup type',
    example: 'full'
  })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiPropertyOptional({ 
    description: 'Database name',
    maxLength: 255
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  database?: string;

  @ApiPropertyOptional({ 
    description: 'File path or storage location',
    maxLength: 1000
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  filePath?: string;

  @ApiPropertyOptional({ 
    description: 'File size in bytes'
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  fileSize?: number;

  @ApiPropertyOptional({ 
    description: 'Backup status',
    default: 'in_progress'
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ 
    description: 'Related backup schedule ID'
  })
  @IsString()
  @IsOptional()
  scheduleId?: string;

  @ApiPropertyOptional({ 
    description: 'Backup start time'
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  startedAt?: Date;

  @ApiPropertyOptional({ 
    description: 'Backup completion time'
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  completedAt?: Date;
}
