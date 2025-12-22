import { IsOptional, IsInt, Min, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetMessagesDto {
  @ApiProperty({
    description: 'Messages before this date',
    required: false
  })
  @IsOptional()
  @IsDateString()
  before?: string;

  @ApiProperty({
    description: 'Messages after this date',
    required: false
  })
  @IsOptional()
  @IsDateString()
  after?: string;

  @ApiProperty({
    description: 'Page number',
    default: 1,
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({
    description: 'Items per page',
    default: 50,
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
