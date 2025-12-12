import { ApiProperty } from '@nestjs/swagger';

export enum JobType {
  OCR = 'ocr',
  DOCUMENT_CONVERSION = 'document_conversion',
  METADATA_EXTRACTION = 'metadata_extraction',
  REDACTION = 'redaction',
  MERGE = 'merge',
  SPLIT = 'split',
}

export enum JobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export class JobStatusDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: JobType })
  type: JobType;

  @ApiProperty({ enum: JobStatus })
  status: JobStatus;

  @ApiProperty()
  documentId: string;

  @ApiProperty({ required: false })
  progress?: number;

  @ApiProperty({ required: false })
  result?: any;

  @ApiProperty({ required: false })
  error?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ required: false })
  completedAt?: Date;

  @ApiProperty({ required: false })
  processingTime?: number;
}
