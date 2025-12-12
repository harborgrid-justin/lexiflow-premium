import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import * as ipRangeCheck from 'ip-range-check';

export const IP_WHITELIST_KEY = 'ipWhitelist';
export const SKIP_IP_WHITELIST_KEY = 'skipIpWhitelist';

/**
 * Decorator to specify IP whitelist for a route
 * @param ips Array of allowed IP addresses or CIDR ranges
 */
export const IpWhitelist = (...ips: string[]) => {
  return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    if (propertyKey && descriptor) {
      Reflect.defineMetadata(IP_WHITELIST_KEY, ips, descriptor.value);
    } else {
      Reflect.defineMetadata(IP_WHITELIST_KEY, ips, target);
    }
  };
};

/**
 * Decorator to skip IP whitelist check for a route
 */
export const SkipIpWhitelist = () => {
  return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    if (propertyKey && descriptor) {
      Reflect.defineMetadata(SKIP_IP_WHITELIST_KEY, true, descriptor.value);
    } else {
      Reflect.defineMetadata(SKIP_IP_WHITELIST_KEY, true, target);
    }
  };
};

/**
 * IP Whitelist Guard
 * Implements IP-based access control for enterprise security
 * OWASP ASVS V3.4 - IP-based Access Controls
 */
@Injectable()
export class IpWhitelistGuard implements CanActivate {
  private readonly logger = new Logger(IpWhitelistGuard.name);
  private readonly globalWhitelist: string[] = [];
  private readonly enableIpWhitelist: boolean;

