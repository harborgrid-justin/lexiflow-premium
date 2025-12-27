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
}
