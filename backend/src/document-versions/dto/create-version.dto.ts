import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreateVersionDto {
  @ApiPropertyOptional({ description: 'Description of changes in this version' })
  @IsString()
  @IsOptional()
  changeDescription?: string;

  @ApiPropertyOptional({ description: 'Additional metadata for this version' })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}
