import { PartialType } from '@nestjs/swagger';
import { CreateBackupScheduleDto } from './create-backup-schedule.dto';

export class UpdateBackupScheduleDto extends PartialType(CreateBackupScheduleDto) {}
