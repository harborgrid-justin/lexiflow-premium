import { Module } from '@nestjs/common';
// 
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExhibitsController } from './exhibits.controller';
import { ExhibitsService } from './exhibits.service';
import { TrialExhibit } from './entities/trial-exhibit.entity';

/**
 * Exhibits Module
 * Trial exhibit management and organization
 * Features:
 * - Exhibit cataloging and numbering
 * - Exhibit admissibility tracking
 * - Trial binder organization
 * - Physical and digital exhibit coordination
 */
@Module({
  imports: [TypeOrmModule.forFeature([TrialExhibit])],
  controllers: [ExhibitsController],
  providers: [ExhibitsService],
  exports: [ExhibitsService]
})
export class ExhibitsModule {}
