import { IsOptional, IsDateString, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetClientMetricsDto {
  @ApiProperty({
    description: 'Start date for client metrics',
    required: false
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'End date for client metrics',
    required: false
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Filter by specific client',
    required: false
  })
  @IsOptional()
  @IsUUID()
  clientId?: string;

  @ApiProperty({
    description: 'Filter by client type',
    required: false
  })
  @IsOptional()
  @IsString()
  clientType?: string;
}
