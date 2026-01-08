import {
  Injectable,
  Logger,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Session } from '../entities/session.entity';
import { DeviceFingerprintService } from './device.fingerprint.service';

/**
 * Enterprise Session Service
 * Advanced session management with device tracking and security features
 */
@Injectable()
export class EnterpriseSessionService {
  private readonly logger = new Logger(EnterpriseSessionService.name);
  private readonly maxConcurrentSessions: number;

  constructor(
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    private deviceFingerprintService: DeviceFingerprintService,
    private configService: ConfigService,
  ) {
    this.maxConcurrentSessions = parseInt(
      this.configService.get('MAX_CONCURRENT_SESSIONS', '5'),
      10,
    );
  }

  /**
   * Create session with device fingerprinting
   */
  async createSession(
    userId: string,
    token: string,
    refreshToken: string,
    req: any,
  ): Promise<Session> {
    const deviceMetadata = this.deviceFingerprintService.generateDeviceMetadata(req);
    const location = await this.deviceFingerprintService.getLocationFromIp(
      deviceMetadata.ip,
    );

    // Check concurrent session limit
    await this.enforceSessionLimit(userId);

    const session = this.sessionRepository.create({
      userId,
      token,
      refreshToken,
      deviceInfo: JSON.stringify(deviceMetadata),
      deviceType: deviceMetadata.deviceType,
      userAgent: deviceMetadata.userAgent,
      ipAddress: deviceMetadata.ip,
      browser: deviceMetadata.browser,
      os: deviceMetadata.os,
      country: location.country,
      city: location.city,
      location: `${location.city}, ${location.country}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      refreshTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      isActive: true,
      isTrusted: false,
      lastActivityAt: new Date(),
      metadata: {
        fingerprint: deviceMetadata.fingerprint,
        isSuspicious: deviceMetadata.isSuspicious,
        riskScore: 0,
      },
    });

    await this.sessionRepository.save(session);

    this.logger.log(
      `Created session for user ${userId} from ${deviceMetadata.ip}`,
    );

    return session;
  }

  /**
   * Enforce concurrent session limit
   */
  async enforceSessionLimit(userId: string): Promise<void> {
    const activeSessions = await this.sessionRepository.find({
      where: {
        userId,
        isActive: true,
      },
      order: { lastActivityAt: 'DESC' },
    });

    if (activeSessions.length >= this.maxConcurrentSessions) {
      // Revoke oldest session
      const oldestSession = activeSessions[activeSessions.length - 1];
      oldestSession.isActive = false;
      oldestSession.revokedAt = new Date();
      oldestSession.revokedBy = 'system';
      oldestSession.revocationReason = 'Maximum concurrent sessions exceeded';
      await this.sessionRepository.save(oldestSession);

      this.logger.log(
        `Revoked oldest session for user ${userId} due to concurrent session limit`,
      );
    }
  }

  /**
   * Get active sessions with device details
   */
  async getActiveSessions(
    userId: string,
    currentSessionId?: string,
  ): Promise<
    Array<{
      id: string;
      deviceType: string;
      browser: string;
      os: string;
      location: string;
      ipAddress: string;
      lastActivityAt: Date;
      createdAt: Date;
      isTrusted: boolean;
      isCurrent: boolean;
      riskScore: number;
    }>
  > {
    const sessions = await this.sessionRepository.find({
      where: {
        userId,
        isActive: true,
      },
      order: { lastActivityAt: 'DESC' },
    });

    return sessions.map((session) => ({
      id: session.id,
      deviceType: session.deviceType || 'unknown',
      browser: session.browser || 'Unknown',
      os: session.os || 'Unknown',
      location: session.location || 'Unknown',
      ipAddress: session.ipAddress,
      lastActivityAt: session.lastActivityAt,
      createdAt: session.createdAt,
      isTrusted: session.isTrusted,
      isCurrent: currentSessionId === session.id,
      riskScore: (session.metadata as any)?.riskScore || 0,
    }));
  }

  /**
   * Force logout user from all devices
   */
  async forceLogoutAllDevices(userId: string): Promise<number> {
    const result = await this.sessionRepository.update(
      {
        userId,
        isActive: true,
      },
      {
        isActive: false,
        revokedAt: new Date(),
        revokedBy: 'user',
        revocationReason: 'User initiated force logout',
      },
    );

    this.logger.log(
      `Force logged out user ${userId} from all devices`,
    );

    return result.affected || 0;
  }

  /**
   * Force logout from specific device
   */
  async forceLogoutDevice(
    sessionId: string,
    userId: string,
  ): Promise<void> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new BadRequestException('Session not found');
    }

    session.isActive = false;
    session.revokedAt = new Date();
    session.revokedBy = 'user';
    session.revocationReason = 'User initiated device logout';

    await this.sessionRepository.save(session);

    this.logger.log(
      `Force logged out session ${sessionId} for user ${userId}`,
    );
  }

  /**
   * Mark device as trusted
   */
  async markDeviceAsTrusted(sessionId: string, userId: string): Promise<void> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new BadRequestException('Session not found');
    }

    session.isTrusted = true;
    await this.sessionRepository.save(session);

    this.logger.log(
      `Marked device as trusted for session ${sessionId}`,
    );
  }

  /**
   * Update session activity
   */
  async updateSessionActivity(sessionId: string): Promise<void> {
    await this.sessionRepository.update(
      { id: sessionId },
      { lastActivityAt: new Date() },
    );
  }

  /**
   * Calculate session risk score
   */
  async calculateSessionRisk(session: Session): Promise<number> {
    const deviceInfo = this.deviceFingerprintService.generateDeviceMetadata({
      headers: { 'user-agent': session.userAgent },
      connection: { remoteAddress: session.ipAddress },
    });

    // Check for suspicious patterns
    const isNewDevice = !session.isTrusted;
    const locationChanged = false; // Would check against previous sessions
    const suspiciousUserAgent = deviceInfo.isSuspicious;
    const vpnDetected = false; // Would integrate with VPN detection service

    const riskScore = this.deviceFingerprintService.calculateDeviceRiskScore({
      isNewDevice,
      locationChanged,
      suspiciousUserAgent,
      vpnDetected,
      recentFailedAttempts: 0,
    });

    // Update session with risk score
    session.metadata = {
      ...session.metadata,
      riskScore,
      lastRiskCheck: new Date().toISOString(),
    };
    await this.sessionRepository.save(session);

    return riskScore;
  }

  /**
   * Cleanup expired sessions
   */
  async cleanupExpiredSessions(): Promise<number> {
    const result = await this.sessionRepository.delete({
      expiresAt: LessThan(new Date()),
    });

    const count = result.affected || 0;
    this.logger.log(`Cleaned up ${count} expired sessions`);

    return count;
  }

  /**
   * Get session statistics for user
   */
  async getUserSessionStats(userId: string): Promise<{
    totalSessions: number;
    activeSessions: number;
    trustedDevices: number;
    recentLocations: string[];
    averageSessionDuration: number;
  }> {
    const sessions = await this.sessionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 100,
    });

    const activeSessions = sessions.filter((s) => s.isActive);
    const trustedDevices = sessions.filter(
      (s) => s.isTrusted && s.isActive,
    ).length;
    const recentLocations = [
      ...new Set(
        sessions
          .slice(0, 10)
          .map((s) => s.location)
          .filter(Boolean),
      ),
    ];

    // Calculate average session duration
    const completedSessions = sessions.filter((s) => !s.isActive && s.revokedAt);
    const totalDuration = completedSessions.reduce((sum, s) => {
      const duration = s.revokedAt
        ? s.revokedAt.getTime() - s.createdAt.getTime()
        : 0;
      return sum + duration;
    }, 0);
    const averageSessionDuration = completedSessions.length
      ? Math.floor(totalDuration / completedSessions.length / 1000 / 60) // in minutes
      : 0;

    return {
      totalSessions: sessions.length,
      activeSessions: activeSessions.length,
      trustedDevices,
      recentLocations,
      averageSessionDuration,
    };
  }

  /**
   * Detect anomalous session activity
   */
  async detectAnomalousActivity(
    userId: string,
    currentSession: Session,
  ): Promise<{
    isAnomalous: boolean;
    reasons: string[];
    riskScore: number;
  }> {
    const recentSessions = await this.sessionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 10,
    });

    const reasons: string[] = [];
    let riskScore = 0;

    // Check for location changes
    const locations = new Set(
      recentSessions.map((s) => s.location).filter(Boolean),
    );
    if (locations.size > 3) {
      reasons.push('Multiple locations detected');
      riskScore += 20;
    }

    // Check for simultaneous sessions from different locations
    const activeLocations = new Set(
      recentSessions
        .filter((s) => s.isActive)
        .map((s) => s.location)
        .filter(Boolean),
    );
    if (activeLocations.size > 2) {
      reasons.push('Simultaneous sessions from different locations');
      riskScore += 30;
    }

    // Check for suspicious user agents
    if (
      this.deviceFingerprintService.detectSuspiciousUserAgent(
        currentSession.userAgent,
      )
    ) {
      reasons.push('Suspicious user agent detected');
      riskScore += 40;
    }

    // Check for rapid session creation
    const recentSessionCount = recentSessions.filter(
      (s) => s.createdAt > new Date(Date.now() - 60 * 60 * 1000),
    ).length;
    if (recentSessionCount > 5) {
      reasons.push('Rapid session creation detected');
      riskScore += 25;
    }

    return {
      isAnomalous: riskScore > 50,
      reasons,
      riskScore: Math.min(riskScore, 100),
    };
  }
}
