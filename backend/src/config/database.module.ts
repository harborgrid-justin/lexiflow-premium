import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { entities } from '../entities';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'lexiflow_user'),
        password: configService.get('DB_PASSWORD', 'lexiflow_password'),
        database: configService.get('DB_DATABASE', 'lexiflow_db'),
        entities: entities,
        synchronize: configService.get('DB_SYNCHRONIZE', false),
        logging: configService.get('DB_LOGGING', false),
        migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
        migrationsRun: configService.get('DB_MIGRATIONS_RUN', false),
        migrationsTableName: 'migrations',
        ssl: configService.get('DB_SSL', false)
          ? {
              rejectUnauthorized: configService.get(
                'DB_SSL_REJECT_UNAUTHORIZED',
                false,
              ),
            }
          : false,
        extra: {
          max: configService.get<number>('DB_POOL_MAX', 20),
          min: configService.get<number>('DB_POOL_MIN', 2),
          idleTimeoutMillis: configService.get<number>(
            'DB_IDLE_TIMEOUT',
            30000,
          ),
          connectionTimeoutMillis: configService.get<number>(
            'DB_CONNECTION_TIMEOUT',
            2000,
          ),
        },
        autoLoadEntities: true,
        keepConnectionAlive: true,
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
