import { IsString, IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum RiskImpact {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export enum RiskProbability {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export enum RiskStatus {
  OPEN = 'Open',
  MONITORING = 'Monitoring',
  MITIGATED = 'Mitigated',
  CLOSED = 'Closed'
}

export class CreateRiskDto {
  @ApiProperty({ description: 'Risk title' })
  @IsString()
  title!: string;

  @ApiPropertyOptional({ description: 'Risk description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: RiskImpact })
  @IsEnum(RiskImpact)
  impact!: RiskImpact;

  @ApiProperty({ enum: RiskProbability })
  @IsEnum(RiskProbability)
  probability!: RiskProbability;

  @ApiProperty({ enum: RiskStatus, default: RiskStatus.OPEN })
  @IsEnum(RiskStatus)
  status!: RiskStatus;

  @ApiPropertyOptional({ description: 'Case ID' })
  @IsString()
  @IsOptional()
  caseId?: string;

  @ApiPropertyOptional({ description: 'Mitigation strategy' })
  @IsString()
  @IsOptional()
  mitigationStrategy?: string;

  @ApiPropertyOptional({ description: 'Risk score (1-10)' })
  @IsNumber()
  @Min(1)
  @Max(10)
  @IsOptional()
  riskScore?: number;

  @ApiPropertyOptional({ description: 'Identified by user ID' })
  @IsString()
  @IsOptional()
  identifiedBy?: string;
}
