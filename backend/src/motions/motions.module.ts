import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MotionsController } from './motions.controller';
import { MotionsService } from './motions.service';
import { Motion } from './entities/motion.entity';

/**
 * Motions Module
 * Court motion filing and tracking system
 * Features:
 * - Motion drafting and filing
 * - Opposition and reply briefs
 * - Hearing scheduling
 * - Motion outcome tracking
 */
@Module({
  imports: [TypeOrmModule.forFeature([Motion])],
  controllers: [MotionsController],
  providers: [MotionsService],
  exports: [MotionsService],
})
export class MotionsModule {}
