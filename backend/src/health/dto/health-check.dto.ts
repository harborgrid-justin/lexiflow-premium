import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum HealthCheckType {
  LIVENESS = 'liveness',
  READINESS = 'readiness',
  FULL = 'full'
}

export class HealthCheckDto {
  @ApiProperty({ 
    description: 'Type of health check',
    enum: HealthCheckType,
    default: HealthCheckType.LIVENESS
  })
  @IsOptional()
  @IsEnum(HealthCheckType)
  type?: HealthCheckType;
}
