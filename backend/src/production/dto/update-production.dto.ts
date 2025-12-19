import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional, IsInt, IsString, Min } from 'class-validator';
import { CreateProductionDto } from './create-production.dto';
import { ProductionStatus } from '../../discovery/productions/entities/production.entity';

export class UpdateProductionDto extends PartialType(CreateProductionDto) {
  @IsEnum(ProductionStatus)
  @IsOptional()
  status?: ProductionStatus;

  @IsInt()
  @Min(0)
  @IsOptional()
  totalDocuments?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  totalPages?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  totalSize?: number;

  @IsString()
  @IsOptional()
  outputPath?: string;

  @IsString()
  @IsOptional()
  errorMessage?: string;
}
