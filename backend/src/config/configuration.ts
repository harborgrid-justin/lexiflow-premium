import * as Joi from 'joi';

// Validate ALL environment variables with Joi schema
const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().port().default(5000),
  API_PREFIX: Joi.string().default('/api/v1'),

  // Database - all required except defaults
  DATABASE_URL: Joi.string().uri().optional(),
  DB_HOST: Joi.string().hostname().default('localhost'),
  DB_PORT: Joi.number().port().default(5432),
  DB_DATABASE: Joi.string().default('lexiflow'),
  DB_USERNAME: Joi.string().default('lexiflow_admin'),
  DB_PASSWORD: Joi.string().required(), // CRITICAL: Always required
  DB_SSL: Joi.string().valid('true', 'false').default('false'),
  DB_SSL_REJECT_UNAUTHORIZED: Joi.string().valid('true', 'false').default('true'),
  DB_LOGGING: Joi.string().valid('true', 'false').default('false'),

  // JWT - CRITICAL: Always required
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('900'),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('604800'),

  // Redis
  REDIS_HOST: Joi.string().hostname().default('localhost'),
  REDIS_PORT: Joi.number().port().default(6379),
  REDIS_PASSWORD: Joi.string().optional(),
  REDIS_DB: Joi.number().integer().min(0).default(0),

  // Storage
  UPLOAD_PATH: Joi.string().default('./uploads'),
  MAX_FILE_SIZE: Joi.number().positive().default(52428800), // 50MB
  ALLOWED_FILE_TYPES: Joi.string().default(
    'pdf,doc,docx,xls,xlsx,txt,jpg,jpeg,png',
  ),

  // CORS
  CORS_ORIGINS: Joi.string().default('*'),

  // Rate Limiting
  THROTTLE_TTL: Joi.number().positive().default(60),
  THROTTLE_LIMIT: Joi.number().positive().default(10),

  // Email (if configured)
  SMTP_HOST: Joi.string().hostname().optional(),
  SMTP_PORT: Joi.number().port().optional(),
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