  constructor(
    private reflector: Reflector,
    private configService: ConfigService,
  ) {
    // Load global IP whitelist from configuration
    const whitelistConfig =
      this.configService.get<string>('IP_WHITELIST') || '';
    this.globalWhitelist = whitelistConfig
      .split(',')
      .map((ip) => ip.trim())
      .filter((ip) => ip.length > 0);

    // Check if IP whitelist is enabled
    this.enableIpWhitelist =
      this.configService.get<string>('ENABLE_IP_WHITELIST') === 'true';

    if (this.enableIpWhitelist && this.globalWhitelist.length > 0) {
      this.logger.log(
        `IP Whitelist enabled with ${this.globalWhitelist.length} global entries`,
      );
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if IP whitelist is globally disabled
    if (!this.enableIpWhitelist) {
      return true;
    }

    // Check if route has skip IP whitelist decorator
    const skipIpWhitelist = this.reflector.getAllAndOverride<boolean>(
      SKIP_IP_WHITELIST_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (skipIpWhitelist) {
      return true;
    }

    // Get route-specific whitelist
    const routeWhitelist = this.reflector.getAllAndOverride<string[]>(
      IP_WHITELIST_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no whitelist specified at route or global level, allow access
    if (
      (!routeWhitelist || routeWhitelist.length === 0) &&
      this.globalWhitelist.length === 0
    ) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const clientIp = this.extractClientIp(request);

    if (!clientIp) {
      this.logger.warn('Unable to extract client IP address');
      throw new ForbiddenException('Unable to verify IP address');
    }

    // Combine global and route-specific whitelists
    const allowedIps = [
      ...this.globalWhitelist,
      ...(routeWhitelist || []),
    ];

    // Check if IP is whitelisted
    const isAllowed = this.isIpAllowed(clientIp, allowedIps);

    if (!isAllowed) {
      this.logger.warn(
        `Access denied for IP: ${clientIp} - Not in whitelist`,
      );
      throw new ForbiddenException(
        'Access denied: Your IP address is not authorized to access this resource',
      );
    }

    this.logger.debug(`Access granted for IP: ${clientIp}`);
    return true;
  }

  /**
   * Extract client IP from request
   * Handles proxies and load balancers
   */
  private extractClientIp(request: Request): string | null {
    // Try various headers in order of preference
    const headers = [
      'x-client-ip',
      'x-forwarded-for',
      'cf-connecting-ip', // Cloudflare
      'fastly-client-ip', // Fastly
      'x-real-ip',
      'x-cluster-client-ip',
      'x-forwarded',
      'forwarded-for',
      'forwarded',
    ];

    for (const header of headers) {
      const value = request.headers[header];
      if (value) {
        // X-Forwarded-For can contain multiple IPs, take the first one
        const ip = Array.isArray(value) ? value[0] : value;
        const firstIp = ip.split(',')[0].trim();
        if (this.isValidIp(firstIp)) {
          return firstIp;
        }
      }
    }

    // Fall back to socket IP
    const socketIp =
      request.socket.remoteAddress ||
      (request.connection as any)?.remoteAddress;

    if (socketIp) {
      // Remove IPv6 prefix if present
      const cleanIp = socketIp.replace(/^::ffff:/, '');
      if (this.isValidIp(cleanIp)) {
        return cleanIp;
      }
    }

    return null;
  }

  /**
   * Check if IP is allowed
   * Supports individual IPs and CIDR ranges
   */
  private isIpAllowed(ip: string, allowedIps: string[]): boolean {
    // Check for exact match or CIDR range match
    for (const allowedIp of allowedIps) {
      if (allowedIp === ip) {
        return true;
      }

      // Check if it's a CIDR range
      if (allowedIp.includes('/')) {
        try {
          if (ipRangeCheck(ip, allowedIp)) {
            return true;
          }
        } catch (error) {
          this.logger.error(
            `Invalid CIDR range: ${allowedIp} - ${error.message}`,
          );
        }
      }

      // Check for wildcard patterns (e.g., 192.168.1.*)
      if (allowedIp.includes('*')) {
        const pattern = allowedIp.replace(/\./g, '\\.').replace(/\*/g, '.*');
        const regex = new RegExp(`^${pattern}$`);
        if (regex.test(ip)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Validate IP address format
   */
  private isValidIp(ip: string): boolean {
    // IPv4 validation
    const ipv4Regex =
      /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipv4Regex.test(ip)) {
      const parts = ip.split('.');
      return parts.every((part) => {
        const num = parseInt(part, 10);
        return num >= 0 && num <= 255;
      });
    }

    // IPv6 validation (simplified)
    const ipv6Regex =
      /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    if (ipv6Regex.test(ip)) {
      return true;
    }

    // IPv6 compressed format
    const ipv6CompressedRegex =
      /^(([0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4})?::(([0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4})?$/;
    if (ipv6CompressedRegex.test(ip)) {
      return true;
    }

    return false;
  }

  /**
   * Get client IP for logging/auditing
   */
  static getClientIp(request: Request): string | null {
    const guard = new IpWhitelistGuard(null as any, null as any);
    return guard.extractClientIp(request);
  }
}

/**
 * IP Whitelist Configuration Interface
 */
export interface IpWhitelistConfig {
  enabled: boolean;
  globalWhitelist: string[];
  blockByDefault: boolean;
  allowPrivateNetworks: boolean;
  logAttempts: boolean;
}

/**
 * Service for managing IP whitelists
 */
@Injectable()
export class IpWhitelistService {
  private readonly logger = new Logger(IpWhitelistService.name);
  private whitelistCache: Map<string, string[]> = new Map();

  /**
   * Add IP to whitelist for an organization
   */
  async addToWhitelist(
    organizationId: string,
    ip: string,
  ): Promise<void> {
    if (!this.isValidIpOrRange(ip)) {
      throw new ForbiddenException('Invalid IP address or CIDR range');
    }

    const current = this.whitelistCache.get(organizationId) || [];
    if (!current.includes(ip)) {
      current.push(ip);
      this.whitelistCache.set(organizationId, current);
      this.logger.log(
        `Added IP ${ip} to whitelist for organization ${organizationId}`,
      );
    }
  }

  /**
   * Remove IP from whitelist
   */
  async removeFromWhitelist(
    organizationId: string,
    ip: string,
  ): Promise<void> {
    const current = this.whitelistCache.get(organizationId) || [];
    const updated = current.filter((item) => item !== ip);
    this.whitelistCache.set(organizationId, updated);
    this.logger.log(
      `Removed IP ${ip} from whitelist for organization ${organizationId}`,
    );
  }

  /**
   * Get whitelist for organization
   */
  async getWhitelist(organizationId: string): Promise<string[]> {
    return this.whitelistCache.get(organizationId) || [];
  }

  /**
   * Check if IP is in whitelist
   */
  async isWhitelisted(
    organizationId: string,
    ip: string,
  ): Promise<boolean> {
    const whitelist = await this.getWhitelist(organizationId);
    const guard = new IpWhitelistGuard(null as any, null as any);
    return (guard as any).isIpAllowed(ip, whitelist);
  }

  /**
   * Validate IP or CIDR range
   */
  private isValidIpOrRange(ip: string): boolean {
    // Check if it's a CIDR range
    if (ip.includes('/')) {
      const [address, mask] = ip.split('/');
      const maskNum = parseInt(mask, 10);
      if (isNaN(maskNum) || maskNum < 0 || maskNum > 32) {
        return false;
      }
      return this.isValidIp(address);
    }

    return this.isValidIp(ip);
  }

  /**
   * Validate IP address
   */
  private isValidIp(ip: string): boolean {
    const guard = new IpWhitelistGuard(null as any, null as any);
    return (guard as any).isValidIp(ip);
  }
}
