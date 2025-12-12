import { IsString, IsEnum, IsOptional, IsUUID, IsNotEmpty, MaxLength, IsDate, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ProjectStatus, ProjectPriority } from '../entities/project.entity';

export class CreateProjectDto {
  @IsUUID()
  @IsOptional()
  caseId?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;

  @IsEnum(ProjectPriority)
  @IsOptional()
  priority?: ProjectPriority;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dueDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  completedDate?: Date;

  @IsUUID()
  @IsOptional()
  projectManagerId?: string;

  @IsUUID()
  @IsOptional()
  assignedTeamId?: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  completionPercentage?: number;

  @IsNumber()
  @IsOptional()
  estimatedHours?: number;

  @IsNumber()
  @IsOptional()
  actualHours?: number;

  @IsNumber()
  @IsOptional()
  budget?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsOptional()
  tasks?: Array<{
    id: string;
    name: string;
    assignedTo?: string;
    status: string;
    dueDate?: Date;
    completedDate?: Date;
  }>;

  @IsOptional()
  milestones?: Array<{
    name: string;
    dueDate?: Date;
    completedDate?: Date;
    status: string;
  }>;

  @IsOptional()
  metadata?: Record<string, any>;
}
