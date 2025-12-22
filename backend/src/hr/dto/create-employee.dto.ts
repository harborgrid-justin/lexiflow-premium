import { IsString, IsEmail, IsOptional, IsEnum, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum EmployeeRole {
  PARTNER = 'Partner',
  SENIOR_ASSOCIATE = 'Senior Associate',
  ASSOCIATE = 'Associate',
  PARALEGAL = 'Paralegal',
  LEGAL_ASSISTANT = 'Legal Assistant',
  INTERN = 'Intern'
}

export enum EmployeeStatus {
  ACTIVE = 'Active',
  ON_LEAVE = 'On Leave',
  TERMINATED = 'Terminated'
}

export class CreateEmployeeDto {
  @ApiProperty()
  @IsString()
  firstName!: string;

  @ApiProperty()
  @IsString()
  lastName!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty({ enum: EmployeeRole })
  @IsEnum(EmployeeRole)
  role!: EmployeeRole;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  department?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  hireDate?: string;

  @ApiProperty({ enum: EmployeeStatus, default: EmployeeStatus.ACTIVE })
  @IsEnum(EmployeeStatus)
  status!: EmployeeStatus;

  @ApiPropertyOptional({ description: 'Hourly billing rate' })
  @IsNumber()
  @IsOptional()
  billingRate?: number;

  @ApiPropertyOptional({ description: 'Annual target billable hours' })
  @IsNumber()
  @IsOptional()
  targetBillableHours?: number;
}
