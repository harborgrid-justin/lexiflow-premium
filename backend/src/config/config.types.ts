/**
 * Type definitions for application configuration
 * Based on NestJS ConfigModule type-safety best practices
 */

export interface DatabaseConfig {
  url?: string;
  host: string;
  port: number;
  user: string;
  password: string;
  name: string;
  fallbackSqlite: boolean;
  logging: boolean;
  synchronize: boolean;
  ssl: boolean;
  sslRejectUnauthorized: boolean;
  pool: {
    max: number;
    min: number;
    idleTimeout: number;
    connectionTimeout: number;
  };
}

export interface JwtConfig {
  secret: string;
  expiresIn: string;
  refreshSecret: string;
  refreshExpiresIn: string;
}

export interface RedisConfig {
  enabled: boolean;
  host: string;
  port: number;
  password?: string;
  username?: string;
  url?: string;
}

export interface ServerConfig {
  port: number;
  corsOrigin: string;
}

export interface RateLimitConfig {
  ttl: number;
  limit: number;
}

export interface FileStorageConfig {
  uploadDir: string;
  maxFileSize: number;
}

export interface AppConfig {
  nodeEnv: string;
  demoMode: boolean;
  logLevel: string;
}

/**
 * Default Admin User Configuration
 */
export interface DefaultAdminUserConfig {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  title: string;
  department: string;
}

/**
 * Default Admin Profile Configuration
 */
export interface DefaultAdminProfileConfig {
  enabled: boolean;
  barNumber: string | null;
  jurisdictions: string[];
  practiceAreas: string[];
  bio: string;
  yearsOfExperience: number;
  defaultHourlyRate: number;
}

/**
 * Complete Default Admin Configuration
 */
export interface DefaultAdminConfig {
  enabled: boolean;
  user: DefaultAdminUserConfig;
  profile: DefaultAdminProfileConfig;
}

/**
 * Complete application configuration interface
 */
export interface Configuration {
  app: AppConfig;
  server: ServerConfig;
  database: DatabaseConfig;
  jwt: JwtConfig;
  redis: RedisConfig;
  rateLimit: RateLimitConfig;
  fileStorage: FileStorageConfig;
  defaultAdmin: DefaultAdminConfig;
}
