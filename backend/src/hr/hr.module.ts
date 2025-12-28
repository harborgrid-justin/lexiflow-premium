import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HRController } from './hr.controller';
import { HRService } from './hr.service';
import { Employee } from './entities/employee.entity';
import { TimeOffRequest } from './entities/time-off-request.entity';

/**
 * HR Module
 * Human resources management for law firms
 * Features:
 * - Employee profiles and directory
 * - Time-off request management
 * - Timesheet and attendance tracking
 * - Performance reviews and evaluations
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Employee, TimeOffRequest]),
  ],
  controllers: [HRController],
  providers: [HRService],
  exports: [HRService]
})
export class HRModule {}
