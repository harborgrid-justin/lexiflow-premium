import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MattersService } from './matters.service';
import { MattersController } from './matters.controller';
import { Matter } from './entities/matter.entity';

/**
 * Matters Module
 * Legal matter management and tracking
 * Features:
 * - Matter/case organization
 * - Client matter association
 * - Matter status workflow
 * - Budget and timeline tracking
 */
@Module({
  imports: [TypeOrmModule.forFeature([Matter])],
  controllers: [MattersController],
  providers: [MattersService],
  exports: [MattersService],
})
export class MattersModule {}
