import { IsEnum, IsString, IsOptional, IsUUID, IsInt, IsDate, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { DeadlineType } from '../entities/motion-deadline.entity';

export class CreateMotionDeadlineDto {
  @IsUUID()
  motionId: string;

  @IsEnum(DeadlineType)
  type: DeadlineType;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDate()
  @Type(() => Date)
  dueDate: Date;

  @IsUUID()
  @IsOptional()
  assignedToUserId?: string;

  @IsString()
  @IsOptional()
  assignedToUserName?: string;

  @IsInt()
  @IsOptional()
  reminderDaysBefore?: number;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
