import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Request } from 'express';
import * as crypto from 'crypto';
import { createClient, RedisClientType } from 'redis';
import * as MasterConfig from '../../config/master.config';

export const REQUIRE_SIGNATURE_KEY = 'requireSignature';
export const RequireSignature = () => SetMetadata(REQUIRE_SIGNATURE_KEY, true);

export const SKIP_SIGNATURE_KEY = 'skipSignature';
export const SkipSignature = () => SetMetadata(SKIP_SIGNATURE_KEY, true);

export interface SignatureValidationOptions {
  secret: string;
  timestampToleranceMs?: number;
  algorithm?: string;
}

@Injectable()
export class RequestSigningInterceptor implements NestInterceptor, OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RequestSigningInterceptor.name);
  private redisClient: RedisClientType | null = null;
  private nonceStore = new Map<string, number>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  private readonly timestampToleranceMs = 300000; // 5 minutes
  private readonly algorithm = 'sha256';
  private readonly nonceExpireSeconds = 600; // 10 minutes

  constructor(private readonly reflector: Reflector) {}

  async onModuleInit() {
    if (MasterConfig.REDIS_ENABLED) {
      try {
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

        this.redisClient = createClient({
          url: redisUrl,
          socket: {
            connectTimeout: MasterConfig.REDIS_CONNECT_TIMEOUT,
            reconnectStrategy: (retries) => {
              if (retries > MasterConfig.REDIS_MAX_RETRIES_PER_REQUEST) {
                return new Error('Max retries reached');
              }
              return Math.min(retries * 100, 3000);
            },
          },
        });

        this.redisClient.on('error', (err) => {
          this.logger.error('Redis Client Error', err);
        });

        await this.redisClient.connect();
        this.logger.log('Request signing interceptor connected to Redis');
      } catch (error) {
        this.logger.error('Failed to connect to Redis, using in-memory nonce store', error);
        this.redisClient = null;
      }
    }

    // Cleanup in-memory nonce store every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanupNonceStore(), 300000);
  }

  async onModuleDestroy() {
    if (this.redisClient) {
      await this.redisClient.quit();
    }
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  private cleanupNonceStore() {
    const now = Date.now();
    let removedCount = 0;

    for (const [nonce, timestamp] of this.nonceStore.entries()) {
      if (now - timestamp > this.nonceExpireSeconds * 1000) {
        this.nonceStore.delete(nonce);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      this.logger.debug(`Cleaned up ${removedCount} expired nonces`);
    }
  }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const skipSignature = this.reflector.getAllAndOverride<boolean>(SKIP_SIGNATURE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skipSignature) {
      return next.handle();
    }

    const requireSignature = this.reflector.getAllAndOverride<boolean>(REQUIRE_SIGNATURE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requireSignature) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();

    // Extract signature headers
    const signature = request.headers['x-signature'] as string;
    const timestamp = request.headers['x-timestamp'] as string;
    const nonce = request.headers['x-nonce'] as string;

    if (!signature || !timestamp || !nonce) {
      throw new UnauthorizedException('Missing required signature headers (X-Signature, X-Timestamp, X-Nonce)');
    }

    // Validate timestamp to prevent replay attacks
    await this.validateTimestamp(timestamp);

    // Validate nonce to prevent replay attacks
    await this.validateNonce(nonce);

    // Get signing secret (in production, this would come from configuration or API key)
    const secret = this.getSigningSecret(request);

    // Validate signature
    await this.validateSignature(request, signature, timestamp, nonce, secret);

    // Mark nonce as used
    await this.markNonceUsed(nonce);

    return next.handle();
  }

  private async validateTimestamp(timestamp: string): Promise<void> {
    const requestTimestamp = parseInt(timestamp, 10);

    if (isNaN(requestTimestamp)) {
      throw new UnauthorizedException('Invalid timestamp format');
    }

    const now = Date.now();
    const diff = Math.abs(now - requestTimestamp);

    if (diff > this.timestampToleranceMs) {
      this.logger.warn(`Request timestamp too old or in future. Diff: ${diff}ms`);
      throw new UnauthorizedException('Request timestamp expired or invalid');
    }
  }

  private async validateNonce(nonce: string): Promise<void> {
    if (!nonce || nonce.length < 16) {
      throw new UnauthorizedException('Invalid nonce format');
    }

    // Check if nonce has been used
    const isUsed = await this.isNonceUsed(nonce);

    if (isUsed) {
      this.logger.warn(`Replay attack detected: nonce "${nonce}" already used`);
      throw new UnauthorizedException('Nonce already used - possible replay attack');
    }
  }

  private async isNonceUsed(nonce: string): Promise<boolean> {
    if (this.redisClient) {
      try {
        const key = `${MasterConfig.REDIS_KEY_PREFIX}nonce:${nonce}`;
        const exists = await this.redisClient.exists(key);
        return exists === 1;
      } catch (error) {
        this.logger.error('Failed to check nonce in Redis', error);
        // Fall back to in-memory
      }
    }

    return this.nonceStore.has(nonce);
  }

  private async markNonceUsed(nonce: string): Promise<void> {
    if (this.redisClient) {
      try {
        const key = `${MasterConfig.REDIS_KEY_PREFIX}nonce:${nonce}`;
        await this.redisClient.setEx(key, this.nonceExpireSeconds, '1');
        return;
      } catch (error) {
        this.logger.error('Failed to mark nonce in Redis', error);
        // Fall back to in-memory
      }
    }

    this.nonceStore.set(nonce, Date.now());
  }

  private async validateSignature(
    request: Request,
    signature: string,
    timestamp: string,
    nonce: string,
    secret: string,
  ): Promise<void> {
    const expectedSignature = this.generateSignature(request, timestamp, nonce, secret);

    if (!this.secureCompare(signature, expectedSignature)) {
      this.logger.warn(`Invalid signature for ${request.method} ${request.path}`);
      throw new UnauthorizedException('Invalid request signature');
    }
  }

  generateSignature(request: Request, timestamp: string, nonce: string, secret: string): string {
    // Create canonical string
    const method = request.method;
    const path = request.path;
    const body = request.body ? JSON.stringify(request.body) : '';
    const queryString = request.url.includes('?') ? request.url.split('?')[1] : '';

    const canonicalString = [
      method,
      path,
      queryString,
      timestamp,
      nonce,
      body,
    ].join('\n');

    // Generate HMAC signature
    const hmac = crypto.createHmac(this.algorithm, secret);
    hmac.update(canonicalString);

    return hmac.digest('hex');
  }

  private secureCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    try {
      return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
    } catch {
      return false;
    }
  }

  private getSigningSecret(request: Request): string {
    // In production, retrieve from API key or configuration
    // For now, use environment variable or default
    const secret = process.env.WEBHOOK_SIGNING_SECRET || (request as any).apiKey?.secret;

    if (!secret) {
      throw new UnauthorizedException('No signing secret available');
    }

    return secret;
  }

  createSignatureHeaders(
    method: string,
    path: string,
    body: any,
    queryString: string,
    secret: string,
  ): { signature: string; timestamp: string; nonce: string } {
    const timestamp = Date.now().toString();
    const nonce = crypto.randomBytes(16).toString('hex');

    const bodyString = body ? JSON.stringify(body) : '';

    const canonicalString = [
      method,
      path,
      queryString,
      timestamp,
      nonce,
      bodyString,
    ].join('\n');

    const hmac = crypto.createHmac(this.algorithm, secret);
    hmac.update(canonicalString);
    const signature = hmac.digest('hex');

    return {
      signature,
      timestamp,
      nonce,
    };
  }
}
