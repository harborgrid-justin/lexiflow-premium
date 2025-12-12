import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Session } from '../../entities/session.entity';
import { User } from '../../entities/user.entity';
import * as crypto from 'crypto';
import * as geoip from 'geoip-lite';
import * as DeviceDetector from 'device-detector-js';

export interface SessionInfo {
  id: string;
  deviceType: string;
  browser: string;
  os: string;
  ipAddress: string;
  location: string;
  country: string;
  city: string;
  lastActivityAt: Date;
  createdAt: Date;
  expiresAt: Date;
  isCurrent: boolean;
  isTrusted: boolean;
}

export interface CreateSessionOptions {
  userId: string;
  token: string;
  refreshToken?: string;
  refreshTokenExpiresAt?: Date;
  ipAddress: string;
  userAgent: string;
  expiresIn?: number; // in seconds
  trustDevice?: boolean;
  deviceFingerprint?: string;
}

@Injectable()
export class SessionManagementService {
  private readonly deviceDetector: DeviceDetector;
  private readonly MAX_SESSIONS_PER_USER = 10;
  private readonly SESSION_EXPIRY_HOURS = 24;

  constructor(
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    this.deviceDetector = new DeviceDetector();
  }

  /**
   * Create a new session with device fingerprinting and geolocation
   * Following OWASP Session Management best practices
   */
  async createSession(
    options: CreateSessionOptions,
  ): Promise<Session> {
    const {
      userId,
      token,
      refreshToken,
      refreshTokenExpiresAt,
      ipAddress,
      userAgent,
      expiresIn = this.SESSION_EXPIRY_HOURS * 3600,
      trustDevice = false,
      deviceFingerprint,
    } = options;

    // Validate user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Parse device information
    const deviceInfo = this.deviceDetector.parse(userAgent);
    const geoInfo = geoip.lookup(ipAddress);

    // Check session limit and clean up old sessions
    await this.enforceSessionLimit(userId);

    // Create session
    const session = this.sessionRepository.create({
      userId,
      token,
      refreshToken,
      refreshTokenExpiresAt,
      ipAddress,
      userAgent,
      deviceType: deviceInfo.device?.type || 'desktop',
      browser: `${deviceInfo.client?.name || 'Unknown'} ${deviceInfo.client?.version || ''}`.trim(),
      os: `${deviceInfo.os?.name || 'Unknown'} ${deviceInfo.os?.version || ''}`.trim(),
      location: geoInfo ? `${geoInfo.city}, ${geoInfo.country}` : 'Unknown',
      country: geoInfo?.country || null,
      city: geoInfo?.city || null,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
      lastActivityAt: new Date(),
      isActive: true,
      isTrusted: trustDevice,
      deviceInfo: JSON.stringify({
        ...deviceInfo,
        fingerprint: deviceFingerprint,
      }),
      metadata: {
        createdVia: 'web',
        securityLevel: trustDevice ? 'trusted' : 'standard',
      },
    });

    return await this.sessionRepository.save(session);
  }

  /**
   * Get all active sessions for a user
   */
  async getUserSessions(userId: string): Promise<SessionInfo[]> {
    const sessions = await this.sessionRepository.find({
      where: {
        userId,
        isActive: true,
        revokedAt: null,
      },
      order: {
        lastActivityAt: 'DESC',
      },
    });

    return sessions.map((session) => this.mapToSessionInfo(session));
  }

  /**
   * Get a specific session
   */
  async getSession(sessionId: string): Promise<Session | null> {
    return await this.sessionRepository.findOne({
      where: { id: sessionId },
    });
  }

  /**
   * Get session by token
   */
  async getSessionByToken(token: string): Promise<Session | null> {
    return await this.sessionRepository.findOne({
      where: { token, isActive: true, revokedAt: null },
    });
  }

  /**
   * Update session activity timestamp
   * Called on each authenticated request to track user activity
   */
  async updateSessionActivity(sessionId: string): Promise<void> {
    await this.sessionRepository.update(sessionId, {
      lastActivityAt: new Date(),
    });
  }

