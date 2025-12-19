import { PartialType } from '@nestjs/swagger';
import { CreateBackupSnapshotDto } from './create-backup-snapshot.dto';

export class UpdateBackupSnapshotDto extends PartialType(CreateBackupSnapshotDto) {}
