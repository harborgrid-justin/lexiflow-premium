import {
  Module,
  MiddlewareConsumer,
  NestModule,
  OnModuleInit,
  ClassSerializerInterceptor,
  DynamicModule,
} from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, Reflector } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import * as path from 'path';

import { SystemStartupReporter } from './bootstrap/system-startup.reporter';

import * as MasterConfig from './config/master.config';
import configuration from './config/configuration';
import resourceLimitsConfig from './config/resource-limits.config';
import memoryConfig from './config/memory.config';
import { getDatabaseConfig } from './config/database.config';
import { validationSchema, validationOptions } from './config/env.validation';

import { CoreModule } from './core/core.module';
import { MemoryModule } from './common/memory.module';
import { MemoryManagementModule } from './common/memory-management.module';
import { DatabaseModule } from './config/database.module';

import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

import { SanitizationMiddleware } from './common/middleware/sanitization.middleware';
import { StreamProcessingMiddleware } from './common/middleware/stream-processing.middleware';
import { CorrelationIdInterceptor } from './common/interceptors/correlation-id.interceptor';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';
import { MemoryManagementInterceptor } from './common/interceptors/memory-management.interceptor';
import { EnterpriseExceptionFilter } from './common/filters/enterprise-exception.filter';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { APP_IMPORTS, APP_IMPORT_NAMES } from './app.imports';

/* ------------------------------------------------------------------ */
/* Redis / Bull Feature Gate                                           */
/* ------------------------------------------------------------------ */

const redisEnabled =
  process.env.REDIS_ENABLED !== 'false' &&
  process.env.DEMO_MODE !== 'true';

function queueModules(): DynamicModule[] {
  if (!redisEnabled) {
    return [];
  }

  return [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.get<string>('redis.url');
        return url
          ? { url }
          : {
              redis: {
                host: config.get<string>('redis.host'),
                port: config.get<number>('redis.port'),
                password: config.get<string>('redis.password'),
                username: config.get<string>('redis.username'),
              },
            };
      },
    }),
  ];
}

/* ------------------------------------------------------------------ */
/* App Module                                                          */
/* ------------------------------------------------------------------ */

@Module({
  imports: [
    /* Configuration */
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.resolve(__dirname, '../.env'),
      load: [configuration, resourceLimitsConfig, memoryConfig],
      validationSchema,
      validationOptions,
      cache: true,
      expandVariables: true,
    }),

    /* Database */
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),

    /* Queues (conditional) */
    ...queueModules(),

    /* Scheduling */
    ScheduleModule.forRoot(),

    /* Domain Events */
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      maxListeners: 10,
    }),

    /* Rate Limiting */
    ThrottlerModule.forRoot([
      {
        ttl: MasterConfig.RATE_LIMIT_TTL,
        limit: MasterConfig.RATE_LIMIT_LIMIT,
      },
    ]),

    /* Core Platform */
    CoreModule,
    MemoryModule,
    MemoryManagementModule,
    DatabaseModule,

    /* Application Services */
    ...APP_IMPORTS,
  ],
  controllers: [AppController],
  providers: [
    AppService,

    /* Global Guards */
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },

    /* Global Interceptors */
    { provide: APP_INTERCEPTOR, useClass: CorrelationIdInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseTransformInterceptor },
    { provide: APP_INTERCEPTOR, useClass: MemoryManagementInterceptor },
    {
      provide: APP_INTERCEPTOR,
      inject: [Reflector],
      useFactory: (reflector: Reflector) =>
        new ClassSerializerInterceptor(reflector, {
          excludeExtraneousValues: false,
          enableImplicitConversion: true,
        }),
    },

    /* Global Filters */
    { provide: APP_FILTER, useClass: EnterpriseExceptionFilter },
  ],
})
export class AppModule implements NestModule, OnModuleInit {
  constructor() {
    SystemStartupReporter.header();
    SystemStartupReporter.environment();
  }

  onModuleInit(): void {
    /* -------------------------------------------------------------- */
    /* Core Infrastructure                                            */
    /* -------------------------------------------------------------- */

    SystemStartupReporter.section('Core Infrastructure');
    SystemStartupReporter.module({ name: 'ConfigModule', status: 'ENABLED' });
    SystemStartupReporter.module({ name: 'TypeOrmModule', status: 'ENABLED' });
    SystemStartupReporter.module({
      name: 'Bull / Redis',
      status: redisEnabled ? 'ENABLED' : 'DISABLED',
    });
    SystemStartupReporter.module({ name: 'ScheduleModule', status: 'ENABLED' });
    SystemStartupReporter.module({ name: 'EventEmitterModule', status: 'ENABLED' });
    SystemStartupReporter.module({ name: 'ThrottlerModule', status: 'ENABLED' });

    /* -------------------------------------------------------------- */
    /* Core Platform                                                   */
    /* -------------------------------------------------------------- */

    SystemStartupReporter.section('Core Platform');
    SystemStartupReporter.module({ name: 'CoreModule', status: 'ENABLED' });
    SystemStartupReporter.module({ name: 'DatabaseModule', status: 'ENABLED' });
    SystemStartupReporter.module({ name: 'MemoryModule', status: 'ENABLED' });
    SystemStartupReporter.module({
      name: 'MemoryManagementModule',
      status: 'ENABLED',
    });

    /* -------------------------------------------------------------- */
    /* Application Services                                           */
    /* -------------------------------------------------------------- */

    SystemStartupReporter.section('Application Services');
    for (const name of APP_IMPORT_NAMES) {
      SystemStartupReporter.module({ name, status: 'ENABLED' });
    }

    /* -------------------------------------------------------------- */

    SystemStartupReporter.footer();
  }

  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(SanitizationMiddleware, StreamProcessingMiddleware)
      .forRoutes('*');
  }
}
