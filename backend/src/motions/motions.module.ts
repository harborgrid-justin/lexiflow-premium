import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MotionsController } from './motions.controller';
import { MotionsService } from './motions.service';
import { Motion } from './entities/motion.entity';
import { MotionDeadline } from './entities/motion-deadline.entity';
import { DeadlineTrackingService } from './deadline-tracking.service';

@Module({
  imports: [TypeOrmModule.forFeature([Motion, MotionDeadline])],
  controllers: [MotionsController],
  providers: [MotionsService, DeadlineTrackingService],
  exports: [MotionsService, DeadlineTrackingService],
})
export class MotionsModule {}
