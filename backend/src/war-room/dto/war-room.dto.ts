import { IsString, IsOptional, IsEmail, IsEnum, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ExpertType {
  TECHNICAL = 'Technical',
  MEDICAL = 'Medical',
  FINANCIAL = 'Financial',
  FORENSIC = 'Forensic',
  INDUSTRY = 'Industry',
  OTHER = 'Other'
}

export class CreateAdvisorDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  firm?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  specialty?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  caseId?: string;
}

export class CreateExpertDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty({ enum: ExpertType })
  @IsEnum(ExpertType)
  expertType!: ExpertType;

  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  hourlyRate?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  credentials?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  caseId?: string;
}

export class UpdateStrategyDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  caseId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  objective?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  approach?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  keyArguments?: string;
}
