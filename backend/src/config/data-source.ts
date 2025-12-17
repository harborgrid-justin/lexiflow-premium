import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { entities } from '../entities';

config();

export const dataSourceOptions: DataSourceOptions = process.env.DATABASE_URL
  ? {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: entities,
      migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
      synchronize: true, // Must be false when using migrations to avoid conflicts
      logging: process.env.DB_LOGGING === 'true',
      ssl: {
        rejectUnauthorized: false,
      },
    }
  : {
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'lexiflow_user',
      password: process.env.DB_PASSWORD || 'lexiflow_password',
      database: process.env.DB_DATABASE || 'lexiflow_db',
      entities: entities,
      migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
      synchronize: true, // Must be false when using migrations to avoid conflicts
      logging: process.env.DB_LOGGING === 'true',
      ssl: process.env.DB_SSL === 'true'
        ? {
            rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
          }
        : false,
    };

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
