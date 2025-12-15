import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WarRoomController } from './war-room.controller';
import { WarRoomService } from './war-room.service';
import { Advisor, Expert, CaseStrategy } from './entities/war-room.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Advisor, Expert, CaseStrategy])],
  controllers: [WarRoomController],
  providers: [WarRoomService],
  exports: [WarRoomService]
})
export class WarRoomModule {}
