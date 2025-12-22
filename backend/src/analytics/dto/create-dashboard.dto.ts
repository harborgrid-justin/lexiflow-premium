import {
  IsString,
  IsOptional,
  IsArray,
  IsObject,
  IsNotEmpty,
  MaxLength,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDashboardDto {
  @ApiProperty({ description: 'Dashboard title' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({ description: 'Dashboard description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Owner user ID' })
  @IsString()
  @IsOptional()
  ownerId?: string;

  @ApiPropertyOptional({ description: 'Is this a shared dashboard', default: false })
  @IsBoolean()
  @IsOptional()
  isShared?: boolean;

  @ApiPropertyOptional({ description: 'Is this a default dashboard', default: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @ApiPropertyOptional({ description: 'Dashboard layout configuration' })
  @IsObject()
  @IsOptional()
  layout?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Widget configurations', type: [Object] })
  @IsArray()
  @IsOptional()
  widgets?: Array<{
    id: string;
    type: string;
    title: string;
    config: Record<string, unknown>;
    position: { x: number; y: number; w: number; h: number };
  }>;

  @ApiPropertyOptional({ description: 'Dashboard filters' })
  @IsObject()
  @IsOptional()
  filters?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Refresh interval in seconds' })
  @IsOptional()
  refreshInterval?: number;

  @ApiPropertyOptional({ description: 'Tags for categorization' })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}
