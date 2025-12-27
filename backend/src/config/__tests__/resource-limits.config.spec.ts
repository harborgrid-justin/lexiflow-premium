import resourceLimitsConfig from '@config/resource-limits.config';

describe('Resource Limits Configuration', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('Default Configuration', () => {
    it('should return correct default WebSocket limits', () => {
      const config = resourceLimitsConfig();

      expect(config.websocket).toBeDefined();
      expect(config.websocket.maxConnectionsPerUser).toBe(5);
      expect(config.websocket.maxGlobalConnections).toBe(10000);
      expect(config.websocket.maxRoomsPerUser).toBe(50);
    });

    it('should return correct default rate limit settings', () => {
      const config = resourceLimitsConfig();

      expect(config.websocket.rateLimit).toBeDefined();
      expect(config.websocket.rateLimit.maxEventsPerMinute).toBe(100);
      expect(config.websocket.rateLimit.windowMs).toBe(60000);
    });

    it('should return correct default file storage limits', () => {
      const config = resourceLimitsConfig();

      expect(config.fileStorage).toBeDefined();
      expect(config.fileStorage.maxFileSize).toBe(524288000); // 500MB
      expect(config.fileStorage.minDiskSpace).toBe(1073741824); // 1GB
    });

    it('should return correct default allowed MIME types', () => {
      const config = resourceLimitsConfig();

      expect(config.fileStorage.allowedMimeTypes).toContain('application/pdf');
      expect(config.fileStorage.allowedMimeTypes).toContain('application/msword');
      expect(config.fileStorage.allowedMimeTypes).toContain('image/jpeg');
      expect(config.fileStorage.allowedMimeTypes).toContain('image/png');
      expect(config.fileStorage.allowedMimeTypes).toContain('text/plain');
    });

    it('should return correct default OCR limits', () => {
      const config = resourceLimitsConfig();

      expect(config.ocr).toBeDefined();
      expect(config.ocr.maxFileSize).toBe(104857600); // 100MB
      expect(config.ocr.timeout).toBe(300000); // 5 minutes
      expect(config.ocr.chunkSize).toBe(10485760); // 10MB
    });

    it('should return correct default document version limits', () => {
      const config = resourceLimitsConfig();

      expect(config.documentVersions).toBeDefined();
      expect(config.documentVersions.maxVersionsPerDocument).toBe(100);
      expect(config.documentVersions.autoCleanupEnabled).toBe(false);
      expect(config.documentVersions.retentionPeriodDays).toBe(365);
    });

    it('should return correct default queue limits', () => {
      const config = resourceLimitsConfig();

      expect(config.queue).toBeDefined();
      expect(config.queue.defaultTimeout).toBe(600000); // 10 minutes
      expect(config.queue.maxAttempts).toBe(3);
      expect(config.queue.backoffDelay).toBe(2000);
      expect(config.queue.removeOnComplete).toBe(100);
      expect(config.queue.removeOnFail).toBe(50);
    });
  });

  describe('Environment Variable Overrides', () => {
    it('should override WebSocket connection limits from environment', () => {
      process.env.WS_MAX_CONNECTIONS_PER_USER = '10';
      process.env.WS_MAX_GLOBAL_CONNECTIONS = '50000';
      process.env.WS_MAX_ROOMS_PER_USER = '100';

      const config = resourceLimitsConfig();

      expect(config.websocket.maxConnectionsPerUser).toBe(10);
      expect(config.websocket.maxGlobalConnections).toBe(50000);
      expect(config.websocket.maxRoomsPerUser).toBe(100);
    });

    it('should override rate limit settings from environment', () => {
      process.env.WS_RATE_LIMIT_EVENTS_PER_MINUTE = '200';

      const config = resourceLimitsConfig();

      expect(config.websocket.rateLimit.maxEventsPerMinute).toBe(200);
    });

    it('should override file storage limits from environment', () => {
      process.env.MAX_FILE_SIZE = '1048576000'; // 1GB
      process.env.MIN_DISK_SPACE = '2147483648'; // 2GB

      const config = resourceLimitsConfig();

      expect(config.fileStorage.maxFileSize).toBe(1048576000);
      expect(config.fileStorage.minDiskSpace).toBe(2147483648);
    });

    it('should override allowed MIME types from environment', () => {
      process.env.ALLOWED_MIME_TYPES = 'application/pdf,text/plain';

      const config = resourceLimitsConfig();

      expect(config.fileStorage.allowedMimeTypes).toEqual([
        'application/pdf',
        'text/plain',
      ]);
    });

    it('should override OCR limits from environment', () => {
      process.env.OCR_MAX_FILE_SIZE = '52428800'; // 50MB
      process.env.OCR_TIMEOUT_MS = '600000'; // 10 minutes
      process.env.OCR_CHUNK_SIZE = '5242880'; // 5MB

      const config = resourceLimitsConfig();

      expect(config.ocr.maxFileSize).toBe(52428800);
      expect(config.ocr.timeout).toBe(600000);
      expect(config.ocr.chunkSize).toBe(5242880);
    });

    it('should override document version settings from environment', () => {
      process.env.MAX_VERSIONS_PER_DOCUMENT = '50';
      process.env.VERSION_AUTO_CLEANUP_ENABLED = 'true';
      process.env.VERSION_RETENTION_DAYS = '180';

      const config = resourceLimitsConfig();

      expect(config.documentVersions.maxVersionsPerDocument).toBe(50);
      expect(config.documentVersions.autoCleanupEnabled).toBe(true);
      expect(config.documentVersions.retentionPeriodDays).toBe(180);
    });

    it('should override queue settings from environment', () => {
      process.env.QUEUE_JOB_TIMEOUT_MS = '300000'; // 5 minutes
      process.env.QUEUE_MAX_ATTEMPTS = '5';
      process.env.QUEUE_BACKOFF_DELAY_MS = '5000';
      process.env.QUEUE_REMOVE_ON_COMPLETE = '200';
      process.env.QUEUE_REMOVE_ON_FAIL = '100';

      const config = resourceLimitsConfig();

      expect(config.queue.defaultTimeout).toBe(300000);
      expect(config.queue.maxAttempts).toBe(5);
      expect(config.queue.backoffDelay).toBe(5000);
      expect(config.queue.removeOnComplete).toBe(200);
      expect(config.queue.removeOnFail).toBe(100);
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid numeric environment variables', () => {
      process.env.WS_MAX_CONNECTIONS_PER_USER = 'invalid';
      process.env.MAX_FILE_SIZE = 'not-a-number';

      const config = resourceLimitsConfig();

      // parseInt returns NaN for invalid strings, which should be falsy
      expect(config.websocket.maxConnectionsPerUser).toBe(5); // Falls back to default
    });

    it('should handle empty environment variables', () => {
      process.env.WS_MAX_CONNECTIONS_PER_USER = '';

      const config = resourceLimitsConfig();

      expect(config.websocket.maxConnectionsPerUser).toBe(5);
    });

    it('should handle zero values from environment', () => {
      process.env.WS_MAX_CONNECTIONS_PER_USER = '0';

      const config = resourceLimitsConfig();

      expect(config.websocket.maxConnectionsPerUser).toBe(5); // Falls back to default
    });

    it('should handle negative values from environment', () => {
      process.env.WS_MAX_CONNECTIONS_PER_USER = '-10';

      const config = resourceLimitsConfig();

      expect(config.websocket.maxConnectionsPerUser).toBe(-10); // parseInt allows negative
    });

    it('should handle string "false" for boolean environment variable', () => {
      process.env.VERSION_AUTO_CLEANUP_ENABLED = 'false';

      const config = resourceLimitsConfig();

      expect(config.documentVersions.autoCleanupEnabled).toBe(false);
    });

    it('should handle any string except "true" as false for boolean', () => {
      process.env.VERSION_AUTO_CLEANUP_ENABLED = '1';

      const config = resourceLimitsConfig();

      expect(config.documentVersions.autoCleanupEnabled).toBe(false);
    });
  });

  describe('Configuration Factory', () => {
    it('should return a function when called with registerAs', () => {
      expect(typeof resourceLimitsConfig).toBe('function');
    });

    it('should return consistent configuration on multiple calls', () => {
      const config1 = resourceLimitsConfig();
      const config2 = resourceLimitsConfig();

      expect(config1).toEqual(config2);
    });

    it('should have all required top-level keys', () => {
      const config = resourceLimitsConfig();

      expect(config).toHaveProperty('websocket');
      expect(config).toHaveProperty('fileStorage');
      expect(config).toHaveProperty('ocr');
      expect(config).toHaveProperty('documentVersions');
      expect(config).toHaveProperty('queue');
    });
  });
});
