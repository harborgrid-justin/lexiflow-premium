import { Module } from '@nestjs/common';
import { PacerService } from './pacer/pacer.service';
import { CalendarService } from './calendar/calendar.service';
import { ExternalApiController } from './external-api/external-api.controller';
import { ExternalApiService } from './external-api/external-api.service';
import { DataSourcesModule } from './data-sources/data-sources.module';

@Module({
  imports: [DataSourcesModule],
  controllers: [ExternalApiController],
  providers: [
    PacerService,
    CalendarService,
    ExternalApiService,
  ],
  exports: [
    PacerService,
    CalendarService,
    ExternalApiService,
    DataSourcesModule,
  ],
})
export class IntegrationsModule {}
