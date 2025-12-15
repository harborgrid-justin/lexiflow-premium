import { Module } from '@nestjs/common';
import { WarRoomController } from './war-room.controller';

@Module({
  controllers: [WarRoomController],
  providers: [],
  exports: []
})
export class WarRoomModule {}
