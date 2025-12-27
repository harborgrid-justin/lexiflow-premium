import { registerAs } from '@nestjs/config';
import { Configuration } from './config.types';

/**
 * Application configuration factory
 * Using registerAs() for namespaced configuration - NestJS best practice
 * @see https://docs.nestjs.com/techniques/configuration#configuration-namespaces
 */
export default registerAs('app', (): Configuration => ({
  app: {
    nodeEnv: process.env.NODE_ENV || 'development',
    demoMode: process.env.DEMO_MODE === 'true',
    logLevel: process.env.LOG_LEVEL || 'info',
  },
  server: {
    port: parseInt(process.env.PORT || '3001', 10),
    corsOrigin: process.env.CORS_ORIGIN || '*',
  },
  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || '',
    name: process.env.DATABASE_NAME || 'lexiflow',
    fallbackSqlite: process.env.DB_FALLBACK_SQLITE === 'true',
    logging: process.env.DB_LOGGING === 'true',
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    ssl: process.env.DB_SSL === 'true',
    sslRejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
    pool: {
      max: parseInt(process.env.DB_POOL_MAX || '20', 10),
      min: parseInt(process.env.DB_POOL_MIN || '2', 10),
      idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
      connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '10000', 10),
    },
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'change-me-in-production',
    expiresIn: process.env.JWT_EXPIRATION || '1h',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'change-me-in-production-refresh',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
  },
  redis: {
    enabled: process.env.REDIS_ENABLED !== 'false' && process.env.DEMO_MODE !== 'true',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    username: process.env.REDIS_USERNAME,
    url: process.env.REDIS_URL,
  },
  rateLimit: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL || '60000', 10),
    limit: parseInt(process.env.RATE_LIMIT_LIMIT || '100', 10),
  },
  fileStorage: {
    uploadDir: process.env.UPLOAD_DIR || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
  },
}));
  SMTP_USER: Joi.string().email().optional(),
  SMTP_PASSWORD: Joi.string().optional(),
  SMTP_FROM: Joi.string().email().optional(),
}).unknown(true); // Allow other env vars not in schema

export default () => {
  const { error, value: validatedEnv } = envSchema.validate(process.env, {
    abortEarly: false,
    stripUnknown: false,
  });

  if (error) {
    throw new Error(
      `Environment validation failed:\n${error.details.map((d) => `  - ${d.message}`).join('\n')}`,
    );
  }

  return {
    nodeEnv: validatedEnv.NODE_ENV,
    port: validatedEnv.PORT,
    apiPrefix: validatedEnv.API_PREFIX,

    // Database - validated and type-safe
    database: {
      url: validatedEnv.DATABASE_URL,
      host: validatedEnv.DB_HOST,
      port: validatedEnv.DB_PORT,
      name: validatedEnv.DB_DATABASE,
      user: validatedEnv.DB_USERNAME,
      password: validatedEnv.DB_PASSWORD,
      ssl: validatedEnv.DB_SSL === 'true',
      sslRejectUnauthorized: validatedEnv.DB_SSL_REJECT_UNAUTHORIZED === 'true',
      logging: validatedEnv.DB_LOGGING === 'true',
    },

    // JWT - validated min 32 chars
    jwt: {
      secret: validatedEnv.JWT_SECRET,
      expiresIn: validatedEnv.JWT_EXPIRES_IN,
      refreshSecret: validatedEnv.JWT_REFRESH_SECRET,
      refreshExpiresIn: validatedEnv.JWT_REFRESH_EXPIRES_IN,
    },

    // File Storage - validated defaults
    storage: {
      uploadPath: validatedEnv.UPLOAD_PATH,
      maxFileSize: validatedEnv.MAX_FILE_SIZE,
    },

    // Redis - validated
    redis: {
      url: validatedEnv.REDIS_URL,
      host: validatedEnv.REDIS_HOST,
      port: validatedEnv.REDIS_PORT,
      password: validatedEnv.REDIS_PASSWORD,
      username: validatedEnv.REDIS_USERNAME || 'default',
    },

    // CORS - use validated origins
    cors: {
      origin:
        validatedEnv.NODE_ENV === 'production'
          ? validatedEnv.CORS_ORIGINS.split(',')
          : (_origin: any, callback: any) => {
              // Allow all origins in development (for accessing from any IP)
              // In production, use CORS_ORIGINS environment variable
              callback(null, true);
            },
      credentials: true,
    },

    // Security
    security: {
      bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
    },
  };
};
