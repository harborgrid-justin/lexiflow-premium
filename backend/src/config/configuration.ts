export default () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  apiPrefix: process.env.API_PREFIX || 'api/v1',

  // Database
  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    name: process.env.DB_DATABASE || 'lexiflow',
    user: process.env.DB_USERNAME || 'lexiflow_admin',
    password: process.env.DB_PASSWORD || 'lexiflow_secure_2024',
    ssl: process.env.DB_SSL === 'true',
    sslRejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
    logging: process.env.DB_LOGGING === 'true',
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'lexiflow_jwt_secret_enterprise_2024',
    expiresIn: process.env.JWT_EXPIRES_IN || '900', // 15 minutes in seconds
    refreshSecret:
      process.env.JWT_REFRESH_SECRET || 'lexiflow_refresh_secret_2024',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '604800', // 7 days in seconds
  },

  // File Storage
  storage: {
    uploadPath: process.env.UPLOAD_PATH || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 52428800, // 50MB
  },

  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  },

  // Security
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 12,
  },
});
