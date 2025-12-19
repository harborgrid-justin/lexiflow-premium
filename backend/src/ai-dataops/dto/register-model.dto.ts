import { IsString, IsNotEmpty, IsOptional, IsUrl, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterModelDto {
  @ApiProperty({ description: 'Model name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Model type (e.g., embedding, completion, classification)' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ description: 'Model version' })
  @IsString()
  @IsNotEmpty()
  version: string;

  @ApiPropertyOptional({ description: 'Model endpoint URL' })
  @IsOptional()
  @IsUrl()
  endpoint?: string;

  @ApiPropertyOptional({ description: 'Model configuration', type: Object })
  @IsOptional()
  @IsObject()
  config?: Record<string, any>;
}
