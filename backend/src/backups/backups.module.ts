import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BackupsController } from './backups.controller';
import { BackupsService } from './backups.service';
import { BackupSnapshot } from './entities/backup-snapshot.entity';
import { BackupSchedule } from './entities/backup-schedule.entity';
import { AuthModule } from '@auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BackupSnapshot, BackupSchedule]),
    AuthModule,
  ],
  controllers: [BackupsController],
  providers: [BackupsService],
  exports: [BackupsService],
})
export class BackupsModule {}
