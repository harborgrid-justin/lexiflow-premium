import { IsString, IsUUID, IsEnum, IsOptional, IsArray, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum CommunicationType {
  EMAIL = 'email',
  SMS = 'sms',
  LETTER = 'letter',
  PHONE = 'phone',
  FAX = 'fax',
  IN_PERSON = 'in_person'
}

export enum CommunicationStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  PENDING = 'pending'
}

export class CreateCommunicationDto {
  @ApiProperty({ description: 'Communication type', enum: CommunicationType })
  @IsEnum(CommunicationType)
  type: CommunicationType;

  @ApiProperty({ description: 'Subject' })
  @IsString()
  subject: string;

  @ApiProperty({ description: 'Body/Content' })
  @IsString()
  body: string;

  @ApiProperty({ description: 'From (sender)', required: false })
  @IsOptional()
  @IsString()
  from?: string;

  @ApiProperty({ description: 'To (recipient)', isArray: true })
  @IsArray()
  @IsString({ each: true })
  to: string[];

  @ApiProperty({ description: 'CC recipients', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cc?: string[];

  @ApiProperty({ description: 'BCC recipients', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  bcc?: string[];

  @ApiProperty({ description: 'Related case ID', required: false })
  @IsOptional()
  @IsUUID()
  caseId?: string;

  @ApiProperty({ description: 'Related client ID', required: false })
  @IsOptional()
  @IsUUID()
  clientId?: string;

  @ApiProperty({ 
    description: 'Communication status',
    enum: CommunicationStatus,
    default: CommunicationStatus.DRAFT
  })
  @IsOptional()
  @IsEnum(CommunicationStatus)
  status?: CommunicationStatus;

  @ApiProperty({ description: 'Attachments', required: false })
  @IsOptional()
  @IsArray()
  attachments?: string[];

  @ApiProperty({ description: 'Metadata', required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
