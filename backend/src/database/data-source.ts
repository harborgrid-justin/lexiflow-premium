import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { entities } from '../entities';
import * as path from 'path';

// Load environment variables
config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'lexiflow_user',
  password: process.env.DB_PASSWORD || 'lexiflow_password',
  database: process.env.DB_DATABASE || 'lexiflow_db',

  // Entities
  entities: entities,

  // Migrations
  migrations: [path.join(__dirname, './migrations/*{.ts,.js}')],
  migrationsTableName: 'migrations',

  // Disable synchronize (use migrations instead)
  synchronize: false,

  // Logging
  logging: process.env.DB_LOGGING === 'true' || false,
  logger: 'advanced-console',

  // SSL configuration
  ssl: process.env.DB_SSL === 'true'
    ? {
        rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
      }
    : false,

  // Connection pool settings
  extra: {
    max: parseInt(process.env.DB_POOL_MAX || '20', 10),
    min: parseInt(process.env.DB_POOL_MIN || '2', 10),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  },
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
