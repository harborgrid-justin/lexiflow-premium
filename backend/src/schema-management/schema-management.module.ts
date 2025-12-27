import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchemaManagementController } from './schema-management.controller';
import { SchemaManagementService } from './schema-management.service';
import { Migration } from './entities/migration.entity';
import { Snapshot } from './entities/snapshot.entity';
import { AuthModule } from '@auth/auth.module';

/**
 * Schema Management Module
 * Database schema versioning and migration tracking
 * Features:
 * - Migration execution history
 * - Schema snapshots and rollback
 * - Database structure validation
 * - Schema documentation generation
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Migration, Snapshot]),
    AuthModule,
  ],
  controllers: [SchemaManagementController],
  providers: [SchemaManagementService],
  exports: [SchemaManagementService],
})
export class SchemaManagementModule {}