  /**
   * Revoke a specific session (force logout)
   */
  async revokeSession(
    sessionId: string,
    revokedBy: string,
    reason: string,
  ): Promise<void> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new BadRequestException('Session not found');
    }

    await this.sessionRepository.update(sessionId, {
      isActive: false,
      revokedAt: new Date(),
      revokedBy,
      revocationReason: reason,
    });
  }

  /**
   * Revoke all sessions for a user (force logout from all devices)
   */
  async revokeAllUserSessions(
    userId: string,
    exceptSessionId?: string,
    reason: string = 'User initiated logout from all devices',
  ): Promise<number> {
    const query = this.sessionRepository
      .createQueryBuilder()
      .update(Session)
      .set({
        isActive: false,
        revokedAt: new Date(),
        revokedBy: userId,
        revocationReason: reason,
      })
      .where('userId = :userId', { userId })
      .andWhere('isActive = :isActive', { isActive: true });

    if (exceptSessionId) {
      query.andWhere('id != :exceptSessionId', { exceptSessionId });
    }

    const result = await query.execute();
    return result.affected || 0;
  }

  /**
   * Revoke all sessions except current
   */
  async revokeOtherSessions(
    userId: string,
    currentSessionId: string,
  ): Promise<number> {
    return await this.revokeAllUserSessions(
      userId,
      currentSessionId,
      'User logged out from other devices',
    );
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<number> {
    const result = await this.sessionRepository.delete({
      expiresAt: LessThan(new Date()),
    });

    return result.affected || 0;
  }

  /**
   * Trust a device
   */
  async trustDevice(sessionId: string): Promise<void> {
    await this.sessionRepository.update(sessionId, {
      isTrusted: true,
    });
  }

  /**
   * Untrust a device
   */
  async untrustDevice(sessionId: string): Promise<void> {
    await this.sessionRepository.update(sessionId, {
      isTrusted: false,
    });
  }

  /**
   * Get trusted devices for a user
   */
  async getTrustedDevices(userId: string): Promise<SessionInfo[]> {
    const sessions = await this.sessionRepository.find({
      where: {
        userId,
        isTrusted: true,
        isActive: true,
        revokedAt: null,
      },
      order: {
        lastActivityAt: 'DESC',
      },
    });

    return sessions.map((session) => this.mapToSessionInfo(session));
  }

  /**
   * Check if session is from a suspicious location
   * Implements basic anomaly detection for OWASP A07:2021 - Identification and Authentication Failures
   */
  async detectSuspiciousSession(
    userId: string,
    ipAddress: string,
  ): Promise<boolean> {
    // Get recent sessions
    const recentSessions = await this.sessionRepository.find({
      where: { userId, isActive: true },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    if (recentSessions.length === 0) {
      return false; // First session, not suspicious
    }

    const newGeo = geoip.lookup(ipAddress);
    if (!newGeo) {
      return false; // Can't determine location
    }

    // Check if location differs significantly from recent sessions
    const recentCountries = recentSessions.map((s) => s.country).filter(Boolean);
    const uniqueCountries = new Set(recentCountries);

    // Suspicious if logging in from a new country
    if (uniqueCountries.size > 0 && !uniqueCountries.has(newGeo.country)) {
      return true;
    }

    return false;
  }

  /**
   * Get session statistics for a user
   */
  async getSessionStats(userId: string): Promise<{
    totalSessions: number;
    activeSessions: number;
    trustedDevices: number;
    revokedSessions: number;
    deviceTypes: Record<string, number>;
  }> {
    const allSessions = await this.sessionRepository.find({
      where: { userId },
    });

    const stats = {
      totalSessions: allSessions.length,
      activeSessions: allSessions.filter((s) => s.isActive && !s.revokedAt)
        .length,
      trustedDevices: allSessions.filter((s) => s.isTrusted && s.isActive)
        .length,
      revokedSessions: allSessions.filter((s) => s.revokedAt !== null).length,
      deviceTypes: {} as Record<string, number>,
    };

    // Count device types
    allSessions.forEach((session) => {
      const deviceType = session.deviceType || 'unknown';
      stats.deviceTypes[deviceType] =
        (stats.deviceTypes[deviceType] || 0) + 1;
    });

    return stats;
  }

  /**
   * Enforce session limit per user
   * Removes oldest inactive sessions if limit is exceeded
   */
  private async enforceSessionLimit(userId: string): Promise<void> {
    const activeSessions = await this.sessionRepository.find({
      where: { userId, isActive: true },
      order: { lastActivityAt: 'ASC' },
    });

    if (activeSessions.length >= this.MAX_SESSIONS_PER_USER) {
      // Revoke oldest sessions
      const sessionsToRevoke = activeSessions.slice(
        0,
        activeSessions.length - this.MAX_SESSIONS_PER_USER + 1,
      );

      for (const session of sessionsToRevoke) {
        await this.revokeSession(
          session.id,
          'system',
          'Session limit exceeded',
        );
      }
    }
  }

  /**
   * Map Session entity to SessionInfo DTO
   */
  private mapToSessionInfo(
    session: Session,
    currentSessionId?: string,
  ): SessionInfo {
    return {
      id: session.id,
      deviceType: session.deviceType || 'unknown',
      browser: session.browser || 'Unknown',
      os: session.os || 'Unknown',
      ipAddress: session.ipAddress,
      location: session.location || 'Unknown',
      country: session.country || 'Unknown',
      city: session.city || 'Unknown',
      lastActivityAt: session.lastActivityAt || session.createdAt,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      isCurrent: currentSessionId ? session.id === currentSessionId : false,
      isTrusted: session.isTrusted,
    };
  }

  /**
   * Validate session token
   */
  async validateSession(token: string): Promise<Session | null> {
    const session = await this.getSessionByToken(token);

    if (!session) {
      return null;
    }

    // Check if expired
    if (session.expiresAt < new Date()) {
      await this.revokeSession(session.id, 'system', 'Session expired');
      return null;
    }

    // Update activity
    await this.updateSessionActivity(session.id);

    return session;
  }

  /**
   * Refresh session expiry
   */
  async refreshSession(
    sessionId: string,
    expiresIn: number = this.SESSION_EXPIRY_HOURS * 3600,
  ): Promise<void> {
    await this.sessionRepository.update(sessionId, {
      expiresAt: new Date(Date.now() + expiresIn * 1000),
      lastActivityAt: new Date(),
    });
  }
}
