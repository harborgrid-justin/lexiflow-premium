import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HRController } from './hr.controller';
import { HRService } from './hr.service';
import { Employee } from './entities/employee.entity';
import { TimeOffRequest } from './entities/time-off-request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Employee, TimeOffRequest])],
  controllers: [HRController],
  providers: [HRService],
  exports: [HRService]
})
export class HRModule {}
