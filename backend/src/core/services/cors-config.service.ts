import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as MasterConfig from '@config/master.config';

/**
 * CorsConfigService
 *
 * Provides globally injectable access to CORS configuration.
 * Consolidates allowed origins, methods, headers, and credentials settings.
 */
/**
 * ╔=================================================================================================================╗
 * ║CORSCONFIG                                                                                                       ║
 * ╠=================================================================================================================╣
 * ║                                                                                                                 ║
 * ║  External Request                   Controller                            Service                                ║
 * ║       │                                   │                                     │                                ║
 * ║       │  HTTP Endpoints                  │                                     │                                ║
 * ║       └───────────────────────────────────►                                     │                                ║
 * ║                                                                                                                 ║
 * ║                                                                 ┌───────────────┴───────────────┐                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          Repository                    Database                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          PostgreSQL                                          ║
 * ║                                                                                                                 ║
 * ║  DATA IN:  Data input                                                                                         ║

 * ║                                                                                                                 ║
 * ║  DATA OUT: Data output                                                                                        ║

 * ║                                                                                                                 ║

 * ╚=================================================================================================================╝
 */

@Injectable()
export class CorsConfigService {
  constructor(private readonly configService: ConfigService) {}

  // Origin Configuration
  get origin(): string | string[] | boolean {
    const corsOrigin = this.configService.get<string>('app.server.corsOrigin');
    if (corsOrigin === '*') return true;
    if (corsOrigin?.includes(',')) return corsOrigin.split(',').map(o => o.trim());
    return corsOrigin || true;
  }

  get allowedMethods(): string[] {
    return MasterConfig.CORS_ALLOWED_METHODS;
  }

  get allowedHeaders(): string[] {
    return MasterConfig.CORS_ALLOWED_HEADERS;
  }

  get exposedHeaders(): string[] {
    return MasterConfig.CORS_EXPOSED_HEADERS;
  }

  get credentials(): boolean {
    return MasterConfig.CORS_CREDENTIALS;
  }

  get maxAge(): number {
    return MasterConfig.CORS_MAX_AGE;
  }

  // Trusted subdomains for origin validation
  get trustedSubdomains(): string[] {
    return ['app', 'api', 'admin', 'portal', 'www'];
  }

  // Trusted domains
  get trustedDomains(): string[] {
    return ['lexiflow.com', 'localhost'];
  }

  /**
   * Check if an origin is trusted
   */
  isOriginTrusted(origin: string): boolean {
    if (!origin) return false;

    try {
      const url = new URL(origin);
      const hostname = url.hostname;

      // Check trusted domains
      for (const domain of this.trustedDomains) {
        if (hostname === domain || hostname.endsWith(`.${domain}`)) {
          return true;
        }
      }

      // Check localhost
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }

  /**
   * Get complete CORS options for NestJS
   */
  getCorsOptions(): Record<string, unknown> {
    return {
      origin: this.origin,
      methods: this.allowedMethods,
      allowedHeaders: this.allowedHeaders,
      exposedHeaders: this.exposedHeaders,
      credentials: this.credentials,
      maxAge: this.maxAge,
    };
  }

  /**
   * Get CORS configuration summary
   */
  getSummary(): Record<string, unknown> {
    return {
      origin: this.origin,
      methods: this.allowedMethods.join(', '),
      credentials: this.credentials,
      maxAge: this.maxAge,
      trustedDomains: this.trustedDomains,
    };
  }
}
