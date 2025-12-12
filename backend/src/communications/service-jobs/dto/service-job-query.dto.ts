import { IsOptional, IsInt, Min, IsEnum, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ServiceJobType, ServiceJobStatus } from './create-service-job.dto';

export class ServiceJobQueryDto {
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
    description: 'Filter by service type',
    enum: ServiceJobType,
    required: false,
  })
  @IsOptional()
  @IsEnum(ServiceJobType)
  type?: ServiceJobType;

  @ApiProperty({
    description: 'Filter by status',
    enum: ServiceJobStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(ServiceJobStatus)
  status?: ServiceJobStatus;

  @ApiProperty({
    description: 'Filter by case ID',
    required: false,
  })
  @IsOptional()
  @IsString()
  caseId?: string;

  @ApiProperty({
    description: 'Filter by process server ID',
    required: false,
  })
  @IsOptional()
  @IsString()
  processServerId?: string;
}
