import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
  OnModuleDestroy,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Session } from '../entities/session.entity';
import * as UAParser from 'ua-parser-js';

export interface SessionInfo {
  id: string;
  deviceInfo: string;
  deviceType: string | null;
  browser: string | null;
  os: string | null;
  ipAddress: string;
  location: string | null;
  country: string | null;
  city: string | null;
  createdAt: Date;
  lastActivityAt: Date | null;
  expiresAt: Date;
  isActive: boolean;
  isTrusted: boolean;
  isCurrent: boolean;
}

export interface DeviceFingerprint {
  userAgent: string;
  ipAddress: string;
  deviceType: string;
  browser: string;
  os: string;
  location?: string;
  country?: string;
  city?: string;
}

export interface SessionActivityUpdate {
  sessionId: string;
  ipAddress?: string;
  location?: string;
}

/**
 * Session Management Service
 *
 * Enterprise-grade session tracking and management for LexiFlow Premium.
 * Provides comprehensive session lifecycle management, device tracking,
 * location awareness, and security monitoring.
 *
 * Features:
 * - Track active sessions per user
 * - Store device info, IP, and location
 * - View and revoke sessions
 * - Detect new device logins
 * - Session expiration with sliding window
 * - Automatic cleanup of expired sessions
 */
@Injectable()
export class SessionManagementService implements OnModuleDestroy {
  private readonly logger = new Logger(SessionManagementService.name);
  private readonly maxSessionsPerUser: number;
  private readonly sessionExpiryHours: number;
  private readonly slidingWindowMinutes: number;
  
