import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchemaManagementController } from './schema-management.controller';
import { SchemaManagementService } from './schema-management.service';
import { Migration } from './entities/migration.entity';
import { Snapshot } from './entities/snapshot.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Migration, Snapshot])],
  controllers: [SchemaManagementController],
  providers: [SchemaManagementService],
  exports: [SchemaManagementService],
})
export class SchemaManagementModule {}
