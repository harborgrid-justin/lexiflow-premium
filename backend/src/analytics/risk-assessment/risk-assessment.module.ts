import { Module } from '@nestjs/common';
import { RiskAssessmentService } from './risk-assessment.service';
import { MLEngineModule } from '../ml-engine/ml-engine.module';

@Module({
  imports: [MLEngineModule],
  providers: [RiskAssessmentService],
  exports: [RiskAssessmentService],
})
export class RiskAssessmentModule {}
