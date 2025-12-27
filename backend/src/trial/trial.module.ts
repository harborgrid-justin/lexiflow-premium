import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrialController } from './trial.controller';
import { TrialService } from './trial.service';
import { TrialEvent } from './entities/trial-event.entity';
import { WitnessPrepSession } from './entities/witness-prep-session.entity';

/**
 * Trial Module
 * Trial management and courtroom preparation system
 * Features:
 * - Trial calendar and scheduling
 * - Witness preparation and tracking
 * - Trial binders and exhibit organization
 * - Real-time trial notes and observations
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([TrialEvent, WitnessPrepSession]),
  ],
  controllers: [TrialController],
  providers: [TrialService],
  exports: [TrialService]
})
export class TrialModule {}
