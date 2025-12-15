import { Module } from '@nestjs/common';
import { CalendarController } from './calendar.controller';

@Module({
  controllers: [CalendarController],
  providers: [],
  exports: []
})
export class CalendarModule {}
