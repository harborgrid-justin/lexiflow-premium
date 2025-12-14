import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const databaseUrl = configService.get('database.url');
  const useSqliteFallback = configService.get('database.fallbackSqlite') || process.env.DB_FALLBACK_SQLITE === 'true';
  const isDemoMode = process.env.DEMO_MODE === 'true';

  // In demo mode or when SQLite fallback is enabled, use SQLite
  if (isDemoMode || useSqliteFallback) {
    console.log('🗄️  Using SQLite database (demo mode or fallback)');
    return {
      type: 'sqlite',
      database: './lexiflow-demo.sqlite',
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: true, // Auto-create tables in demo mode
      logging: configService.get('database.logging') || configService.get('nodeEnv') === 'development',
    };
  }

  // Use DATABASE_URL if available (for Neon, Heroku, etc.)
  if (databaseUrl) {
    return {
      type: 'postgres',
      url: databaseUrl,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: configService.get('nodeEnv') !== 'production',
      logging: configService.get('database.logging') || configService.get('nodeEnv') === 'development',
      migrations: [__dirname + '/../database/migrations/**/*{.ts,.js}'],
      migrationsRun: false,
      ssl: configService.get('database.ssl')
        ? { rejectUnauthorized: configService.get('database.sslRejectUnauthorized') }
        : false,
      extra: {
        max: 10, // maximum pool size for Neon
        connectionTimeoutMillis: 10000,
      },
    };
  }

  // Fallback to individual connection parameters
  return {
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
    ssl: configService.get('database.ssl')
      ? { rejectUnauthorized: configService.get('database.sslRejectUnauthorized') }
      : false,
  };
};
