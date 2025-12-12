import { IsOptional, IsInt, Min, IsEnum, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CorrespondenceType, CorrespondenceStatus } from './create-correspondence.dto';

export class CorrespondenceQueryDto {
  @ApiProperty({
    description: 'Page number',
    minimum: 1,
    default: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    minimum: 1,
    default: 20,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @ApiProperty({
    description: 'Filter by correspondence type',
    enum: CorrespondenceType,
    required: false,
  })
  @IsOptional()
  @IsEnum(CorrespondenceType)
  type?: CorrespondenceType;

  @ApiProperty({
    description: 'Filter by status',
    enum: CorrespondenceStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(CorrespondenceStatus)
  status?: CorrespondenceStatus;

  @ApiProperty({
    description: 'Filter by case ID',
    required: false,
  })
  @IsOptional()
  @IsString()
  caseId?: string;
}
