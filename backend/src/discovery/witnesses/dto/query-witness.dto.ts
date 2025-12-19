import { IsOptional, IsUUID, IsEnum, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { WitnessType, WitnessStatus } from '../entities/witness.entity';

export class QueryWitnessDto {
  @ApiPropertyOptional({ 
    description: 'Filter by case ID'
  })
  @IsUUID()
  @IsOptional()
  caseId?: string;

  @ApiPropertyOptional({ 
    description: 'Filter by witness type',
    enum: WitnessType
  })
  @IsEnum(WitnessType)
  @IsOptional()
  witnessType?: WitnessType;

  @ApiPropertyOptional({ 
    description: 'Filter by witness status',
    enum: WitnessStatus
  })
  @IsEnum(WitnessStatus)
  @IsOptional()
  status?: WitnessStatus;

  @ApiPropertyOptional({ 
    description: 'Search by name'
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ 
    description: 'Page number for pagination',
    default: 1
  })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ 
    description: 'Items per page',
    default: 20
  })
  @IsOptional()
  limit?: number;
}
