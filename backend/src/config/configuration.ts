import { registerAs } from "@nestjs/config";
import { Configuration } from "./config.types";

/**
 * Application configuration factory
 * Using registerAs() for namespaced configuration - NestJS best practice
 * @see https://docs.nestjs.com/techniques/configuration#configuration-namespaces
 */
export default registerAs(
  "app",
  (): Configuration => ({
    app: {
      nodeEnv: process.env.NODE_ENV || "development",
      demoMode: process.env.DEMO_MODE === "true",
      logLevel: process.env.LOG_LEVEL || "info",
    },
    server: {
      port: parseInt(process.env.PORT || "3001", 10),
      corsOrigin: process.env.CORS_ORIGIN?.includes(",")
        ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
        : process.env.CORS_ORIGIN || "*",
    },
    database: {
      url: process.env.DATABASE_URL,
      host: process.env.DATABASE_HOST || "localhost",
      port: parseInt(process.env.DATABASE_PORT || "5432", 10),
      user: process.env.DATABASE_USER || "postgres",
      password: process.env.DATABASE_PASSWORD || "",
      name: process.env.DATABASE_NAME || "lexiflow",
      fallbackSqlite: process.env.DB_FALLBACK_SQLITE === "true",
      logging: process.env.DB_LOGGING === "true",
      synchronize: process.env.DB_SYNCHRONIZE === "true",
      ssl: process.env.DB_SSL === "true",
      sslRejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false",
      pool: {
        max: parseInt(process.env.DB_POOL_MAX || "20", 10),
        min: parseInt(process.env.DB_POOL_MIN || "2", 10),
        idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || "30000", 10),
        connectionTimeout: parseInt(
          process.env.DB_CONNECTION_TIMEOUT || "10000",
          10
        ),
      },
    },
    jwt: {
      secret: process.env.JWT_SECRET || "change-me-in-production",
      expiresIn: process.env.JWT_EXPIRATION || "1h",
      refreshSecret:
        process.env.JWT_REFRESH_SECRET || "change-me-in-production-refresh",
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRATION || "7d",
    },
    redis: {
      enabled:
        process.env.REDIS_ENABLED !== "false" &&
        process.env.DEMO_MODE !== "true",
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379", 10),
      password: process.env.REDIS_PASSWORD,
      username: process.env.REDIS_USERNAME,
      url: process.env.REDIS_URL,
    },
    rateLimit: {
      ttl: parseInt(process.env.RATE_LIMIT_TTL || "60000", 10),
      limit: parseInt(process.env.RATE_LIMIT_LIMIT || "100", 10),
    },
    fileStorage: {
      uploadDir: process.env.UPLOAD_DIR || "./uploads",
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "10485760", 10),
    },
    defaultAdmin: {
      enabled: process.env.DEFAULT_ADMIN_ENABLED !== "false",
      user: {
        email: process.env.DEFAULT_ADMIN_EMAIL || "admin@lexiflow.com",
        password: process.env.DEFAULT_ADMIN_PASSWORD || "Admin123!",
        firstName: process.env.DEFAULT_ADMIN_FIRST_NAME || "Super",
        lastName: process.env.DEFAULT_ADMIN_LAST_NAME || "Admin",
        title: process.env.DEFAULT_ADMIN_TITLE || "System Administrator",
        department: process.env.DEFAULT_ADMIN_DEPARTMENT || "Administration",
      },
      profile: {
        enabled: process.env.DEFAULT_ADMIN_PROFILE_ENABLED !== "false",
        barNumber: process.env.DEFAULT_ADMIN_BAR_NUMBER || null,
        jurisdictions: process.env.DEFAULT_ADMIN_JURISDICTIONS
          ? JSON.parse(process.env.DEFAULT_ADMIN_JURISDICTIONS)
          : ["Global"],
        practiceAreas: process.env.DEFAULT_ADMIN_PRACTICE_AREAS
          ? JSON.parse(process.env.DEFAULT_ADMIN_PRACTICE_AREAS)
          : ["System Administration", "Platform Management"],
        bio:
          process.env.DEFAULT_ADMIN_BIO ||
          "Global system administrator with full platform access and management capabilities.",
        yearsOfExperience: parseInt(
          process.env.DEFAULT_ADMIN_YEARS_OF_EXPERIENCE || "0",
          10
        ),
        defaultHourlyRate: parseFloat(
          process.env.DEFAULT_ADMIN_DEFAULT_HOURLY_RATE || "0"
        ),
      },
    },
  })
);
