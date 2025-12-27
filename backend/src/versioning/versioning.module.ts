import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VersioningController } from './versioning.controller';
import { VersioningService } from './versioning.service';
import { DataVersion } from './entities/data-version.entity';
import { AuthModule } from '../auth/auth.module';

/**
 * Versioning Module
 * Data versioning and audit trail for all entities
 * Features:
 * - Entity change tracking
 * - Version history and rollback
 * - Audit trail with user attribution
 * - Time-travel queries
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([DataVersion]),
    AuthModule,
  ],
  controllers: [VersioningController],
  providers: [VersioningService],
  exports: [VersioningService],
})
export class VersioningModule {}
