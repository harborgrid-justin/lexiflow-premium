import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import {
  IP_WHITELIST_KEY,
  IpWhitelistOptions,
} from '@common/decorators/ip-whitelist.decorator';

/**
 * IP Whitelist Guard
 *
 * Restricts endpoint access to whitelisted IP addresses and ranges.
 * Useful for admin endpoints, internal APIs, and webhook receivers.
 *
 * Features:
 * - Individual IP matching
 * - CIDR range matching
 * - Localhost detection
 * - Private network detection
 * - Reverse proxy IP extraction
 *
 * @example
 * @UseGuards(IpWhitelistGuard)
 * @IpWhitelist({
 *   ips: ['192.168.1.100'],
 *   ranges: ['10.0.0.0/8'],
 *   allowLocalhost: true
 * })
 * @Post('admin/reset')
 * async adminReset() {}
 */
@Injectable()
export class IpWhitelistGuard implements CanActivate {
  private readonly logger = new Logger(IpWhitelistGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const options = this.reflector.getAllAndOverride<IpWhitelistOptions>(
      IP_WHITELIST_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!options) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const clientIp = this.getClientIp(request);

    // Check if IP is allowed
    if (!this.isIpAllowed(clientIp, options)) {
      this.logger.warn(
        `IP whitelist rejection: ${clientIp} attempted to access ${request.method} ${request.path}`,
      );

      throw new ForbiddenException(
        'Access denied: Your IP address is not authorized to access this resource',
      );
    }

    this.logger.debug(
      `IP whitelist passed: ${clientIp} accessing ${request.method} ${request.path}`,
    );

    return true;
  }

  /**
   * Check if IP is allowed based on whitelist options
   */
  private isIpAllowed(ip: string, options: IpWhitelistOptions): boolean {
    // Check localhost
    if (options.allowLocalhost && this.isLocalhost(ip)) {
      return true;
    }

    // Check private networks
    if (options.allowPrivateNetworks && this.isPrivateNetwork(ip)) {
      return true;
    }

    // Check individual IPs
    if (options.ips && options.ips.includes(ip)) {
      return true;
    }

    // Check IP ranges (CIDR notation)
    if (options.ranges) {
      for (const range of options.ranges) {
        if (this.isIpInRange(ip, range)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Get client IP address
   */
  private getClientIp(request: Request): string {
    // Check various headers for IP (in order of trust)
    const cfConnectingIp = request.headers['cf-connecting-ip'] as string;
    const xRealIp = request.headers['x-real-ip'] as string;
    const xForwardedFor = request.headers['x-forwarded-for'] as string;

    if (cfConnectingIp) {
      return cfConnectingIp;
    }

    if (xRealIp) {
      return xRealIp;
    }

    if (xForwardedFor) {
      // X-Forwarded-For can contain multiple IPs, take the first one
      const firstIp = xForwardedFor.split(',')[0]?.trim();
      return firstIp || 'unknown';
    }

    return request.ip || request.socket?.remoteAddress || 'unknown';
  }

  /**
   * Check if IP is localhost
   */
  private isLocalhost(ip: string): boolean {
    const localhostPatterns = [
      '127.0.0.1',
      '::1',
      '::ffff:127.0.0.1',
      'localhost',
    ];

    return localhostPatterns.includes(ip);
  }

  /**
   * Check if IP is in private network range
   */
  private isPrivateNetwork(ip: string): boolean {
    // Remove IPv6 prefix if present
    const cleanIp = ip.replace('::ffff:', '');

    // Private network ranges (RFC 1918)
    const privateRanges = [
      '10.0.0.0/8',
      '172.16.0.0/12',
      '192.168.0.0/16',
      '127.0.0.0/8',
    ];

    for (const range of privateRanges) {
      if (this.isIpInRange(cleanIp, range)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if IP is in CIDR range
   */
  private isIpInRange(ip: string, range: string): boolean {
    try {
      const [rangeIp, rangeMask] = range.split('/');

      if (!rangeIp || !rangeMask) {
        this.logger.error(`Invalid CIDR range format: ${range}`);
        return false;
      }

      const mask = parseInt(rangeMask, 10);

      if (isNaN(mask) || mask < 0 || mask > 32) {
        this.logger.error(`Invalid CIDR mask: ${range}`);
        return false;
      }

      const ipNum = this.ipToNumber(ip);
      const rangeIpNum = this.ipToNumber(rangeIp);

      if (ipNum === null || rangeIpNum === null) {
        return false;
      }

      const maskNum = -1 << (32 - mask);
      return (ipNum & maskNum) === (rangeIpNum & maskNum);
    } catch (error) {
      this.logger.error(`Error checking IP range ${range}:`, error);
      return false;
    }
  }

  /**
   * Convert IP address to number
   */
  private ipToNumber(ip: string): number | null {
    try {
      // Remove IPv6 prefix if present
      const cleanIp = ip.replace('::ffff:', '');

      const parts = cleanIp.split('.');
      if (parts.length !== 4) {
        return null;
      }

      let num = 0;
      for (let i = 0; i < 4; i++) {
        const part = parseInt(parts[i]!, 10);
        if (isNaN(part) || part < 0 || part > 255) {
          return null;
        }
        num = num * 256 + part;
      }

      return num;
    } catch {
      return null;
    }
  }
}
