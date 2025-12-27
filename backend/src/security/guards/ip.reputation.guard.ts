import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { RedisCacheManagerService } from '@common/services/redis-cache-manager.service';
import {
  IP_BLOCK_DURATION,
  IP_TEMPORARY_BLOCK_DURATION,
  IP_MAX_FAILED_LOGINS,
  IP_MAX_REQUESTS_PER_MINUTE,
  IP_MAX_REQUESTS_PER_HOUR,
  SUSPICIOUS_IP_BLOCK_THRESHOLD,
  REDIS_BLOCKED_IP_PREFIX,
  REDIS_SUSPICIOUS_IP_PREFIX,
} from '@security/constants/security.constants';

export interface IpReputationData {
  failedLogins: number;
  requestsPerMinute: number;
  requestsPerHour: number;
  violations: number;
  firstSeen: number;
  lastSeen: number;
  blockedUntil?: number;
  reason?: string;
}

export interface IpBlockRecord {
  ip: string;
  reason: string;
  blockedAt: number;
  expiresAt: number;
  permanent: boolean;
}

/**
 * IP Reputation Guard
 * Blocks known malicious IPs and tracks suspicious patterns
 * Implements configurable blocklist and allowlist
 */
@Injectable()
export class IpReputationGuard implements CanActivate {
  private readonly logger = new Logger(IpReputationGuard.name);

  // In-memory allowlist and permanent blocklist
  private readonly allowlist: Set<string> = new Set();
  private readonly permanentBlocklist: Set<string> = new Set();

  constructor(
    private readonly reflector: Reflector,
    private readonly cacheManager: RedisCacheManagerService
  ) {
    this.initializeDefaultLists();
  }

  /**
   * Initialize default allowlist and blocklist
   */
  private initializeDefaultLists(): void {
    // Add localhost to allowlist
    this.allowlist.add('127.0.0.1');
    this.allowlist.add('::1');
    this.allowlist.add('localhost');

    // Add known malicious IPs to permanent blocklist (example - should be loaded from database)
    // this.permanentBlocklist.add('198.51.100.0'); // Example malicious IP

    this.logger.log('IP reputation guard initialized');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if guard is disabled for this route
    const skipIpCheck = this.reflector.get<boolean>('skipIpCheck', context.getHandler());
    if (skipIpCheck) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const ip = this.extractClientIp(request);

    // Check allowlist first
    if (this.isAllowlisted(ip)) {
      this.logger.debug(`IP ${ip} is allowlisted - skipping reputation check`);
      return true;
    }

    // Check if IP is private (internal network)
    if (this.isPrivateIp(ip)) {
      this.logger.debug(`IP ${ip} is private - allowing access`);
      return true;
    }

    // Check permanent blocklist
    if (this.isPermanentlyBlocked(ip)) {
      this.logger.warn(`Blocked request from permanently blocked IP: ${ip}`);
      throw new ForbiddenException('Access denied. Your IP address has been permanently blocked.');
    }

    // Check temporary blocks
    const blockRecord = await this.getBlockRecord(ip);
    if (blockRecord && this.isBlockActive(blockRecord)) {
      const remainingTime = Math.ceil((blockRecord.expiresAt - Date.now()) / 1000 / 60);
      this.logger.warn(`Blocked request from temporarily blocked IP: ${ip} (${remainingTime}m remaining)`);

      throw new ForbiddenException(
        `Access denied. Your IP address has been temporarily blocked due to suspicious activity. ` +
        `Try again in ${remainingTime} minutes.`
      );
    }

    // Track request and check for suspicious patterns
    await this.trackRequest(ip, request);

    // Check if IP should be blocked based on behavior
    const shouldBlock = await this.shouldBlockIp(ip);
    if (shouldBlock.block) {
      const reason = shouldBlock.reason || 'Suspicious activity detected';
      const duration = shouldBlock.duration;
      if (duration) {
        await this.blockIp(ip, reason, duration);
      } else {
        await this.blockIp(ip, reason);
      }
      this.logger.warn(`Blocking IP ${ip}: ${reason}`);

      throw new ForbiddenException(
        'Access denied. Your IP address has been temporarily blocked due to suspicious activity.'
      );
    }

    return true;
  }

  /**
   * Extract client IP address from request
   */
  private extractClientIp(req: Request): string {
    // Check X-Forwarded-For header (proxy/load balancer)
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded;
      if (ips) {
        const firstIp = ips.split(',')[0];
        return firstIp ? firstIp.trim() : 'unknown';
      }
    }

    // Check X-Real-IP header (nginx)
    const realIp = req.headers['x-real-ip'];
    if (realIp) {
      const ip = Array.isArray(realIp) ? realIp[0] : realIp;
      return ip || 'unknown';
    }

    // Check CF-Connecting-IP (Cloudflare)
    const cfIp = req.headers['cf-connecting-ip'];
    if (cfIp) {
      const ip = Array.isArray(cfIp) ? cfIp[0] : cfIp;
      return ip || 'unknown';
    }

