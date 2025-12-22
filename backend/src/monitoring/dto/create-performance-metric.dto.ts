import { IsString, IsOptional, IsDate, IsNotEmpty, MaxLength, IsNumber, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePerformanceMetricDto {
  @ApiProperty({ 
    description: 'Metric name',
    example: 'cpu_usage',
    maxLength: 255
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  metricName!: string;

  @ApiProperty({ 
    description: 'Metric value',
    example: 45.2
  })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  value!: number;

  @ApiPropertyOptional({ 
    description: 'Unit of measurement',
    example: 'percent',
    maxLength: 50
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  unit?: string;

  @ApiPropertyOptional({ 
    description: 'Additional tags or metadata',
    example: { host: 'server-01', region: 'us-east' }
  })
  @IsObject()
  @IsOptional()
  tags?: Record<string, unknown>;

  @ApiPropertyOptional({ 
    description: 'Metric timestamp'
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  timestamp?: Date;
}
