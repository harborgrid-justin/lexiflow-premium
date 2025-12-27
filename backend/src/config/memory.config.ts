import { registerAs } from '@nestjs/config';

/**
 * Enterprise Memory Configuration
 * 
 * Production-ready memory management settings for NestJS applications.
 * Implements best practices for memory optimization and garbage collection.
 */
export default registerAs('memory', () => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isProduction = nodeEnv === 'production';

  return {
    /**
     * V8 Heap Settings
     * Controls Node.js memory allocation
     */
    heap: {
      maxOldSpaceSize: parseInt(
        process.env.NODE_MAX_OLD_SPACE_SIZE || 
        (isProduction ? '2048' : '1024'),
        10
      ),
      maxSemiSpaceSize: parseInt(
        process.env.NODE_MAX_SEMI_SPACE_SIZE || 
        (isProduction ? '16' : '8'),
        10
      ),
      initialOldSpaceSize: parseInt(
        process.env.NODE_INITIAL_OLD_SPACE_SIZE || 
        (isProduction ? '512' : '256'),
        10
      ),
    },

    /**
     * Garbage Collection Configuration
     * Optimizes V8 GC for enterprise workloads
     */
    gc: {
      exposeGc: process.env.NODE_EXPOSE_GC === 'true' || isProduction,
      maxOldGenerationSizeMb: parseInt(
        process.env.NODE_GC_MAX_OLD_GEN_SIZE || 
        (isProduction ? '1536' : '768'),
        10
      ),
      maxYoungGenerationSizeMb: parseInt(
        process.env.NODE_GC_MAX_YOUNG_GEN_SIZE || 
        (isProduction ? '128' : '64'),
        10
      ),
      optimizeForMemory: process.env.NODE_OPTIMIZE_FOR_MEMORY === 'true' || isProduction,
    },

    /**
     * Stream Processing Thresholds
     * When to use streaming vs buffering
     */
    streaming: {
      fileThresholdBytes: parseInt(
        process.env.STREAM_FILE_THRESHOLD || 
        String(10 * 1024 * 1024),
        10
      ),
      chunkSizeBytes: parseInt(
        process.env.STREAM_CHUNK_SIZE || 
        String(64 * 1024),
        10
      ),
      highWaterMarkBytes: parseInt(
        process.env.STREAM_HIGH_WATER_MARK || 
        String(16 * 1024),
        10
      ),
    },

    /**
     * Response Compression Settings
     * Reduces memory and bandwidth usage
     */
    compression: {
      enabled: process.env.COMPRESSION_ENABLED !== 'false',
      level: parseInt(process.env.COMPRESSION_LEVEL || '6', 10),
      threshold: parseInt(
        process.env.COMPRESSION_THRESHOLD || 
        String(1024),
        10
      ),
      memLevel: parseInt(process.env.COMPRESSION_MEM_LEVEL || '8', 10),
    },

    /**
     * Cache Configuration
     * In-memory caching limits
     */
    cache: {
      maxSize: parseInt(
        process.env.CACHE_MAX_SIZE || 
        (isProduction ? '100' : '50'),
        10
      ),
      maxAge: parseInt(
        process.env.CACHE_MAX_AGE || 
        String(5 * 60 * 1000),
        10
      ),
      ttl: parseInt(
        process.env.CACHE_TTL || 
        String(30 * 1000),
        10
      ),
      checkPeriod: parseInt(
        process.env.CACHE_CHECK_PERIOD || 
        String(60 * 1000),
        10
      ),
    },

    /**
     * Request Payload Limits
     * Prevents memory exhaustion from large requests
     */
    payload: {
      jsonLimit: process.env.PAYLOAD_JSON_LIMIT || '10mb',
      urlEncodedLimit: process.env.PAYLOAD_URLENCODED_LIMIT || '10mb',
      textLimit: process.env.PAYLOAD_TEXT_LIMIT || '10mb',
      rawLimit: process.env.PAYLOAD_RAW_LIMIT || '50mb',
    },

    /**
     * Memory Monitoring Thresholds
     * Triggers alerts when limits are approached
     */
    monitoring: {
      enabled: process.env.MEMORY_MONITORING_ENABLED !== 'false',
      warningThreshold: parseFloat(
        process.env.MEMORY_WARNING_THRESHOLD || '0.75'
      ),
      criticalThreshold: parseFloat(
        process.env.MEMORY_CRITICAL_THRESHOLD || '0.90'
      ),
      checkIntervalMs: parseInt(
        process.env.MEMORY_CHECK_INTERVAL || 
        String(30 * 1000),
        10
      ),
      gcAfterThreshold: process.env.MEMORY_GC_AFTER_THRESHOLD !== 'false',
    },

    /**
     * Connection Pool Limits
     * Prevents connection memory leaks
     */
    pooling: {
      database: {
        max: parseInt(process.env.DB_POOL_MAX || '20', 10),
        min: parseInt(process.env.DB_POOL_MIN || '5', 10),
        idleTimeoutMs: parseInt(
          process.env.DB_IDLE_TIMEOUT || 
          String(30 * 1000),
          10
        ),
        acquireTimeoutMs: parseInt(
          process.env.DB_ACQUIRE_TIMEOUT || 
          String(60 * 1000),
          10
        ),
      },
      redis: {
        maxClients: parseInt(process.env.REDIS_MAX_CLIENTS || '50', 10),
        minClients: parseInt(process.env.REDIS_MIN_CLIENTS || '5', 10),
        acquireTimeoutMs: parseInt(
          process.env.REDIS_ACQUIRE_TIMEOUT || 
          String(10 * 1000),
          10
        ),
      },
    },

    /**
     * Resource Cleanup Settings
     * Automatic cleanup of unused resources
     */
    cleanup: {
      enabled: process.env.MEMORY_CLEANUP_ENABLED !== 'false',
      intervalMs: parseInt(
        process.env.MEMORY_CLEANUP_INTERVAL || 
        String(5 * 60 * 1000),
        10
      ),
      aggressiveMode: process.env.MEMORY_CLEANUP_AGGRESSIVE === 'true',
    },
  };
});

/**
 * Memory Configuration Export
 */
export const MEMORY_CONFIG = {
  HEAP_MAX_OLD_SPACE_SIZE: parseInt(
    process.env.NODE_MAX_OLD_SPACE_SIZE || '2048',
    10
  ),
  HEAP_MAX_SEMI_SPACE_SIZE: parseInt(
    process.env.NODE_MAX_SEMI_SPACE_SIZE || '16',
    10
  ),
  STREAM_FILE_THRESHOLD: 10 * 1024 * 1024,
  STREAM_CHUNK_SIZE: 64 * 1024,
  COMPRESSION_LEVEL: 6,
  CACHE_MAX_SIZE: 100,
  CACHE_MAX_AGE: 5 * 60 * 1000,
  PAYLOAD_JSON_LIMIT: '10mb',
  PAYLOAD_RAW_LIMIT: '50mb',
  MEMORY_WARNING_THRESHOLD: 0.75,
  MEMORY_CRITICAL_THRESHOLD: 0.90,
  MONITORING_CHECK_INTERVAL: 30 * 1000,
  CLEANUP_INTERVAL: 5 * 60 * 1000,
};
