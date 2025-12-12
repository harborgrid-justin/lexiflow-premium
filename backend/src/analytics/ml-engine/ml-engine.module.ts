import { Module } from '@nestjs/common';
import { MLEngineService } from './ml-engine.service';

@Module({
  providers: [MLEngineService],
  exports: [MLEngineService],
})
export class MLEngineModule {}
