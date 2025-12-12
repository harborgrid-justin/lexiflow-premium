import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MotionsController } from './motions.controller';
import { MotionsService } from './motions.service';
import { Motion } from './entities/motion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Motion])],
  controllers: [MotionsController],
  providers: [MotionsService],
  exports: [MotionsService],
})
export class MotionsModule {}
