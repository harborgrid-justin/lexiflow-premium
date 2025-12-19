import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterModelDto {
  @ApiProperty({ description: 'Model name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Model type' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ description: 'Model version' })
  @IsString()
  @IsNotEmpty()
  version: string;

  @ApiProperty({ description: 'Model provider' })
  @IsString()
  @IsNotEmpty()
  provider: string;

  @ApiProperty({ description: 'Model configuration', type: Object })
  @IsObject()
  @IsNotEmpty()
  configuration: Record<string, any>;
}

export class UpdateModelDto {
  @ApiPropertyOptional({ description: 'Model name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Model version' })
  @IsOptional()
  @IsString()
  version?: string;

  @ApiPropertyOptional({ description: 'Model provider' })
  @IsOptional()
  @IsString()
  provider?: string;

  @ApiPropertyOptional({ description: 'Model configuration', type: Object })
  @IsOptional()
  @IsObject()
  config?: Record<string, any>;
}
