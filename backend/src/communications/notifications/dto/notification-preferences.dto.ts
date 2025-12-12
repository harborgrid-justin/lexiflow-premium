import { IsBoolean, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class NotificationPreferencesDto {
  @ApiProperty({
    description: 'Enable email notifications',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  emailEnabled?: boolean;

  @ApiProperty({
    description: 'Enable push notifications',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  pushEnabled?: boolean;

  @ApiProperty({
    description: 'Enable in-app notifications',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  inAppEnabled?: boolean;

  @ApiProperty({
    description: 'Notify on case updates',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  caseUpdates?: boolean;

  @ApiProperty({
    description: 'Notify on document uploads',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  documentUploads?: boolean;

  @ApiProperty({
    description: 'Notify on deadline reminders',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  deadlineReminders?: boolean;

  @ApiProperty({
    description: 'Notify on task assignments',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  taskAssignments?: boolean;

  @ApiProperty({
    description: 'Notify on messages',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  messages?: boolean;

  @ApiProperty({
    description: 'Notify on invoices',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  invoices?: boolean;

  @ApiProperty({
    description: 'Additional custom preferences',
    required: false,
  })
  @IsOptional()
  @IsObject()
  customPreferences?: Record<string, boolean>;
}
