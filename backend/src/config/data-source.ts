import { DataSource, DataSourceOptions } from 'typeorm';
// import { SnakeNamingStrategy } from 'typeorm-naming-strategies'; // DISABLED: DB uses camelCase columns
import { config } from 'dotenv';

config();

export const dataSourceOptions: DataSourceOptions = process.env.DATABASE_URL
  ? {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      migrations: [],
      synchronize: true, // TEMPORARY: Auto-create tables - matches existing camelCase schema
      migrationsRun: false,
      logging: process.env.DB_LOGGING === 'true' || process.env.NODE_ENV === 'development',
      maxQueryExecutionTime: 1000, // Log queries taking longer than 1 second
      // namingStrategy: new SnakeNamingStrategy(), // DISABLED: Database uses camelCase column names from migrations
      ssl: {
        rejectUnauthorized: false,
      },
      // Connection pooling configuration
      extra: {
        max: parseInt(process.env.DB_POOL_MAX || '20'),
        min: parseInt(process.env.DB_POOL_MIN || '5'),
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      },
    }
  : {
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'lexiflow_user',
      password: process.env.DB_PASSWORD || 'lexiflow_password',
      database: process.env.DB_DATABASE || 'lexiflow_db',
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      migrations: [],
      synchronize: true, // TEMPORARY: Auto-create tables - matches existing camelCase schema
      migrationsRun: false,
      logging: process.env.DB_LOGGING === 'true' || process.env.NODE_ENV === 'development',
      maxQueryExecutionTime: 1000, // Log queries taking longer than 1 second
      // namingStrategy: new SnakeNamingStrategy(), // DISABLED: Database uses camelCase column names from migrations
      ssl: process.env.DB_SSL === 'true'
        ? {
            rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
          }
        : false,
      // Connection pooling configuration
      extra: {
        max: parseInt(process.env.DB_POOL_MAX || '20'),
        min: parseInt(process.env.DB_POOL_MIN || '5'),
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      },
    };

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
