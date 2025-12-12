import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PacerService } from './pacer/pacer.service';
import { CalendarService } from './calendar/calendar.service';
import { ExternalApiController } from './external-api/external-api.controller';
import { ExternalApiService } from './external-api/external-api.service';
import { EmailService } from './email/email.service';
import { StorageService } from './storage/storage.service';

@Module({
  imports: [ConfigModule],
  controllers: [ExternalApiController],
  providers: [
    PacerService,
    CalendarService,
    ExternalApiService,
    EmailService,
    StorageService,
  ],
  exports: [
    PacerService,
    CalendarService,
    ExternalApiService,
    EmailService,
    StorageService,
  ],
})
export class IntegrationsModule {}
