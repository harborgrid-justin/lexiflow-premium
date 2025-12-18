import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Integration } from './entities/integration.entity';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsService } from './integrations.service';
import { PacerService } from './pacer/pacer.service';
import { CalendarService } from './calendar/calendar.service';
import { ExternalApiController } from './external-api/external-api.controller';
import { ExternalApiService } from './external-api/external-api.service';
import { DataSourcesModule } from './data-sources/data-sources.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Integration]),
    JwtModule.register({}),
    DataSourcesModule,
  ],
  controllers: [IntegrationsController, ExternalApiController],
  providers: [
    IntegrationsService,
    PacerService,
    CalendarService,
    ExternalApiService,
  ],
  exports: [
    IntegrationsService,
    PacerService,
    CalendarService,
    ExternalApiService,
    DataSourcesModule,
  ],
})
export class IntegrationsModule {}
