import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";
import { WorkflowInstanceStatus } from "../entities/workflow-instance.entity";

export class CreateWorkflowInstanceDto {
  @ApiProperty({ description: "ID of the workflow template to instantiate" })
  @IsUUID()
  @IsNotEmpty()
  templateId!: string;

  @ApiProperty({
    description: "ID of the case to associate with this workflow",
  })
  @IsUUID()
  @IsNotEmpty()
  caseId!: string;

  @ApiPropertyOptional({ description: "ID of the user creating the instance" })
  @IsString()
  @IsOptional()
  createdBy?: string;
}

export class UpdateWorkflowInstanceDto {
  @ApiPropertyOptional({
    description: "Current step index in the workflow",
    minimum: 0,
  })
  @IsOptional()
  currentStep?: number;

  @ApiPropertyOptional({
    description: "Status of the workflow instance",
    enum: WorkflowInstanceStatus,
  })
  @IsEnum(WorkflowInstanceStatus)
  @IsOptional()
  status?: WorkflowInstanceStatus;

  @ApiPropertyOptional({ description: "Step-specific data" })
  @IsOptional()
  stepData?: Record<string, unknown>;
}

export class WorkflowInstanceQueryDto {
  @ApiPropertyOptional({ description: "Filter by status" })
  @IsEnum(WorkflowInstanceStatus)
  @IsOptional()
  status?: WorkflowInstanceStatus;

  @ApiPropertyOptional({ description: "Filter by case ID" })
  @IsUUID()
  @IsOptional()
  caseId?: string;

  @ApiPropertyOptional({ description: "Filter by template ID" })
  @IsUUID()
  @IsOptional()
  templateId?: string;

  @ApiPropertyOptional({ description: "Page number", default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: "Items per page", default: 50 })
  @IsOptional()
  limit?: number;
}
