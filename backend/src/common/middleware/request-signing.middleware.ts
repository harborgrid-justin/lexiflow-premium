import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export interface RequestSignatureConfig {
  enabled: boolean;
  algorithm: string;
  signatureHeader: string;
  timestampHeader: string;
  nonceHeader: string;
  maxTimestampDrift: number; // in seconds
  secretKey: string;
}

/**
 * Request Signing Middleware
 * Implements HMAC-based request signing for API integrity
 * OWASP ASVS V9.1 - Communications Security
 */
@Injectable()
export class RequestSigningMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RequestSigningMiddleware.name);
  private readonly config: RequestSignatureConfig;
  private readonly nonceCache: Set<string> = new Set();
  private readonly NONCE_CACHE_SIZE = 10000;
  private readonly NONCE_CLEANUP_INTERVAL = 300000; // 5 minutes

  constructor(private configService: ConfigService) {
    this.config = {
      enabled:
        this.configService.get<string>('REQUEST_SIGNING_ENABLED') === 'true',
      algorithm: this.configService.get<string>('REQUEST_SIGNING_ALGORITHM') || 'sha256',
      signatureHeader: 'x-signature',
      timestampHeader: 'x-timestamp',
      nonceHeader: 'x-nonce',
      maxTimestampDrift: parseInt(
        this.configService.get<string>('REQUEST_SIGNING_MAX_DRIFT') || '300',
        10,
      ), // 5 minutes default
      secretKey:
        this.configService.get<string>('REQUEST_SIGNING_SECRET') ||
        'change-this-in-production',
    };

    if (this.config.enabled) {
      this.logger.log('Request signing middleware enabled');
      // Start nonce cache cleanup
      this.startNonceCacheCleanup();
    }
  }

  async use(req: Request, res: Response, next: NextFunction) {
    // Skip if not enabled
    if (!this.config.enabled) {
      return next();
    }

    // Skip for certain routes (health checks, public endpoints)
    if (this.shouldSkipValidation(req.path)) {
      return next();
    }

    try {
      // Extract signature components
      const signature = req.headers[this.config.signatureHeader] as string;
      const timestamp = req.headers[this.config.timestampHeader] as string;
      const nonce = req.headers[this.config.nonceHeader] as string;

      // Validate presence of required headers
      if (!signature || !timestamp || !nonce) {
        throw new UnauthorizedException(
          'Missing request signature headers',
        );
      }

      // Validate timestamp
      this.validateTimestamp(timestamp);

      // Validate nonce (prevent replay attacks)
      this.validateNonce(nonce);

      // Get request body
      const body = (req as any).rawBody || JSON.stringify(req.body || {});

      // Compute expected signature
      const expectedSignature = this.computeSignature(
        req.method,
        req.path,
        timestamp,
        nonce,
        body,
        this.config.secretKey,
      );

      // Compare signatures using constant-time comparison
      if (!this.secureCompare(signature, expectedSignature)) {
        throw new UnauthorizedException('Invalid request signature');
      }

      // Store nonce to prevent replay
      this.storeNonce(nonce);

      // Add signature validation info to request
      (req as any).signatureValidated = true;
      (req as any).signatureTimestamp = timestamp;

      next();
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        this.logger.warn(
          `Request signature validation failed: ${error.message} - Path: ${req.path}`,
        );
        throw error;
      }

      this.logger.error(
        `Request signature validation error: ${error.message}`,
      );
      throw new UnauthorizedException('Request signature validation failed');
    }
  }

  /**
   * Compute HMAC signature for request
   */
  computeSignature(
    method: string,
    path: string,
    timestamp: string,
    nonce: string,
    body: string,
    secretKey: string,
  ): string {
    // Create canonical request string
    const canonicalRequest = [
      method.toUpperCase(),
      path,
      timestamp,
      nonce,
      body,
    ].join('\n');

    // Compute HMAC
    const hmac = crypto.createHmac(this.config.algorithm, secretKey);
    hmac.update(canonicalRequest);
    return hmac.digest('hex');
  }

  /**
   * Validate timestamp to prevent replay attacks
   */
  private validateTimestamp(timestamp: string): void {
    const requestTime = parseInt(timestamp, 10);

    if (isNaN(requestTime)) {
      throw new UnauthorizedException('Invalid timestamp format');
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const timeDiff = Math.abs(currentTime - requestTime);

    if (timeDiff > this.config.maxTimestampDrift) {
      throw new UnauthorizedException(
        'Request timestamp outside acceptable window',
      );
    }
  }

  /**
   * Validate nonce to prevent replay attacks
   */
  private validateNonce(nonce: string): void {
    if (!nonce || nonce.length < 16) {
      throw new UnauthorizedException('Invalid nonce format');
    }

    if (this.nonceCache.has(nonce)) {
      throw new UnauthorizedException('Duplicate nonce detected (replay attack)');
    }
  }

  /**
   * Store nonce in cache
   */
  private storeNonce(nonce: string): void {
    this.nonceCache.add(nonce);

    // Prevent cache from growing too large
    if (this.nonceCache.size > this.NONCE_CACHE_SIZE) {
      // Remove oldest entries (simple approach - in production use a proper LRU cache)
      const iterator = this.nonceCache.values();
      for (let i = 0; i < 1000; i++) {
        const value = iterator.next().value;
        if (value) {
          this.nonceCache.delete(value);
        }
      }
    }
  }

  /**
   * Constant-time string comparison to prevent timing attacks
   */
  private secureCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  }

  /**
   * Check if path should skip signature validation
   */
  private shouldSkipValidation(path: string): boolean {
    const skipPaths = [
      '/health',
      '/metrics',
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/forgot-password',
    ];

    return skipPaths.some((skipPath) => path.startsWith(skipPath));
  }

  /**
   * Start periodic nonce cache cleanup
   */
  private startNonceCacheCleanup(): void {
    setInterval(() => {
      const oldSize = this.nonceCache.size;
      this.nonceCache.clear();
      this.logger.debug(
        `Cleared nonce cache (${oldSize} entries)`,
      );
    }, this.NONCE_CLEANUP_INTERVAL);
  }
}

