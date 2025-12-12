import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType, RedisClientOptions } from 'redis';

/**
 * Redis Configuration for LexiFlow AI Legal Suite
 *
 * Provides Redis connection management with:
 * - Connection pooling
 * - Automatic reconnection
 * - Error handling and logging
 * - Multiple database support
 * - Health monitoring
 */

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  maxRetries: number;
  retryDelay: number;
  connectTimeout: number;
  keepAlive: number;
  family: number;
}

export interface RedisPoolConfig {
  min: number;
  max: number;
  acquireTimeoutMillis: number;
  idleTimeoutMillis: number;
}

@Injectable()
export class RedisConfigService {
  private static clients: Map<string, RedisClientType> = new Map();
  private static isConnecting: Map<string, boolean> = new Map();

  constructor(private configService: ConfigService) {}

  /**
   * Get Redis configuration from environment variables
   */
  getRedisConfig(database: number = 0): RedisConfig {
    return {
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD'),
      db: database,
      maxRetries: this.configService.get<number>('REDIS_MAX_RETRIES', 10),
      retryDelay: this.configService.get<number>('REDIS_RETRY_DELAY', 3000),
      connectTimeout: this.configService.get<number>('REDIS_CONNECT_TIMEOUT', 10000),
      keepAlive: this.configService.get<number>('REDIS_KEEP_ALIVE', 30000),
      family: 4, // IPv4
    };
  }

  /**
   * Get Redis client options for redis package
   */
  getRedisClientOptions(database: number = 0): RedisClientOptions {
    const config = this.getRedisConfig(database);

    const options: RedisClientOptions = {
      socket: {
        host: config.host,
        port: config.port,
        connectTimeout: config.connectTimeout,
        keepAlive: config.keepAlive,
        reconnectStrategy: (retries: number) => {
          if (retries > config.maxRetries) {
            console.error(`Redis: Max retries (${config.maxRetries}) reached. Giving up.`);
            return new Error('Max retries reached');
          }
          const delay = Math.min(retries * config.retryDelay, 30000);
          console.log(`Redis: Reconnecting in ${delay}ms (attempt ${retries}/${config.maxRetries})`);
          return delay;
        },
      },
      database: config.db,
    };

    if (config.password) {
      options.password = config.password;
    }

    return options;
  }

  /**
   * Create and configure a Redis client
   */
  async createClient(name: string = 'default', database: number = 0): Promise<RedisClientType> {
    const clientKey = `${name}_${database}`;

    // Return existing client if available and connected
    if (RedisConfigService.clients.has(clientKey)) {
      const existingClient = RedisConfigService.clients.get(clientKey);
      if (existingClient?.isOpen) {
        return existingClient;
      }
    }

    // Prevent concurrent connection attempts
    if (RedisConfigService.isConnecting.get(clientKey)) {
      // Wait for the existing connection attempt
      await new Promise(resolve => setTimeout(resolve, 100));
      return this.createClient(name, database);
    }

    RedisConfigService.isConnecting.set(clientKey, true);

    try {
      console.log(`Redis: Creating client '${name}' for database ${database}...`);

      const options = this.getRedisClientOptions(database);
      const client = createClient(options) as RedisClientType;

      // Set up event listeners
      this.setupEventListeners(client, name);

      // Connect to Redis
      await client.connect();

      console.log(`✓ Redis: Client '${name}' connected successfully to database ${database}`);

      // Store the client
      RedisConfigService.clients.set(clientKey, client);

      return client;

    } catch (error) {
      console.error(`❌ Redis: Failed to create client '${name}':`, error.message);
      throw error;
    } finally {
      RedisConfigService.isConnecting.set(clientKey, false);
    }
  }

  /**
   * Set up event listeners for Redis client
   */
  private setupEventListeners(client: RedisClientType, name: string): void {
    client.on('connect', () => {
      console.log(`Redis [${name}]: Connection established`);
    });

    client.on('ready', () => {
      console.log(`Redis [${name}]: Ready to accept commands`);
    });

    client.on('error', (error) => {
      console.error(`Redis [${name}]: Error -`, error.message);
    });

    client.on('reconnecting', () => {
      console.log(`Redis [${name}]: Reconnecting...`);
    });

    client.on('end', () => {
      console.log(`Redis [${name}]: Connection closed`);
    });
  }

  /**
   * Get an existing Redis client
   */
  getClient(name: string = 'default', database: number = 0): RedisClientType | undefined {
    const clientKey = `${name}_${database}`;
    return RedisConfigService.clients.get(clientKey);
  }

