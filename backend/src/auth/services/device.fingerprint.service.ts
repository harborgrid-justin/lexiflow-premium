import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { UAParser } from 'ua-parser-js';

/**
 * Device Fingerprint Service
 * Generates unique fingerprints for devices to enhance security
 */
@Injectable()
export class DeviceFingerprintService {
  private readonly logger = new Logger(DeviceFingerprintService.name);

  /**
   * Generate device fingerprint from request
   */
  generateFingerprint(req: any): string {
    const components = [
      req.headers['user-agent'] || '',
      req.headers['accept-language'] || '',
      req.headers['accept-encoding'] || '',
      req.headers['accept'] || '',
      this.getClientIp(req),
    ];

    const fingerprintData = components.join('|');
    const fingerprint = crypto
      .createHash('sha256')
      .update(fingerprintData)
      .digest('hex');

    return fingerprint;
  }

  /**
   * Parse user agent for device information
   */
  parseUserAgent(userAgent: string): {
    browser: string;
    browserVersion: string;
    os: string;
    osVersion: string;
    device: string;
    deviceType: string;
  } {
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    return {
      browser: result.browser.name || 'Unknown',
      browserVersion: result.browser.version || '',
      os: result.os.name || 'Unknown',
      osVersion: result.os.version || '',
      device: result.device.model || 'Unknown',
      deviceType: result.device.type || 'desktop',
    };
  }

  /**
   * Extract client IP address
   */
  getClientIp(req: any): string {
    return (
      req.headers['x-forwarded-for']?.split(',')[0].trim() ||
      req.headers['x-real-ip'] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.ip ||
      '0.0.0.0'
    );
  }

  /**
   * Get location from IP (simplified)
   * In production, use IP geolocation service like MaxMind or ipapi.co
   */
  async getLocationFromIp(ip: string): Promise<{
    country?: string;
    city?: string;
    region?: string;
  }> {
    // Simplified implementation
    // In production, integrate with IP geolocation service
    if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.')) {
      return {
        country: 'Local',
        city: 'Local',
        region: 'Local',
      };
    }

    // Mock data for demonstration
    return {
      country: 'United States',
      city: 'New York',
      region: 'NY',
    };
  }

  /**
   * Check if device is trusted based on fingerprint
   */
  isDeviceTrusted(fingerprint: string, trustedFingerprints: string[]): boolean {
    return trustedFingerprints.includes(fingerprint);
  }

  /**
   * Calculate device risk score
   * Returns a score from 0 (safe) to 100 (risky)
   */
  calculateDeviceRiskScore(deviceInfo: {
    isNewDevice: boolean;
    locationChanged: boolean;
    suspiciousUserAgent: boolean;
    vpnDetected: boolean;
    recentFailedAttempts: number;
  }): number {
    let score = 0;

    if (deviceInfo.isNewDevice) score += 20;
    if (deviceInfo.locationChanged) score += 25;
    if (deviceInfo.suspiciousUserAgent) score += 30;
    if (deviceInfo.vpnDetected) score += 15;
    score += Math.min(deviceInfo.recentFailedAttempts * 5, 20);

    return Math.min(score, 100);
  }

  /**
   * Detect suspicious user agent patterns
   */
  detectSuspiciousUserAgent(userAgent: string): boolean {
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /curl/i,
      /wget/i,
      /python/i,
      /scrapy/i,
    ];

    return suspiciousPatterns.some((pattern) => pattern.test(userAgent));
  }

  /**
   * Generate device metadata for session
   */
  generateDeviceMetadata(req: any): {
    fingerprint: string;
    userAgent: string;
    ip: string;
    browser: string;
    browserVersion: string;
    os: string;
    osVersion: string;
    device: string;
    deviceType: string;
    isSuspicious: boolean;
  } {
    const fingerprint = this.generateFingerprint(req);
    const userAgent = req.headers['user-agent'] || '';
    const ip = this.getClientIp(req);
    const deviceInfo = this.parseUserAgent(userAgent);
    const isSuspicious = this.detectSuspiciousUserAgent(userAgent);

    return {
      fingerprint,
      userAgent,
      ip,
      ...deviceInfo,
      isSuspicious,
    };
  }
}