    // Fallback to connection remote address
    return req.ip || req.socket.remoteAddress || 'unknown';
  }

  /**
   * Check if IP is in allowlist
   */
  private isAllowlisted(ip: string): boolean {
    return this.allowlist.has(ip);
  }

  /**
   * Check if IP is permanently blocked
   */
  private isPermanentlyBlocked(ip: string): boolean {
    return this.permanentBlocklist.has(ip);
  }

  /**
   * Check if IP is private/internal
   */
  private isPrivateIp(ip: string): boolean {
    // IPv4 private ranges
    if (ip.startsWith('10.')) return true;
    if (ip.startsWith('192.168.')) return true;
    if (ip.startsWith('172.')) {
      const parts = ip.split('.');
      if (parts.length > 1 && parts[1]) {
        const secondOctet = parseInt(parts[1], 10);
        if (secondOctet >= 16 && secondOctet <= 31) return true;
      }
    }
    if (ip.startsWith('127.')) return true;

    // IPv6 private ranges
    if (ip === '::1') return true;
    if (ip.startsWith('fc00:')) return true;
    if (ip.startsWith('fe80:')) return true;

    return false;
  }

  /**
   * Get IP block record from cache
   */
  private async getBlockRecord(ip: string): Promise<IpBlockRecord | undefined> {
    const key = `${REDIS_BLOCKED_IP_PREFIX}${ip}`;
    return await this.cacheManager.get<IpBlockRecord>(key);
  }

  /**
   * Check if block is still active
   */
  private isBlockActive(blockRecord: IpBlockRecord): boolean {
    if (blockRecord.permanent) return true;
    return Date.now() < blockRecord.expiresAt;
  }

  /**
   * Track request from IP
   */
  private async trackRequest(ip: string, _request: Request): Promise<void> {
    const key = `${REDIS_SUSPICIOUS_IP_PREFIX}${ip}`;
    const data = await this.cacheManager.get<IpReputationData>(key) || this.createEmptyReputationData();

    const now = Date.now();

    // Update request counters
    data.requestsPerMinute++;
    data.requestsPerHour++;
    data.lastSeen = now;

    if (!data.firstSeen) {
      data.firstSeen = now;
    }

    // Store updated data (1 hour TTL)
    await this.cacheManager.set(key, data, { ttl: 3600 });

    // Reset per-minute counter after 60 seconds
    const minuteTimeout = setTimeout(async () => {
      const current = await this.cacheManager.get<IpReputationData>(key);
      if (current) {
        current.requestsPerMinute = Math.max(0, current.requestsPerMinute - 1);
        await this.cacheManager.set(key, current, { ttl: 3600 });
      }
    }, 60000);
    // Prevent timeout from keeping process alive
    minuteTimeout.unref();

    // Reset per-hour counter after 1 hour
    const hourTimeout = setTimeout(async () => {
      const current = await this.cacheManager.get<IpReputationData>(key);
      if (current) {
        current.requestsPerHour = Math.max(0, current.requestsPerHour - 1);
        await this.cacheManager.set(key, current, { ttl: 3600 });
      }
    }, 3600000);
    // Prevent timeout from keeping process alive
    hourTimeout.unref();
  }

  /**
   * Record failed login attempt
   */
  async recordFailedLogin(ip: string): Promise<void> {
    const key = `${REDIS_SUSPICIOUS_IP_PREFIX}${ip}`;
    const data = await this.cacheManager.get<IpReputationData>(key) || this.createEmptyReputationData();

    data.failedLogins++;
    data.lastSeen = Date.now();

    await this.cacheManager.set(key, data, { ttl: 3600 });

    this.logger.warn(`Failed login attempt from IP ${ip} (total: ${data.failedLogins})`);
  }

  /**
   * Record violation
   */
  async recordViolation(ip: string, reason: string): Promise<void> {
    const key = `${REDIS_SUSPICIOUS_IP_PREFIX}${ip}`;
    const data = await this.cacheManager.get<IpReputationData>(key) || this.createEmptyReputationData();

    data.violations++;
    data.reason = reason;
    data.lastSeen = Date.now();

    await this.cacheManager.set(key, data, { ttl: 3600 });

    this.logger.warn(`Violation recorded for IP ${ip}: ${reason} (total: ${data.violations})`);
  }

  /**
   * Check if IP should be blocked based on behavior
   */
  private async shouldBlockIp(ip: string): Promise<{ block: boolean; reason?: string; duration?: number }> {
    const key = `${REDIS_SUSPICIOUS_IP_PREFIX}${ip}`;
    const data = await this.cacheManager.get<IpReputationData>(key);

    if (!data) {
      return { block: false };
    }

    // Check for too many failed logins
    if (data.failedLogins >= IP_MAX_FAILED_LOGINS) {
      return {
        block: true,
        reason: 'Too many failed login attempts',
        duration: IP_TEMPORARY_BLOCK_DURATION,
      };
    }

    // Check for rate limit violations
    if (data.requestsPerMinute >= IP_MAX_REQUESTS_PER_MINUTE) {
      return {
        block: true,
        reason: 'Excessive requests per minute',
        duration: IP_TEMPORARY_BLOCK_DURATION,
      };
    }

    if (data.requestsPerHour >= IP_MAX_REQUESTS_PER_HOUR) {
      return {
        block: true,
        reason: 'Excessive requests per hour',
        duration: IP_TEMPORARY_BLOCK_DURATION,
      };
    }

    // Check for multiple violations
    if (data.violations >= SUSPICIOUS_IP_BLOCK_THRESHOLD) {
      return {
        block: true,
        reason: 'Multiple security violations',
        duration: IP_BLOCK_DURATION,
      };
    }

    return { block: false };
  }

  /**
   * Block an IP address
   */
  async blockIp(ip: string, reason: string, duration?: number, permanent = false): Promise<void> {
    const blockDuration = permanent ? 0 : (duration || IP_BLOCK_DURATION);
    const now = Date.now();

    const blockRecord: IpBlockRecord = {
      ip,
      reason,
      blockedAt: now,
      expiresAt: permanent ? 0 : now + blockDuration * 1000,
      permanent,
    };

    // Store in cache
    const key = `${REDIS_BLOCKED_IP_PREFIX}${ip}`;
    const ttl = permanent ? 31536000 : Math.ceil(blockDuration); // 1 year for permanent

    await this.cacheManager.set(key, blockRecord, { ttl });

    // If permanent, also add to in-memory blocklist
    if (permanent) {
      this.permanentBlocklist.add(ip);
    }

    this.logger.warn(
      `IP ${ip} blocked ${permanent ? 'permanently' : `for ${blockDuration}s`}: ${reason}`
    );
  }

  /**
   * Unblock an IP address
   */
  async unblockIp(ip: string): Promise<void> {
    const key = `${REDIS_BLOCKED_IP_PREFIX}${ip}`;
    await this.cacheManager.delete(key);

    this.permanentBlocklist.delete(ip);

    this.logger.log(`IP ${ip} unblocked`);
  }

  /**
   * Add IP to allowlist
   */
  addToAllowlist(ip: string): void {
    this.allowlist.add(ip);
    this.logger.log(`IP ${ip} added to allowlist`);
  }

  /**
   * Remove IP from allowlist
   */
  removeFromAllowlist(ip: string): void {
    this.allowlist.delete(ip);
    this.logger.log(`IP ${ip} removed from allowlist`);
  }

  /**
   * Add IP to permanent blocklist
   */
  addToPermanentBlocklist(ip: string, reason: string): void {
    this.permanentBlocklist.add(ip);
    this.blockIp(ip, reason, 0, true);
    this.logger.warn(`IP ${ip} added to permanent blocklist: ${reason}`);
  }

  /**
   * Get IP reputation data
   */
  async getIpReputation(ip: string): Promise<IpReputationData | undefined> {
    const key = `${REDIS_SUSPICIOUS_IP_PREFIX}${ip}`;
    return await this.cacheManager.get<IpReputationData>(key);
  }

  /**
   * Reset IP reputation (clear tracking data)
   */
  async resetIpReputation(ip: string): Promise<void> {
    const key = `${REDIS_SUSPICIOUS_IP_PREFIX}${ip}`;
    await this.cacheManager.delete(key);
    this.logger.log(`IP reputation reset for ${ip}`);
  }

  /**
   * Create empty reputation data
   */
  private createEmptyReputationData(): IpReputationData {
    return {
      failedLogins: 0,
      requestsPerMinute: 0,
      requestsPerHour: 0,
      violations: 0,
      firstSeen: Date.now(),
      lastSeen: Date.now(),
    };
  }

  /**
   * Get all blocked IPs (for admin dashboard)
   */
  async getAllBlockedIps(): Promise<IpBlockRecord[]> {
    // This would require scanning Redis or maintaining a separate index
    // For now, return empty array - implement full scanning if needed
    return [];
  }

  /**
   * Get allowlist
   */
  getAllowlist(): string[] {
    return Array.from(this.allowlist);
  }

  /**
   * Get permanent blocklist
   */
  getPermanentBlocklist(): string[] {
    return Array.from(this.permanentBlocklist);
  }

  /**
   * Check if IP is blocked
   */
  async isIpBlocked(ip: string): Promise<boolean> {
    if (this.isPermanentlyBlocked(ip)) {
      return true;
    }

    const blockRecord = await this.getBlockRecord(ip);
    return blockRecord ? this.isBlockActive(blockRecord) : false;
  }

  /**
   * Get block status for IP
   */
  async getBlockStatus(ip: string): Promise<{
    blocked: boolean;
    permanent: boolean;
    reason?: string;
    expiresAt?: number;
    remainingSeconds?: number;
  }> {
    if (this.isPermanentlyBlocked(ip)) {
      return {
        blocked: true,
        permanent: true,
        reason: 'Permanently blocked',
      };
    }

    const blockRecord = await this.getBlockRecord(ip);
    if (!blockRecord || !this.isBlockActive(blockRecord)) {
      return { blocked: false, permanent: false };
    }

    const remainingSeconds = Math.ceil((blockRecord.expiresAt - Date.now()) / 1000);

    return {
      blocked: true,
      permanent: blockRecord.permanent,
      reason: blockRecord.reason,
      expiresAt: blockRecord.expiresAt,
      remainingSeconds,
    };
  }
}
