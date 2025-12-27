import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';
import { CalendarEvent } from './entities/calendar-event.entity';
import { AuthModule } from '@auth/auth.module';

/**
 * Calendar Module
 * Manages court dates, deadlines, hearings, and legal calendar events
 * Integrates with external calendar services (Google Calendar, Outlook)
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([CalendarEvent]),
    AuthModule
  ],
  controllers: [CalendarController],
  providers: [CalendarService],
  exports: [CalendarService]
})
export class CalendarModule {}
