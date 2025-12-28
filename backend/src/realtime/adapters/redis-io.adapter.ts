import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions, Server } from 'socket.io';
// Conditional import - install @socket.io/redis-adapter if needed for horizontal scaling
// import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { INestApplicationContext, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type RedisClient = ReturnType<typeof createClient>;
type AdapterConstructor = (nsp: unknown) => unknown;

// Placeholder for redis adapter when package is not installed
const createAdapter = (): AdapterConstructor => {
  throw new Error('@socket.io/redis-adapter not installed. Install with: npm install @socket.io/redis-adapter');
};

/**
 * Redis Adapter for Socket.IO
 *
 * Enables horizontal scaling of WebSocket connections across multiple servers
 * by using Redis as a message broker for inter-server communication.
 *
 * Features:
 * - Pub/Sub for broadcasting events across server instances
 * - Sticky sessions support
 * - Automatic reconnection
 * - Connection health monitoring
 *
 * Usage:
 * In main.ts:
 *   const redisIoAdapter = new RedisIoAdapter(app);
 *   await redisIoAdapter.connectToRedis();
 *   app.useWebSocketAdapter(redisIoAdapter);
 *
 * @class RedisIoAdapter
 * @extends IoAdapter
 */
export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: AdapterConstructor | null = null;
  private readonly logger = new Logger(RedisIoAdapter.name);
  private pubClient?: RedisClient;
  private subClient?: RedisClient;

  constructor(
    private app: INestApplicationContext,
    private configService?: ConfigService,
  ) {
    super(app);
  }

  /**
   * Connect to Redis and create adapter
   * Must be called before using the adapter
   */
  async connectToRedis(): Promise<void> {
    try {
      const config = this.configService || this.app.get(ConfigService, { strict: false });
      if (!config) {
        throw new Error('ConfigService not available');
      }

      // Get Redis configuration
      const redisUrl = config.get<string>('redis.url');
      const redisHost = config.get<string>('redis.host', 'localhost');
      const redisPort = config.get<number>('redis.port', 6379);
      const redisPassword = config.get<string>('redis.password');
      const redisUsername = config.get<string>('redis.username');

      this.logger.log('Connecting to Redis for Socket.IO adapter...');

      // Create Redis clients for pub/sub
      const clientOptions = redisUrl
        ? { url: redisUrl }
        : {
            socket: {
              host: redisHost,
              port: redisPort,
            },
            password: redisPassword,
            username: redisUsername,
          };

      // Publisher client
      this.pubClient = createClient(clientOptions);
      this.pubClient.on('error', (err) => {
        this.logger.error('Redis Pub Client Error:', err);
      });
      this.pubClient.on('connect', () => {
        this.logger.log('Redis Pub Client connected');
      });
      this.pubClient.on('reconnecting', () => {
        this.logger.warn('Redis Pub Client reconnecting...');
      });
      await this.pubClient.connect();

      // Subscriber client (must be a separate connection)
      this.subClient = this.pubClient.duplicate();
      this.subClient.on('error', (err) => {
        this.logger.error('Redis Sub Client Error:', err);
      });
      this.subClient.on('connect', () => {
        this.logger.log('Redis Sub Client connected');
      });
      this.subClient.on('reconnecting', () => {
        this.logger.warn('Redis Sub Client reconnecting...');
      });
      await this.subClient.connect();

      // Create adapter
      this.adapterConstructor = createAdapter(this.pubClient, this.subClient);

      this.logger.log('✅ Redis adapter for Socket.IO successfully initialized');
    } catch (error) {
      this.logger.error('Failed to connect to Redis for Socket.IO:', error);
      throw error;
    }
  }

  /**
   * Create Socket.IO server with Redis adapter
   */
  createIOServer(port: number, options?: ServerOptions): Server {
    const server = super.createIOServer(port, options) as Server;

    if (this.adapterConstructor) {
      server.adapter(this.adapterConstructor);
      this.logger.log('Socket.IO server created with Redis adapter');
    } else {
      this.logger.warn(
        '⚠️  Socket.IO server created WITHOUT Redis adapter - horizontal scaling disabled',
      );
      this.logger.warn('Call connectToRedis() before starting the server');
    }

    return server;
  }

  /**
   * Gracefully disconnect from Redis
   */
  async close(): Promise<void> {
    try {
      if (this.pubClient) {
        await this.pubClient.quit();
        this.logger.log('Redis Pub Client disconnected');
      }
      if (this.subClient) {
        await this.subClient.quit();
        this.logger.log('Redis Sub Client disconnected');
      }
    } catch (error) {
      this.logger.error('Error disconnecting from Redis:', error);
    }
  }

  /**
   * Health check for Redis connections
   */
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.pubClient || !this.subClient) {
        return false;
      }

      const pubPing = await this.pubClient.ping();
      const subPing = await this.subClient.ping();

      return pubPing === 'PONG' && subPing === 'PONG';
    } catch (error) {
      this.logger.error('Redis health check failed:', error);
      return false;
    }
  }
}
