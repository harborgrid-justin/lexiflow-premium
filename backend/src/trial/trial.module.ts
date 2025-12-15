import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrialController } from './trial.controller';
import { TrialService } from './trial.service';
import { TrialEvent } from './entities/trial-event.entity';
import { WitnessPrepSession } from './entities/witness-prep-session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TrialEvent, WitnessPrepSession])],
  controllers: [TrialController],
  providers: [TrialService],
  exports: [TrialService]
})
export class TrialModule {}
