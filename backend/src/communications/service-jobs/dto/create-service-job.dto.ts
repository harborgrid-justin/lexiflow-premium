import { IsString, IsEnum, IsOptional, IsDateString, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ServiceJobType {
  PERSONAL_SERVICE = 'personal_service',
  SUBSTITUTED_SERVICE = 'substituted_service',
  CERTIFIED_MAIL = 'certified_mail',
  PUBLICATION = 'publication',
}

export enum ServiceJobStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export class CreateServiceJobDto {
  @ApiProperty({
    description: 'Type of service',
    enum: ServiceJobType,
    example: ServiceJobType.PERSONAL_SERVICE,
  })
  @IsEnum(ServiceJobType)
  type: ServiceJobType;

  @ApiProperty({
    description: 'Related case ID',
  })
  @IsString()
  caseId: string;

  @ApiProperty({
    description: 'Document to be served ID',
  })
  @IsString()
  documentId: string;

  @ApiProperty({
    description: 'Recipient party ID',
  })
  @IsString()
  recipientPartyId: string;

  @ApiProperty({
    description: 'Recipient name',
    example: 'John Smith',
  })
  @IsString()
  recipientName: string;

  @ApiProperty({
    description: 'Service address',
    example: '123 Main St, City, State 12345',
  })
  @IsString()
  serviceAddress: string;

  @ApiProperty({
    description: 'Process server ID (if assigned)',
    required: false,
  })
  @IsOptional()
  @IsString()
  processServerId?: string;

  @ApiProperty({
    description: 'Deadline for service',
    example: '2024-12-31T23:59:59Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  deadline?: string;

  @ApiProperty({
    description: 'Special instructions',
    required: false,
  })
  @IsOptional()
  @IsString()
  specialInstructions?: string;

  @ApiProperty({
    description: 'Initial status',
    enum: ServiceJobStatus,
    default: ServiceJobStatus.PENDING,
    required: false,
  })
  @IsOptional()
  @IsEnum(ServiceJobStatus)
  status?: ServiceJobStatus;

  @ApiProperty({
    description: 'Metadata',
    required: false,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
