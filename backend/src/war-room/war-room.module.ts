import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WarRoomController } from './war-room.controller';
import { WarRoomService } from './war-room.service';
import { Advisor, Expert, CaseStrategy } from './entities/war-room.entity';
import { AuthModule } from '@auth/auth.module';

/**
 * War Room Module
 * Case strategy planning and expert advisor management
 * Features:
 * - Expert witness and advisor coordination
 * - Case strategy development and tracking
 * - Trial preparation and rehearsal tools
 * - Real-time trial collaboration space
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Advisor, Expert, CaseStrategy]),
    AuthModule
  ],
  controllers: [WarRoomController],
  providers: [WarRoomService],
  exports: [WarRoomService]
})
export class WarRoomModule {}
