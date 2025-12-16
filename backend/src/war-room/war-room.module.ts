import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WarRoomController } from './war-room.controller';
import { WarRoomService } from './war-room.service';
import { Advisor, Expert, CaseStrategy } from './entities/war-room.entity';
import { AuthModule } from '../auth/auth.module';

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
