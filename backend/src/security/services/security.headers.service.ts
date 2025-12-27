import { Injectable, Logger } from '@nestjs/common';
import { Response } from 'express';
import * as crypto from 'crypto';
import {
  CSP_DIRECTIVES,
  SECURITY_HEADERS,
  PERMISSIONS_POLICY,
  NONCE_LENGTH,
  NONCE_ENCODING,
} from '@security/constants/security.constants';

/**
 * Security Headers Service
 * Manages comprehensive OWASP-compliant security headers
 * Implements CSP with nonce-based script execution
 */
@Injectable()
export class SecurityHeadersService {
  private readonly logger = new Logger(SecurityHeadersService.name);

  /**
   * Generate a cryptographically secure nonce for CSP
   */
  generateNonce(): string {
    return crypto.randomBytes(NONCE_LENGTH).toString(NONCE_ENCODING);
  }

  /**
   * Build Content Security Policy header value
   */
  private buildCspHeader(nonce?: string): string {
    const directives = { ...CSP_DIRECTIVES };

    // Add nonce to script sources if provided
    if (nonce) {
      directives.scriptSrc = [...directives.scriptSrc, `'nonce-${nonce}'`];
      directives.scriptSrcElem = [...(directives.scriptSrcElem || directives.scriptSrc), `'nonce-${nonce}'`];
    }

    // Build CSP string
    const cspParts: string[] = [];

    for (const [directive, values] of Object.entries(directives)) {
      // Convert camelCase to kebab-case
      const kebabDirective = directive.replace(/([A-Z])/g, '-$1').toLowerCase();

      if (Array.isArray(values) && values.length > 0) {
        cspParts.push(`${kebabDirective} ${values.join(' ')}`);
      } else if (Array.isArray(values) && values.length === 0) {
        // Directives like upgrade-insecure-requests don't need values
        cspParts.push(kebabDirective);
      }
    }

    return cspParts.join('; ');
  }

  /**
   * Build Permissions Policy header value
   */
  private buildPermissionsPolicyHeader(): string {
    const policies: string[] = [];

    for (const [feature, allowList] of Object.entries(PERMISSIONS_POLICY)) {
      if (Array.isArray(allowList)) {
        if (allowList.length === 0) {
          policies.push(`${feature}=()`);
        } else {
          policies.push(`${feature}=(${allowList.join(' ')})`);
        }
      }
    }

    return policies.join(', ');
  }