  /**
   * Disconnect a specific Redis client
   */
  async disconnectClient(name: string = 'default', database: number = 0): Promise<void> {
    const clientKey = `${name}_${database}`;
    const client = RedisConfigService.clients.get(clientKey);

    if (client) {
      try {
        await client.quit();
        RedisConfigService.clients.delete(clientKey);
        console.log(`Redis: Client '${name}' disconnected successfully`);
      } catch (error) {
        console.error(`Redis: Error disconnecting client '${name}':`, error.message);
        // Force disconnect
        await client.disconnect();
        RedisConfigService.clients.delete(clientKey);
      }
    }
  }

  /**
   * Disconnect all Redis clients
   */
  async disconnectAll(): Promise<void> {
    console.log('Redis: Disconnecting all clients...');

    const disconnectPromises = Array.from(RedisConfigService.clients.entries()).map(
      async ([key, client]) => {
        try {
          await client.quit();
          console.log(`Redis: Client '${key}' disconnected`);
        } catch (error) {
          console.error(`Redis: Error disconnecting client '${key}':`, error.message);
          await client.disconnect();
        }
      }
    );

    await Promise.all(disconnectPromises);
    RedisConfigService.clients.clear();
    console.log('✓ Redis: All clients disconnected');
  }

  /**
   * Check if Redis is connected and healthy
   */
  async healthCheck(name: string = 'default', database: number = 0): Promise<boolean> {
    try {
      const client = this.getClient(name, database);

      if (!client || !client.isOpen) {
        return false;
      }

      // Ping Redis to verify connection
      const response = await client.ping();
      return response === 'PONG';

    } catch (error) {
      console.error(`Redis health check failed for '${name}':`, error.message);
      return false;
    }
  }

  /**
   * Get Redis connection info
   */
  async getConnectionInfo(name: string = 'default', database: number = 0): Promise<any> {
    try {
      const client = this.getClient(name, database);

      if (!client || !client.isOpen) {
        return { connected: false };
      }

      const info = await client.info('server');
      const stats = await client.info('stats');
      const memory = await client.info('memory');

      return {
        connected: true,
        serverInfo: info,
        stats,
        memory,
        clientName: name,
        database,
      };

    } catch (error) {
      console.error(`Redis: Error getting connection info for '${name}':`, error.message);
      return { connected: false, error: error.message };
    }
  }

  /**
   * Flush database (use with caution!)
   */
  async flushDatabase(name: string = 'default', database: number = 0): Promise<void> {
    const client = this.getClient(name, database);

    if (!client || !client.isOpen) {
      throw new Error(`Redis client '${name}' is not connected`);
    }

    console.warn(`Redis: Flushing database ${database}...`);
    await client.flushDb();
    console.log(`Redis: Database ${database} flushed`);
  }
}

/**
 * Redis Database Assignments
 * Different databases for different purposes
 */
export enum RedisDatabase {
  DEFAULT = 0,           // Default cache
  SESSIONS = 1,          // User sessions
  QUEUES = 2,            // Background job queues
  RATE_LIMITING = 3,     // Rate limiting data
  ANALYTICS = 4,         // Analytics and metrics
  TEMPORARY = 5,         // Temporary data with short TTL
  SEARCH_CACHE = 6,      // Full-text search results cache
  DOCUMENT_CACHE = 7,    // Document processing cache
  API_CACHE = 8,         // API response cache
  WEBSOCKET = 9,         // WebSocket connection data
}

/**
 * Cache key prefixes for organization
 */
export enum CacheKeyPrefix {
  USER = 'user:',
  CASE = 'case:',
  CLIENT = 'client:',
  DOCUMENT = 'doc:',
  SEARCH = 'search:',
  ANALYTICS = 'analytics:',
  SESSION = 'session:',
  RATE_LIMIT = 'ratelimit:',
  TEMP = 'temp:',
  QUEUE = 'queue:',
  LOCK = 'lock:',
}

/**
 * Default TTL values (in seconds)
 */
export const DEFAULT_CACHE_TTL = {
  SHORT: 60,              // 1 minute
  MEDIUM: 300,            // 5 minutes
  LONG: 3600,             // 1 hour
  VERY_LONG: 86400,       // 24 hours
  SESSION: 86400 * 7,     // 7 days
  PERMANENT: -1,          // No expiration
};