/**
 * Utility class for generating request signatures (client-side)
 */
export class RequestSigner {
  /**
   * Sign a request
   */
  static signRequest(
    method: string,
    path: string,
    body: any,
    secretKey: string,
    algorithm: string = 'sha256',
  ): {
    signature: string;
    timestamp: string;
    nonce: string;
  } {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = this.generateNonce();
    const bodyString =
      typeof body === 'string' ? body : JSON.stringify(body || {});

    const canonicalRequest = [
      method.toUpperCase(),
      path,
      timestamp,
      nonce,
      bodyString,
    ].join('\n');

    const hmac = crypto.createHmac(algorithm, secretKey);
    hmac.update(canonicalRequest);
    const signature = hmac.digest('hex');

    return {
      signature,
      timestamp,
      nonce,
    };
  }

  /**
   * Generate cryptographically secure nonce
   */
  static generateNonce(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Verify a signature
   */
  static verifySignature(
    method: string,
    path: string,
    body: any,
    signature: string,
    timestamp: string,
    nonce: string,
    secretKey: string,
    algorithm: string = 'sha256',
  ): boolean {
    const bodyString =
      typeof body === 'string' ? body : JSON.stringify(body || {});

    const canonicalRequest = [
      method.toUpperCase(),
      path,
      timestamp,
      nonce,
      bodyString,
    ].join('\n');

    const hmac = crypto.createHmac(algorithm, secretKey);
    hmac.update(canonicalRequest);
    const expectedSignature = hmac.digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );
  }
}

/**
 * API Key Authentication Middleware
 * Simpler alternative to request signing for server-to-server communication
 */
