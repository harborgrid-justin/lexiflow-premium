import { IsOptional, IsInt, Min, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class MessageQueryDto {
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
    default: 50,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 50;

  @ApiProperty({
    description: 'Filter messages after this date',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  afterDate?: string;

  @ApiProperty({
    description: 'Filter messages before this date',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  beforeDate?: string;
}
