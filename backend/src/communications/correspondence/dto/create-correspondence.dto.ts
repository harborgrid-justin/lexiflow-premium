import { IsString, IsEnum, IsOptional, IsArray, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum CorrespondenceType {
  LETTER = 'letter',
  EMAIL = 'email',
  FAX = 'fax',
  NOTICE = 'notice',
  DEMAND_LETTER = 'demand_letter',
  SETTLEMENT_OFFER = 'settlement_offer',
}

export enum CorrespondenceStatus {
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
}

export class CreateCorrespondenceDto {
  @ApiProperty({
    description: 'Correspondence type',
    enum: CorrespondenceType,
    example: CorrespondenceType.LETTER,
  })
  @IsEnum(CorrespondenceType)
  type!: CorrespondenceType;

  @ApiProperty({
    description: 'Subject/Title',
    example: 'Motion to Dismiss - Case #12345',
  })
  @IsString()
  subject!: string;

  @ApiProperty({
    description: 'Correspondence body/content',
  })
  @IsString()
  body!: string;

  @ApiProperty({
    description: 'Sender user ID',
  })
  @IsString()
  senderId!: string;

  @ApiProperty({
    description: 'Recipient name or entity',
    example: 'John Smith, Opposing Counsel',
  })
  @IsString()
  recipient!: string;

  @ApiProperty({
    description: 'Recipient email address',
    required: false,
  })
  @IsOptional()
  @IsString()
  recipientEmail?: string;

  @ApiProperty({
    description: 'Recipient mailing address',
    required: false,
  })
  @IsOptional()
  @IsString()
  recipientAddress?: string;

  @ApiProperty({
    description: 'Related case ID',
    required: false,
  })
  @IsOptional()
  @IsString()
  caseId?: string;

  @ApiProperty({
    description: 'Attachment document IDs',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachmentIds?: string[];

  @ApiProperty({
    description: 'CC recipients',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ccRecipients?: string[];

  @ApiProperty({
    description: 'BCC recipients',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  bccRecipients?: string[];

  @ApiProperty({
    description: 'Initial status',
    enum: CorrespondenceStatus,
    default: CorrespondenceStatus.DRAFT,
    required: false,
  })
  @IsOptional()
  @IsEnum(CorrespondenceStatus)
  status?: CorrespondenceStatus;

  @ApiProperty({
    description: 'Metadata',
    required: false,
  })
  @IsOptional()
  metadata?: Record<string, unknown>;
}
