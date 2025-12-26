export default () => ({
  // Application
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || ((_origin: any, callback: any) => {
      // Allow all origins in development (for accessing from any IP)
      // In production, set CORS_ORIGIN environment variable to restrict
      callback(null, true);
    }),
    credentials: true,
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'lexiflow-super-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'lexiflow-refresh-secret-key',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  // Database
  database: {
    type: process.env.DB_TYPE || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'lexiflow',
    password: process.env.DB_PASSWORD || 'lexiflow',
    database: process.env.DB_NAME || 'lexiflow',
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: process.env.DB_LOGGING === 'true',
  },

  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || '',
    db: parseInt(process.env.REDIS_DB || '0', 10),
    ttl: parseInt(process.env.REDIS_TTL || '3600', 10),
  },

  // File Storage
  storage: {
    uploadDir: process.env.UPLOAD_DIR || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
    allowedMimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif',
    ],
  },

  // Email/SMTP
  email: {
    enabled: process.env.EMAIL_ENABLED === 'true',
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    from: process.env.SMTP_FROM || 'noreply@lexiflow.com',
  },

  // OCR
  ocr: {
    enabled: process.env.OCR_ENABLED === 'true',
    engine: process.env.OCR_ENGINE || 'tesseract',
    language: process.env.OCR_LANGUAGE || 'eng',
  },

  // Search
  search: {
    enabled: process.env.SEARCH_ENABLED === 'true',
    indexPath: process.env.SEARCH_INDEX_PATH || './search-index',
  },

  // Rate Limiting
  rateLimit: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL || '60000', 10), // 1 minute
    limit: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    directory: process.env.LOG_DIR || './logs',
  },

  // Security
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
    sessionSecret: process.env.SESSION_SECRET || 'lexiflow-session-secret',
    csrfEnabled: process.env.CSRF_ENABLED === 'true',
  },

  // Frontend URL (for emails, redirects, etc.)
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  // Third-party Integrations
  integrations: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
    microsoft: {
      clientId: process.env.MICROSOFT_CLIENT_ID || '',
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
    },
  },

  // Feature Flags
  features: {
    graphql: process.env.FEATURE_GRAPHQL === 'true',
    websockets: process.env.FEATURE_WEBSOCKETS !== 'false',
    queues: process.env.FEATURE_QUEUES !== 'false',
    analytics: process.env.FEATURE_ANALYTICS !== 'false',
  },

  // Demo Mode
  demoMode: process.env.DEMO_MODE === 'true',
});
