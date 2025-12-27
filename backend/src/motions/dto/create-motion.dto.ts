import { IsString, IsEnum, IsOptional, IsUUID, IsNotEmpty, MaxLength, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { MotionType, MotionStatus } from '@motions/entities/motion.entity';

export class CreateMotionDto {
  @IsUUID()
  @IsNotEmpty()
  caseId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @IsEnum(MotionType)
  @IsNotEmpty()
  type!: MotionType;

  @IsEnum(MotionStatus)
  @IsOptional()
  status?: MotionStatus;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  filedBy?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  filedDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  hearingDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  decisionDate?: Date;

  @IsString()
  @IsOptional()
  relief?: string;

  @IsString()
  @IsOptional()
  decision?: string;

  @IsUUID()
  @IsOptional()
  documentId?: string;

  @IsUUID()
  @IsOptional()
  assignedAttorneyId?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsOptional()
  relatedDocuments?: Array<{
    id: string;
    name: string;
    type: string;
  }>;

  @IsOptional()
  metadata?: Record<string, unknown>;
}
