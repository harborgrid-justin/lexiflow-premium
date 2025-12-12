import { IsString, IsEnum, IsOptional, IsUUID, IsNotEmpty, MaxLength, IsEmail, IsNumber, IsDate, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { TeamMemberRole } from '../entities/case-team.entity';

export class CreateCaseTeamDto {
  @IsUUID()
  @IsNotEmpty()
  caseId: string;

  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsEnum(TeamMemberRole)
  @IsNotEmpty()
  role: TeamMemberRole;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  phone?: string;

  @IsNumber()
  @IsOptional()
  hourlyRate?: number;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  assignedDate?: Date;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsOptional()
  permissions?: Record<string, any>;

  @IsOptional()
  metadata?: Record<string, any>;
}