@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ApiKeyMiddleware.name);
  private readonly validApiKeys: Set<string>;

  constructor(private configService: ConfigService) {
    const apiKeysConfig =
      this.configService.get<string>('API_KEYS') || '';
    this.validApiKeys = new Set(
      apiKeysConfig.split(',').map((key) => key.trim()).filter((key) => key),
    );

    if (this.validApiKeys.size > 0) {
      this.logger.log(
        `API Key middleware enabled with ${this.validApiKeys.size} valid keys`,
      );
    }
  }

  use(req: Request, res: Response, next: NextFunction) {
    // Skip if no API keys configured
    if (this.validApiKeys.size === 0) {
      return next();
    }

    // Skip for certain routes
    if (this.shouldSkipValidation(req.path)) {
      return next();
    }

    // Extract API key from header
    const apiKey =
      req.headers['x-api-key'] as string ||
      req.headers['authorization']?.replace('Bearer ', '');

    if (!apiKey) {
      this.logger.warn(
        `Missing API key for request to ${req.path} from ${req.ip}`,
      );
      throw new UnauthorizedException('API key required');
    }

    // Validate API key
    if (!this.validApiKeys.has(apiKey)) {
      this.logger.warn(
        `Invalid API key for request to ${req.path} from ${req.ip}`,
      );
      throw new UnauthorizedException('Invalid API key');
    }

    // Add API key info to request
    (req as any).apiKeyValidated = true;

    next();
  }

  private shouldSkipValidation(path: string): boolean {
    const skipPaths = [
      '/health',
      '/metrics',
      '/api/auth/login',
      '/api/auth/register',
    ];

    return skipPaths.some((skipPath) => path.startsWith(skipPath));
  }
}

/**
 * Webhook Signature Verification Middleware
 * For verifying webhook signatures from third-party services
 */
@Injectable()
export class WebhookSignatureMiddleware implements NestMiddleware {
  private readonly logger = new Logger(WebhookSignatureMiddleware.name);

  constructor(private configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Only validate webhook endpoints
    if (!req.path.startsWith('/api/webhooks/')) {
      return next();
    }

    try {
      const signature = req.headers['x-webhook-signature'] as string;
      const timestamp = req.headers['x-webhook-timestamp'] as string;

      if (!signature || !timestamp) {
        throw new UnauthorizedException('Missing webhook signature');
      }

      // Get webhook secret for the provider
      const provider = this.extractProvider(req.path);
      const secret = this.configService.get<string>(
        `WEBHOOK_SECRET_${provider.toUpperCase()}`,
      );

      if (!secret) {
        throw new UnauthorizedException('Webhook secret not configured');
      }

      // Verify signature
      const body = (req as any).rawBody || JSON.stringify(req.body || {});
      const expectedSignature = this.computeWebhookSignature(
        body,
        timestamp,
        secret,
      );

      if (!crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature),
      )) {
        throw new UnauthorizedException('Invalid webhook signature');
      }

      // Validate timestamp (prevent replay attacks)
      const webhookTime = parseInt(timestamp, 10);
      const currentTime = Math.floor(Date.now() / 1000);
      if (Math.abs(currentTime - webhookTime) > 300) {
        // 5 minutes
        throw new UnauthorizedException('Webhook timestamp expired');
      }

      next();
    } catch (error) {
      this.logger.error(
        `Webhook signature validation failed: ${error.message}`,
      );
      throw new UnauthorizedException('Webhook signature validation failed');
    }
  }

  private computeWebhookSignature(
    body: string,
    timestamp: string,
    secret: string,
  ): string {
    const payload = `${timestamp}.${body}`;
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload);
    return hmac.digest('hex');
  }

  private extractProvider(path: string): string {
    // Extract provider from path like /api/webhooks/stripe
    const parts = path.split('/');
    return parts[3] || 'unknown';
  }
}
