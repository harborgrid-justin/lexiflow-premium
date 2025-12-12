import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CasePhasesController } from './case-phases.controller';
import { CasePhasesService } from './case-phases.service';
import { CasePhase } from './entities/case-phase.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CasePhase])],
  controllers: [CasePhasesController],
  providers: [CasePhasesService],
  exports: [CasePhasesService],
})
export class CasePhasesModule {}
