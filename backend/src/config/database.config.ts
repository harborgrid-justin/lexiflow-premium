import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get('database.host'),
  port: configService.get('database.port'),
  username: configService.get('database.user'),
  password: configService.get('database.password'),
  database: configService.get('database.name'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: configService.get('nodeEnv') !== 'production',
  logging: configService.get('nodeEnv') === 'development',
  migrations: [__dirname + '/../database/migrations/**/*{.ts,.js}'],
  migrationsRun: false,
  ssl:
    configService.get('nodeEnv') === 'production'
      ? { rejectUnauthorized: false }
      : false,
});
