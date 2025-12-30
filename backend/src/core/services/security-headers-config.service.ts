import { Injectable } from '@nestjs/common';
import * as MasterConfig from '@config/master.config';

/**
 * SecurityHeadersConfigService
 *
 * Provides globally injectable access to security headers configuration.
 * Consolidates CSP, HSTS, and other security header settings.
 */
@Injectable()
export class SecurityHeadersConfigService {
  // HSTS Configuration
  get hstsMaxAge(): number {
    return MasterConfig.HELMET_HSTS_MAX_AGE;
  }

  get hstsIncludeSubdomains(): boolean {
    return MasterConfig.HELMET_HSTS_INCLUDE_SUBDOMAINS;
  }

  get hstsPreload(): boolean {
    return MasterConfig.HELMET_HSTS_PRELOAD;
  }

  // CSP Directives (defaults)
  get cspDefaultSrc(): string[] {
    return ["'self'"];
  }

  get cspScriptSrc(): string[] {
    return ["'self'", "'unsafe-inline'", "'unsafe-eval'"];
  }

  get cspStyleSrc(): string[] {
    return ["'self'", "'unsafe-inline'"];
  }

  get cspImgSrc(): string[] {
    return ["'self'", 'data:', 'blob:', 'https:'];
  }

  get cspFontSrc(): string[] {
    return ["'self'", 'data:', 'https://fonts.gstatic.com'];
  }

  get cspConnectSrc(): string[] {
    return ["'self'", 'wss:', 'https:'];
  }

  get cspFrameAncestors(): string[] {
    return ["'none'"];
  }

  get cspBaseUri(): string[] {
    return ["'self'"];
  }

  get cspFormAction(): string[] {
    return ["'self'"];
  }

  // X-Frame-Options
  get xFrameOptions(): string {
    return 'DENY';
  }

  // X-Content-Type-Options
  get xContentTypeOptions(): string {
    return 'nosniff';
  }

  // X-XSS-Protection
  get xXssProtection(): string {
    return '1; mode=block';
  }

  // Referrer-Policy
  get referrerPolicy(): string {
    return 'strict-origin-when-cross-origin';
  }

  // Permissions-Policy
  get permissionsPolicy(): Record<string, string[]> {
    return {
      camera: [],
      microphone: [],
      geolocation: [],
      payment: ["'self'"],
      usb: [],
      magnetometer: [],
      gyroscope: [],
      accelerometer: [],
    };
  }

  /**
   * Get complete CSP directives
   */
  getCspDirectives(): Record<string, string[]> {
    return {
      defaultSrc: this.cspDefaultSrc,
      scriptSrc: this.cspScriptSrc,
      styleSrc: this.cspStyleSrc,
      imgSrc: this.cspImgSrc,
      fontSrc: this.cspFontSrc,
      connectSrc: this.cspConnectSrc,
      frameAncestors: this.cspFrameAncestors,
      baseUri: this.cspBaseUri,
      formAction: this.cspFormAction,
    };
  }

  /**
   * Get HSTS configuration
   */
  getHstsConfig(): Record<string, unknown> {
    return {
      maxAge: this.hstsMaxAge,
      includeSubdomains: this.hstsIncludeSubdomains,
      preload: this.hstsPreload,
    };
  }

  /**
   * Build CSP header string
   */
  buildCspHeader(nonce?: string): string {
    const directives = this.getCspDirectives();
    const parts: string[] = [];

    for (const [directive, values] of Object.entries(directives)) {
      const kebabDirective = directive.replace(/([A-Z])/g, '-$1').toLowerCase();
      let valueString = values.join(' ');
      if (nonce && (directive === 'scriptSrc' || directive === 'styleSrc')) {
        valueString += ` 'nonce-${nonce}'`;
      }
      parts.push(`${kebabDirective} ${valueString}`);
    }

    return parts.join('; ');
  }

  /**
   * Build Permissions-Policy header string
   */
  buildPermissionsPolicyHeader(): string {
    const policy = this.permissionsPolicy;
    const parts: string[] = [];

    for (const [feature, allowList] of Object.entries(policy)) {
      if (allowList.length === 0) {
        parts.push(`${feature}=()`);
      } else {
        parts.push(`${feature}=(${allowList.join(' ')})`);
      }
    }

    return parts.join(', ');
  }
}