  /**
   * Apply all security headers to a response
   */
  applySecurityHeaders(res: Response, options?: { nonce?: string; includeCSP?: boolean }): void {
    const { nonce, includeCSP = true } = options || {};

    try {
      // Apply standard security headers
      for (const [header, value] of Object.entries(SECURITY_HEADERS)) {
        res.setHeader(header, value);
      }

      // Apply Content Security Policy
      if (includeCSP) {
        const cspHeader = this.buildCspHeader(nonce);
        res.setHeader('Content-Security-Policy', cspHeader);
      }

      // Apply Permissions Policy
      const permissionsPolicy = this.buildPermissionsPolicyHeader();
      res.setHeader('Permissions-Policy', permissionsPolicy);

      // Add custom LexiFlow security headers
      res.setHeader('X-LexiFlow-Security-Version', '1.0');
      res.setHeader('X-Security-Hardened', 'true');

    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to apply security headers: ${err.message}`, err.stack);
    }
  }

  /**
   * Apply security headers for API responses
   * Uses stricter CSP for API endpoints
   */
  applyApiSecurityHeaders(res: Response): void {
    try {
      // API endpoints don't need script execution
      const apiCsp = {
        defaultSrc: ["'none'"],
        frameAncestors: ["'none'"],
        baseUri: ["'none'"],
      };

      const cspParts: string[] = [];
      for (const [directive, values] of Object.entries(apiCsp)) {
        const kebabDirective = directive.replace(/([A-Z])/g, '-$1').toLowerCase();
        cspParts.push(`${kebabDirective} ${values.join(' ')}`);
      }

      res.setHeader('Content-Security-Policy', cspParts.join('; '));

      // Apply other security headers
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('Strict-Transport-Security', SECURITY_HEADERS['Strict-Transport-Security']);
      res.setHeader('Referrer-Policy', 'no-referrer');
      res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
      res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');

      // Remove server information
      res.removeHeader('X-Powered-By');
      res.removeHeader('Server');

    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to apply API security headers: ${err.message}`, err.stack);
    }
  }

  /**
   * Apply security headers for file downloads
   */
  applyDownloadSecurityHeaders(res: Response, filename: string, contentType: string): void {
    try {
      // Standard security headers
      this.applyApiSecurityHeaders(res);

      // Download-specific headers
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${this.sanitizeFilename(filename)}"`);
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Download-Options', 'noopen');
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to apply download security headers: ${err.message}`, err.stack);
    }
  }

  /**
   * Sanitize filename to prevent directory traversal and other attacks
   */
  private sanitizeFilename(filename: string): string {
    // Remove path separators and null bytes
    let sanitized = filename.replace(/[/\\]/g, '_').replace(/\0/g, '');

    // Remove leading dots
    sanitized = sanitized.replace(/^\.+/, '');

    // Limit length
    if (sanitized.length > 255) {
      sanitized = sanitized.substring(0, 255);
    }

    // If filename is empty after sanitization, use default
    if (!sanitized) {
      sanitized = 'download';
    }

    return sanitized;
  }

  /**
   * Apply Clear-Site-Data header for logout
   * Clears cache, cookies, storage, and execution contexts
   */
  applyClearSiteData(res: Response, types?: string[]): void {
    const defaultTypes = ['cache', 'cookies', 'storage', 'executionContexts'];
    const clearTypes = types || defaultTypes;

    const clearValue = clearTypes.map(t => `"${t}"`).join(', ');
    res.setHeader('Clear-Site-Data', clearValue);

    this.logger.log(`Clear-Site-Data applied: ${clearValue}`);
  }

  /**
   * Apply security headers for WebSocket upgrade
   */
  applyWebSocketSecurityHeaders(res: Response): void {
    try {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Strict-Transport-Security', SECURITY_HEADERS['Strict-Transport-Security']);
      res.setHeader('X-Frame-Options', 'DENY');

    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to apply WebSocket security headers: ${err.message}`, err.stack);
    }
  }

  /**
   * Create CSP report endpoint headers
   */
  applyCspReportHeaders(res: Response): void {
    try {
      this.applyApiSecurityHeaders(res);

      // Additional headers for CSP reporting
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to apply CSP report headers: ${err.message}`, err.stack);
    }
  }

  /**
   * Apply headers for GraphQL endpoints
   */
  applyGraphQLSecurityHeaders(res: Response): void {
    try {
      // GraphQL needs slightly different CSP to allow introspection in dev
      const isProduction = process.env.NODE_ENV === 'production';

      if (isProduction) {
        // Strict CSP for production
        this.applyApiSecurityHeaders(res);
      } else {
        // More permissive for development (allows GraphQL playground)
        const devCsp = [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: https:",
          "connect-src 'self'",
          "frame-ancestors 'none'",
        ].join('; ');

        res.setHeader('Content-Security-Policy', devCsp);
      }

      // Common headers for all environments
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('Strict-Transport-Security', SECURITY_HEADERS['Strict-Transport-Security']);

    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to apply GraphQL security headers: ${err.message}`, err.stack);
    }
  }

  /**
   * Get CSP nonce for templates
   * This should be called per-request and the nonce passed to the template
   */
  getCspNonce(): string {
    return this.generateNonce();
  }

  /**
   * Validate and sanitize header value
   */
  private sanitizeHeaderValue(value: string): string {
    // Remove newlines and carriage returns to prevent header injection
    return value.replace(/[\r\n]/g, '');
  }

  /**
   * Add custom security header
   */
  addCustomSecurityHeader(res: Response, name: string, value: string): void {
    try {
      const sanitizedName = this.sanitizeHeaderValue(name);
      const sanitizedValue = this.sanitizeHeaderValue(value);

      res.setHeader(sanitizedName, sanitizedValue);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to add custom security header: ${err.message}`, err.stack);
    }
  }

  /**
   * Remove insecure headers
   */
  removeInsecureHeaders(res: Response): void {
    const insecureHeaders = [
      'X-Powered-By',
      'Server',
      'X-AspNet-Version',
      'X-AspNetMvc-Version',
    ];

    for (const header of insecureHeaders) {
      res.removeHeader(header);
    }
  }

  /**
   * Apply cache control headers for sensitive data
   */
  applyNoCacheHeaders(res: Response): void {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }

  /**
   * Apply cache control headers for static assets
   */
  applyCacheHeaders(res: Response, maxAge = 86400): void {
    // maxAge in seconds, default 1 day
    res.setHeader('Cache-Control', `public, max-age=${maxAge}, immutable`);
  }

  /**
   * Apply CORS headers with security constraints
   */
  applySecureCorsHeaders(res: Response, origin: string, allowedOrigins: string[]): void {
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-API-Key');
      res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count, X-Page-Count');
      res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
    }
  }

  /**
   * Get all current security headers configuration
   */
  getSecurityHeadersConfig(): Record<string, string> {
    return {
      ...SECURITY_HEADERS,
      'Content-Security-Policy': this.buildCspHeader(),
      'Permissions-Policy': this.buildPermissionsPolicyHeader(),
    };
  }

  /**
   * Validate CSP configuration
   */
  validateCspConfiguration(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for unsafe directives
    if (CSP_DIRECTIVES.scriptSrc.includes("'unsafe-eval'")) {
      errors.push("CSP contains 'unsafe-eval' in scriptSrc");
    }

    if (CSP_DIRECTIVES.scriptSrc.includes("'unsafe-inline'")) {
      errors.push("CSP contains 'unsafe-inline' in scriptSrc - consider using nonces");
    }

    // Check for missing critical directives
    if (!CSP_DIRECTIVES.defaultSrc) {
      errors.push('CSP missing default-src directive');
    }

    if (!CSP_DIRECTIVES.frameAncestors) {
      errors.push('CSP missing frame-ancestors directive');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Log security headers for debugging
   */
  logSecurityHeaders(): void {
    const config = this.getSecurityHeadersConfig();
    this.logger.log('Security Headers Configuration:');

    for (const [header, value] of Object.entries(config)) {
      this.logger.log(`  ${header}: ${value}`);
    }

    const validation = this.validateCspConfiguration();
    if (!validation.valid) {
      this.logger.warn('CSP Configuration Warnings:');
      validation.errors.forEach(error => this.logger.warn(`  - ${error}`));
    }
  }
}
