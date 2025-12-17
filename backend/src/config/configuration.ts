// Validate required environment variables in production
const validateRequiredEnvVars = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const requiredInProduction = [
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'DB_PASSWORD',
  ];

  if (isProduction) {
    const missing = requiredInProduction.filter((key) => !process.env[key]);
    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables for production: ${missing.join(', ')}`,
      );
    }
  }
};

validateRequiredEnvVars();

export default () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  apiPrefix: process.env.API_PREFIX || 'api/v1',

  // Database
  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    name: process.env.DB_DATABASE || 'lexiflow',
    user: process.env.DB_USERNAME || 'lexiflow_admin',
    password: process.env.DB_PASSWORD, // Required - no default
    ssl: process.env.DB_SSL === 'true',
    sslRejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
    logging: process.env.DB_LOGGING === 'true',
  },

  // JWT - secrets required, no defaults
  jwt: {
    secret: process.env.JWT_SECRET, // Required - no default
    expiresIn: process.env.JWT_EXPIRES_IN || '900', // 15 minutes in seconds
    refreshSecret: process.env.JWT_REFRESH_SECRET, // Required - no default
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '604800', // 7 days in seconds
  },

  // File Storage
  storage: {
    uploadPath: process.env.UPLOAD_PATH || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 52428800, // 50MB
  },

  // Redis
  redis: {
    url: process.env.REDIS_URL,
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD,
    username: process.env.REDIS_USERNAME || 'default',
  },

  // CORS - restrict in production
  cors: {
    origin: process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'production' ? undefined : (origin, callback) => {
      if (!origin || /^http:\/\/localhost:(3[0-9]{3})$/.test(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }),
    credentials: true,
  },

  // Security
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 12,
  },
});