  // Memory optimization
  private readonly sessionCache = new Map<string, Session>();
  private readonly MAX_CACHE_SIZE = 1000;

  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    private readonly configService: ConfigService,
  ) {
    this.maxSessionsPerUser = parseInt(
      this.configService.get('MAX_SESSIONS_PER_USER', '10'),
      10,
    );
    this.sessionExpiryHours = parseInt(
      this.configService.get('SESSION_EXPIRY_HOURS', '24'),
      10,
    );
    this.slidingWindowMinutes = parseInt(
      this.configService.get('SESSION_SLIDING_WINDOW_MINUTES', '30'),
      10,
    );
  }

  onModuleDestroy() {
    this.sessionCache.clear();
    this.logger.log('SessionManagementService destroyed, cache cleared');
  }

  private enforceCacheLRU() {
    if (this.sessionCache.size > this.MAX_CACHE_SIZE) {
      // Simple eviction: remove first entry (oldest inserted)
      const iterator = this.sessionCache.keys();
      const first = iterator.next().value;
      if (first) {
        this.sessionCache.delete(first);
      }
    }
  }

  /**
   * Create a new session
   * Automatically handles device fingerprinting and enforces session limits
   */
  async createSession(
    userId: string,
    token: string,
    refreshToken: string,
    deviceFingerprint: DeviceFingerprint,
    metadata?: Record<string, unknown>,
  ): Promise<Session> {
    const parser = new UAParser(deviceFingerprint.userAgent);
    const browserInfo = parser.getBrowser();
    const osInfo = parser.getOS();
    const deviceInfo = parser.getDevice();

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + this.sessionExpiryHours);

    const refreshTokenExpiresAt = new Date();
    const refreshExpiryDays = parseInt(
      this.configService.get('REFRESH_TOKEN_TTL_DAYS', '7'),
      10,
    );
    refreshTokenExpiresAt.setDate(
      refreshTokenExpiresAt.getDate() + refreshExpiryDays,
    );

    // Check if this is a known device
    const isTrusted = await this.isDeviceTrusted(
      userId,
      deviceFingerprint.userAgent,
      deviceFingerprint.ipAddress,
    );

    const session = this.sessionRepository.create({
      userId,
      token,
      refreshToken,
      refreshTokenExpiresAt,
      deviceInfo: JSON.stringify({
        type: deviceInfo.type || 'unknown',
        vendor: deviceInfo.vendor || null,
        model: deviceInfo.model || null,
      }),
      deviceType: deviceInfo.type || deviceFingerprint.deviceType || null,
      userAgent: deviceFingerprint.userAgent,
      ipAddress: deviceFingerprint.ipAddress,
      browser: browserInfo.name || null,
      os: `${osInfo.name || 'Unknown'} ${osInfo.version || ''}`.trim(),
      location: deviceFingerprint.location || null,
      country: deviceFingerprint.country || null,
      city: deviceFingerprint.city || null,
      expiresAt,
      isActive: true,
      isTrusted,
      lastActivityAt: new Date(),
      metadata: metadata || {},
    });

    const createdSession = await this.sessionRepository.save(session);

    // Enforce session limits
    await this.enforceSessionLimits(userId);

    this.logger.log(
      `Created session ${createdSession.id} for user ${userId} from ${deviceFingerprint.ipAddress}`,
    );

    return createdSession;
  }

  /**
   * Get all active sessions for a user
   */
  async getActiveSessions(userId: string, currentSessionId?: string): Promise<SessionInfo[]> {
    const sessions = await this.sessionRepository.find({
      where: {
        userId,
        isActive: true,
        expiresAt: MoreThan(new Date()),
      },
      order: {
        lastActivityAt: 'DESC',
      },
      take: 100, // Limit to 100 sessions per user to prevent memory issues
    });

    return sessions.map((session) => ({
      id: session.id,
      deviceInfo: session.deviceInfo || 'Unknown Device',
      deviceType: session.deviceType,
      browser: session.browser,
      os: session.os,
      ipAddress: session.ipAddress,
      location: session.location,
      country: session.country,
      city: session.city,
      createdAt: session.createdAt,
      lastActivityAt: session.lastActivityAt || session.createdAt,
      expiresAt: session.expiresAt,
      isActive: session.isActive,
      isTrusted: session.isTrusted,
      isCurrent: session.id === currentSessionId,
    }));
  }

  /**
   * Get session by ID
   */
  async getSessionById(sessionId: string): Promise<Session | null> {
    if (this.sessionCache.has(sessionId)) {
      return this.sessionCache.get(sessionId)!;
    }

    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
    });

    if (session) {
      this.sessionCache.set(sessionId, session);
      this.enforceCacheLRU();
    }

    return session;
  }

  /**
   * Get session by token
   */
  async getSessionByToken(token: string): Promise<Session | null> {
    return this.sessionRepository.findOne({
      where: { token, isActive: true },
    });
  }

  /**
   * Update session activity (sliding window)
   * Extends session expiry if activity is within sliding window
   */
  async updateSessionActivity(
    sessionId: string,
    updateData?: SessionActivityUpdate,
  ): Promise<void> {
    const session = await this.getSessionById(sessionId);

    if (!session || !session.isActive) {
      return;
    }

    const now = new Date();
    const lastActivity = session.lastActivityAt || session.createdAt;
    const minutesSinceActivity =
      (now.getTime() - lastActivity.getTime()) / (1000 * 60);

    // Update last activity
    session.lastActivityAt = now;

    // Update IP and location if provided
    if (updateData?.ipAddress) {
      session.ipAddress = updateData.ipAddress;
    }
    if (updateData?.location) {
      session.location = updateData.location;
    }

    // Sliding window: extend expiry if within window
    if (minutesSinceActivity < this.slidingWindowMinutes) {
      const newExpiresAt = new Date();
      newExpiresAt.setHours(newExpiresAt.getHours() + this.sessionExpiryHours);
      session.expiresAt = newExpiresAt;

      this.logger.debug(
        `Extended session ${sessionId} expiry to ${newExpiresAt.toISOString()} (sliding window)`,
      );
    }

    await this.sessionRepository.save(session);
  }

  /**
   * Revoke a specific session
   */
  async revokeSession(
    sessionId: string,
    userId: string,
    reason?: string,
  ): Promise<void> {
    const session = await this.getSessionById(sessionId);

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.userId !== userId) {
      throw new UnauthorizedException(
        'You do not have permission to revoke this session',
      );
    }

    session.isActive = false;
    session.revokedAt = new Date();
    session.revokedBy = userId;
    session.revocationReason = reason || 'User revoked session';

    await this.sessionRepository.save(session);
    this.sessionCache.delete(sessionId); // Clear from cache

    this.logger.log(
      `Revoked session ${sessionId} for user ${userId}. Reason: ${session.revocationReason}`,
    );
  }

  /**
   * Revoke all sessions except the current one
   */
  async revokeAllOtherSessions(
    userId: string,
    currentSessionId: string,
    reason?: string,
  ): Promise<number> {
    const sessions = await this.sessionRepository.find({
      where: {
        userId,
        isActive: true,
      },
    });

    const sessionsToRevoke = sessions.filter(
      (session) => session.id !== currentSessionId,
    );

    const revokedCount = sessionsToRevoke.length;

    for (const session of sessionsToRevoke) {
      session.isActive = false;
      session.revokedAt = new Date();
      session.revokedBy = userId;
      session.revocationReason =
        reason || 'User revoked all other sessions';
    }

    if (sessionsToRevoke.length > 0) {
      await this.sessionRepository.save(sessionsToRevoke);

      this.logger.log(
        `Revoked ${revokedCount} sessions for user ${userId}, keeping session ${currentSessionId}`,
      );
    }

    return revokedCount;
  }

  /**
   * Revoke all sessions for a user
   */
  async revokeAllUserSessions(userId: string, reason?: string): Promise<number> {
    const sessions = await this.sessionRepository.find({
      where: {
        userId,
        isActive: true,
      },
    });

    const revokedCount = sessions.length;

    for (const session of sessions) {
      session.isActive = false;
      session.revokedAt = new Date();
      session.revokedBy = 'system';
      session.revocationReason = reason || 'All user sessions revoked';
    }

    if (sessions.length > 0) {
      await this.sessionRepository.save(sessions);

      this.logger.log(
        `Revoked all ${revokedCount} sessions for user ${userId}. Reason: ${reason || 'System revocation'}`,
      );
    }

    return revokedCount;
  }

  /**
   * Check if device is trusted based on previous successful logins
   */
  async isDeviceTrusted(
    userId: string,
    userAgent: string,
    ipAddress: string,
  ): Promise<boolean> {
    const trustedSessionCount = await this.sessionRepository.count({
      where: {
        userId,
        userAgent,
        ipAddress,
        isTrusted: true,
      },
    });

    return trustedSessionCount > 0;
  }

  /**
   * Mark a device as trusted
   */
  async markDeviceAsTrusted(sessionId: string, userId: string): Promise<void> {
    const session = await this.getSessionById(sessionId);

    if (!session || session.userId !== userId) {
      throw new NotFoundException('Session not found');
    }

    session.isTrusted = true;
    await this.sessionRepository.save(session);

    this.logger.log(`Marked device as trusted for session ${sessionId}`);
  }

  /**
   * Check if login is from a new device
   */
  async isNewDevice(
    userId: string,
    userAgent: string,
    ipAddress: string,
  ): Promise<boolean> {
    const existingSessionCount = await this.sessionRepository.count({
      where: {
        userId,
        userAgent,
      },
    });

    return existingSessionCount === 0;
  }

  /**
   * Cleanup expired sessions
   * Should be called periodically via a cron job
   */
  async cleanupExpiredSessions(): Promise<number> {
    const expiredSessions = await this.sessionRepository.find({
      where: {
        expiresAt: LessThan(new Date()),
        isActive: true,
      },
    });

    const cleanedCount = expiredSessions.length;

    for (const session of expiredSessions) {
      session.isActive = false;
      session.revokedAt = new Date();
      session.revokedBy = 'system';
      session.revocationReason = 'Session expired';
    }

    if (expiredSessions.length > 0) {
      await this.sessionRepository.save(expiredSessions);

      this.logger.log(
        `Cleaned up ${cleanedCount} expired sessions`,
      );
    }

    return cleanedCount;
  }

  /**
   * Enforce maximum sessions per user
   * Removes oldest sessions when limit is exceeded
   */
  private async enforceSessionLimits(userId: string): Promise<void> {
    const activeSessions = await this.sessionRepository.find({
      where: {
        userId,
        isActive: true,
      },
      order: {
        createdAt: 'ASC',
      },
    });

    if (activeSessions.length > this.maxSessionsPerUser) {
      const sessionsToRevoke = activeSessions.slice(
        0,
        activeSessions.length - this.maxSessionsPerUser,
      );

      for (const session of sessionsToRevoke) {
        session.isActive = false;
        session.revokedAt = new Date();
        session.revokedBy = 'system';
        session.revocationReason = 'Maximum session limit exceeded';
      }

      await this.sessionRepository.save(sessionsToRevoke);

      this.logger.log(
        `Revoked ${sessionsToRevoke.length} oldest sessions for user ${userId} to enforce limit of ${this.maxSessionsPerUser}`,
      );
    }
  }

  /**
   * Get session statistics for a user
   */
  async getUserSessionStats(userId: string): Promise<{
    totalSessions: number;
    activeSessions: number;
    trustedDevices: number;
    recentLocations: string[];
  }> {
    const allSessions = await this.sessionRepository.find({
      where: { userId },
    });

    const activeSessions = allSessions.filter((s) => s.isActive);
    const trustedDevices = new Set(
      allSessions
        .filter((s) => s.isTrusted)
        .map((s) => `${s.userAgent}-${s.ipAddress}`),
    );

    const recentLocations = Array.from(
      new Set(
        activeSessions
          .filter((s) => s.location)
          .map((s) => s.location as string)
          .slice(0, 5),
      ),
    );

    return {
      totalSessions: allSessions.length,
      activeSessions: activeSessions.length,
      trustedDevices: trustedDevices.size,
      recentLocations,
    };
  }
}
