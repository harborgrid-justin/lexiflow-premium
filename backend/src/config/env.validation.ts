import * as Joi from 'joi';

/**
 * Environment validation schema using Joi
 * Based on NestJS best practices from: https://docs.nestjs.com/techniques/configuration#schema-validation
 */
export const validationSchema = Joi.object({
  // Node environment
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'staging')
    .default('development'),

  // Server configuration
  PORT: Joi.number().port().default(3001),
  
  // Database configuration
  DATABASE_URL: Joi.string().uri().optional(),
  DATABASE_HOST: Joi.string().default('localhost'),
  DATABASE_PORT: Joi.number().default(5432),
  DATABASE_USER: Joi.string().default('postgres'),
  DATABASE_PASSWORD: Joi.string().allow('').default(''),
  DATABASE_NAME: Joi.string().default('lexiflow'),
  DB_FALLBACK_SQLITE: Joi.boolean().default(false),
  
  // Database pool settings
  DB_POOL_MAX: Joi.number().min(1).max(100).default(20),
  DB_POOL_MIN: Joi.number().min(0).max(50).default(2),
  DB_IDLE_TIMEOUT: Joi.number().default(30000),
  DB_CONNECTION_TIMEOUT: Joi.number().default(10000),
  
  // Database behavior
  DB_SYNCHRONIZE: Joi.boolean().default(false),
  DB_LOGGING: Joi.boolean().default(false),
  DB_MIGRATIONS_RUN: Joi.boolean().default(false),
  
  // SSL configuration
  DB_SSL: Joi.boolean().default(false),
  DB_SSL_REJECT_UNAUTHORIZED: Joi.boolean().default(false),
  
  // JWT configuration
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRATION: Joi.string().default('1h'),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_EXPIRATION: Joi.string().default('7d'),
  
  // Redis configuration
  REDIS_ENABLED: Joi.boolean().default(true),
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().port().default(6379),
  REDIS_PASSWORD: Joi.string().allow('').optional(),
  REDIS_USERNAME: Joi.string().allow('').optional(),
  REDIS_URL: Joi.string().uri().optional(),
  
  // Rate limiting
  RATE_LIMIT_TTL: Joi.number().default(60000),
  RATE_LIMIT_LIMIT: Joi.number().default(100),
  
  // Application modes
  DEMO_MODE: Joi.boolean().default(false),
  
  // File storage
  UPLOAD_DIR: Joi.string().default('./uploads'),
  MAX_FILE_SIZE: Joi.number().default(10485760), // 10MB
  
  // External services (optional)
  OPENAI_API_KEY: Joi.string().optional(),
  GOOGLE_AI_API_KEY: Joi.string().optional(),
  
  // CORS
  CORS_ORIGIN: Joi.string().default('*'),
  
  // Logging
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug', 'verbose')
    .default('info'),
});

/**
 * Validation options for the config module
 */
export const validationOptions: Joi.ValidationOptions = {
  // Allow unknown keys (for flexibility)
  allowUnknown: true,
  // Abort on first error (fail fast)
  abortEarly: false,
};
