import { registerAs } from '@nestjs/config';
import { RedisOptions } from 'ioredis';

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
  retryStrategy?: (times: number) => number | void;
  maxRetriesPerRequest?: number;
  enableReadyCheck?: boolean;
  enableOfflineQueue?: boolean;
  connectTimeout?: number;
  disconnectTimeout?: number;
  commandTimeout?: number;
  keepAlive?: number;
  family?: number;
  lazyConnect?: boolean;
}

export const redisConfig = registerAs('redis', (): RedisConfig => {
  const config: RedisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    db: parseInt(process.env.REDIS_DB, 10) || 0,
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'lexiflow:',

    // Optional password
    password: process.env.REDIS_PASSWORD || undefined,

    // Connection settings
    connectTimeout: 10000,
    disconnectTimeout: 2000,
    commandTimeout: 5000,
    keepAlive: 30000,
    family: 4, // IPv4

    // Retry strategy
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },

    // Request settings
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    enableOfflineQueue: true,
    lazyConnect: false,
  };

  return config;
});

// Bull Queue Redis configuration
export const bullRedisConfig = registerAs('bull', () => ({
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_BULL_DB, 10) || 1, // Use different DB for Bull queues
    keyPrefix: 'bull:',
    maxRetriesPerRequest: null, // Bull requires this to be null
    enableReadyCheck: false,
    enableOfflineQueue: false,
  },
  prefix: 'lexiflow',
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: {
      age: 24 * 3600, // Keep completed jobs for 24 hours
      count: 1000, // Keep last 1000 completed jobs
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // Keep failed jobs for 7 days
    },
  },
}));

// Session Redis configuration
export const sessionRedisConfig = registerAs('session', () => ({
  store: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_SESSION_DB, 10) || 2, // Use different DB for sessions
    prefix: 'sess:',
    ttl: parseInt(process.env.SESSION_TTL, 10) || 86400, // 24 hours in seconds
  },
  secret: process.env.SESSION_SECRET || 'lexiflow-session-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: parseInt(process.env.SESSION_MAX_AGE, 10) || 86400000, // 24 hours in milliseconds
    sameSite: 'strict' as const,
  },
}));

export default redisConfig;
