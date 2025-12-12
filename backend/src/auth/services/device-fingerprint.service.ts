import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from '../../entities/session.entity';
import * as crypto from 'crypto';
import * as DeviceDetector from 'device-detector-js';

export interface DeviceFingerprint {
  fingerprint: string;
  components: DeviceFingerprintComponents;
  confidence: number; // 0-100
  riskScore: number; // 0-100 (higher = more risky)
}

export interface DeviceFingerprintComponents {
  userAgent: string;
  screen?: {
    width: number;
    height: number;
    colorDepth: number;
  };
  timezone?: string;
  language?: string;
  platform?: string;
  plugins?: string[];
  fonts?: string[];
  canvas?: string;
  webgl?: string;
  audioContext?: string;
  hardwareConcurrency?: number;
  deviceMemory?: number;
  doNotTrack?: string;
  cookiesEnabled?: boolean;
  localStorageEnabled?: boolean;
}

export interface DeviceTrustResult {
  isTrusted: boolean;
  isKnown: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  reasons: string[];
  confidence: number;
}

/**
 * Device Fingerprint Service
 * Implements device recognition and trust scoring
 * OWASP ASVS V2.2 - Authentication Architecture
 */
@Injectable()
export class DeviceFingerprintService {
  private readonly logger = new Logger(DeviceFingerprintService.name);
  private readonly deviceDetector: DeviceDetector;

  // Thresholds for risk assessment
  private readonly RISK_THRESHOLDS = {
    low: 25,
    medium: 50,
    high: 75,
  };

  constructor(
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
  ) {
    this.deviceDetector = new DeviceDetector();
  }

  /**
   * Generate device fingerprint from components
   * Uses multiple signals to create a unique identifier
   */
  generateFingerprint(
    components: DeviceFingerprintComponents,
  ): DeviceFingerprint {
    // Create a normalized string from all components
    const fingerprintData = this.normalizeComponents(components);

    // Generate hash
    const fingerprint = crypto
      .createHash('sha256')
      .update(fingerprintData)
      .digest('hex');

    // Calculate confidence based on available signals
    const confidence = this.calculateConfidence(components);

    // Calculate risk score
    const riskScore = this.calculateRiskScore(components);

    return {
      fingerprint,
      components,
      confidence,
      riskScore,
    };
  }

  /**
   * Verify if device fingerprint matches a known session
   */
  async verifyDevice(
    fingerprint: string,
    userId: string,
  ): Promise<DeviceTrustResult> {
    const reasons: string[] = [];
    let riskScore = 0;

    // Find sessions with matching fingerprint
    const matchingSessions = await this.sessionRepository.find({
      where: { userId },
      order: { lastActivityAt: 'DESC' },
      take: 50, // Check last 50 sessions
    });

    const knownFingerprints = matchingSessions
      .map((session) => {
        try {
          const deviceInfo = JSON.parse(session.deviceInfo || '{}');
          return deviceInfo.fingerprint;
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    const isKnown = knownFingerprints.includes(fingerprint);

    if (!isKnown) {
      reasons.push('Device not recognized');
      riskScore += 30;
    } else {
      reasons.push('Device recognized from previous sessions');
    }

    // Check if device was recently used
    const recentSession = matchingSessions.find((session) => {
      try {
        const deviceInfo = JSON.parse(session.deviceInfo || '{}');
        return deviceInfo.fingerprint === fingerprint;
      } catch {
        return false;
      }
    });

    if (recentSession) {
      const daysSinceLastUse = Math.floor(
        (Date.now() - new Date(recentSession.lastActivityAt).getTime()) /
          (1000 * 60 * 60 * 24),
      );

      if (daysSinceLastUse < 7) {
        reasons.push('Device used within last week');
        riskScore -= 10;
      } else if (daysSinceLastUse < 30) {
        reasons.push('Device used within last month');
        riskScore -= 5;
      } else {
        reasons.push('Device not used recently');
        riskScore += 15;
      }
    }

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical';
    if (riskScore < this.RISK_THRESHOLDS.low) {
      riskLevel = 'low';
    } else if (riskScore < this.RISK_THRESHOLDS.medium) {
      riskLevel = 'medium';
    } else if (riskScore < this.RISK_THRESHOLDS.high) {
      riskLevel = 'high';
    } else {
      riskLevel = 'critical';
    }

    // Determine if device should be trusted
    const isTrusted = isKnown && riskLevel === 'low';

    // Calculate confidence
    const confidence = this.calculateTrustConfidence(
      isKnown,
      matchingSessions.length,
      riskScore,
    );

    return {
      isTrusted,
      isKnown,
      riskLevel,
      reasons,
      confidence,
    };
  }

  /**
   * Check if device characteristics have changed suspiciously
   * Detects device spoofing attempts
   */
  async detectDeviceSpoofing(
    currentComponents: DeviceFingerprintComponents,
    previousComponents: DeviceFingerprintComponents,
  ): Promise<{
    isSuspicious: boolean;
    changes: string[];
    riskScore: number;
  }> {
    const changes: string[] = [];
    let riskScore = 0;

    // Check user agent changes
    if (currentComponents.userAgent !== previousComponents.userAgent) {
      const currentDevice = this.deviceDetector.parse(
        currentComponents.userAgent,
      );
      const previousDevice = this.deviceDetector.parse(
        previousComponents.userAgent,
      );

      // Significant device changes are suspicious
      if (currentDevice.device?.type !== previousDevice.device?.type) {
        changes.push('Device type changed');
        riskScore += 40;
      }

      if (currentDevice.os?.name !== previousDevice.os?.name) {
        changes.push('Operating system changed');
        riskScore += 30;
      }

      if (currentDevice.client?.name !== previousDevice.client?.name) {
        changes.push('Browser changed');
        riskScore += 10;
      }
    }

    // Check screen resolution changes (uncommon)
    if (
      currentComponents.screen &&
      previousComponents.screen &&
      (currentComponents.screen.width !== previousComponents.screen.width ||
        currentComponents.screen.height !== previousComponents.screen.height)
    ) {
      changes.push('Screen resolution changed');
      riskScore += 20;
    }

    // Check timezone changes (can indicate VPN/proxy)
    if (
      currentComponents.timezone &&
      previousComponents.timezone &&
      currentComponents.timezone !== previousComponents.timezone
    ) {
      changes.push('Timezone changed');
      riskScore += 25;
    }

    // Check language changes
    if (
      currentComponents.language &&
      previousComponents.language &&
      currentComponents.language !== previousComponents.language
    ) {
      changes.push('Language changed');
      riskScore += 15;
    }

    // Check hardware characteristics
    if (
      currentComponents.hardwareConcurrency &&
      previousComponents.hardwareConcurrency &&
      currentComponents.hardwareConcurrency !==
        previousComponents.hardwareConcurrency
    ) {
      changes.push('Hardware concurrency changed');
      riskScore += 35;
    }

    if (
      currentComponents.deviceMemory &&
      previousComponents.deviceMemory &&
      currentComponents.deviceMemory !== previousComponents.deviceMemory
    ) {
      changes.push('Device memory changed');
      riskScore += 35;
    }

    return {
      isSuspicious: riskScore >= 50,
      changes,
      riskScore: Math.min(100, riskScore),
    };
  }

  /**
   * Get device information from user agent
   */
  parseDeviceInfo(userAgent: string): {
    deviceType: string;
    browser: string;
    os: string;
    isBot: boolean;
  } {
    const deviceInfo = this.deviceDetector.parse(userAgent);

    return {
      deviceType: deviceInfo.device?.type || 'desktop',
      browser: `${deviceInfo.client?.name || 'Unknown'} ${deviceInfo.client?.version || ''}`.trim(),
      os: `${deviceInfo.os?.name || 'Unknown'} ${deviceInfo.os?.version || ''}`.trim(),
      isBot: deviceInfo.bot !== null,
    };
  }

  /**
   * Detect if request is from a bot
   */
  isBot(userAgent: string): boolean {
    const deviceInfo = this.deviceDetector.parse(userAgent);
    return deviceInfo.bot !== null;
  }

  /**
   * Detect if device is using Tor or VPN
   */
  async detectAnonymousNetwork(
    ipAddress: string,
  ): Promise<{
    isTor: boolean;
    isVpn: boolean;
    isProxy: boolean;
    confidence: number;
  }> {
    // In production, integrate with services like:
    // - IPHub
    // - IPQualityScore
    // - MaxMind GeoIP2
    // - TorProject exit node list

    // Simplified detection for now
    const result = {
      isTor: false,
      isVpn: false,
      isProxy: false,
      confidence: 0,
    };

    // Check Tor exit node list (would need to be maintained)
    // result.isTor = await this.checkTorExitNode(ipAddress);

    // Check known VPN/proxy IP ranges
    // result.isVpn = await this.checkVpnDatabase(ipAddress);

    // Check proxy headers
    // result.isProxy = await this.checkProxyHeaders(request);

    return result;
  }

  /**
   * Calculate device fingerprint similarity
   * Returns a score from 0-100 indicating how similar two fingerprints are
   */
  calculateSimilarity(
    fingerprint1: DeviceFingerprintComponents,
    fingerprint2: DeviceFingerprintComponents,
  ): number {
    let matchCount = 0;
    let totalChecks = 0;

    // Compare user agent
    if (fingerprint1.userAgent && fingerprint2.userAgent) {
      totalChecks++;
      if (fingerprint1.userAgent === fingerprint2.userAgent) {
        matchCount++;
      }
    }

    // Compare screen resolution
    if (fingerprint1.screen && fingerprint2.screen) {
      totalChecks++;
      if (
        fingerprint1.screen.width === fingerprint2.screen.width &&
        fingerprint1.screen.height === fingerprint2.screen.height
      ) {
        matchCount++;
      }
    }

    // Compare timezone
    if (fingerprint1.timezone && fingerprint2.timezone) {
      totalChecks++;
      if (fingerprint1.timezone === fingerprint2.timezone) {
        matchCount++;
      }
    }

    // Compare language
    if (fingerprint1.language && fingerprint2.language) {
      totalChecks++;
      if (fingerprint1.language === fingerprint2.language) {
        matchCount++;
      }
    }

    // Compare platform
    if (fingerprint1.platform && fingerprint2.platform) {
      totalChecks++;
      if (fingerprint1.platform === fingerprint2.platform) {
        matchCount++;
      }
    }

    if (totalChecks === 0) {
      return 0;
    }

    return Math.round((matchCount / totalChecks) * 100);
  }

  /**
   * Normalize device fingerprint components for hashing
   */
  private normalizeComponents(
    components: DeviceFingerprintComponents,
  ): string {
    const parts: string[] = [];

    // User agent (most important)
    parts.push(components.userAgent || 'unknown');

    // Screen resolution
    if (components.screen) {
      parts.push(
        `${components.screen.width}x${components.screen.height}x${components.screen.colorDepth}`,
      );
    }

    // Timezone
    parts.push(components.timezone || 'unknown');

    // Language
    parts.push(components.language || 'unknown');

    // Platform
    parts.push(components.platform || 'unknown');

    // Hardware characteristics
    parts.push(`${components.hardwareConcurrency || 0}`);
    parts.push(`${components.deviceMemory || 0}`);

    // Browser features
    parts.push(components.doNotTrack || 'unknown');
    parts.push(`${components.cookiesEnabled || false}`);
    parts.push(`${components.localStorageEnabled || false}`);

    // Canvas fingerprint
    if (components.canvas) {
      parts.push(components.canvas);
    }

    // WebGL fingerprint
    if (components.webgl) {
      parts.push(components.webgl);
    }

    // Audio context fingerprint
    if (components.audioContext) {
      parts.push(components.audioContext);
    }

    return parts.join('|');
  }

  /**
   * Calculate confidence score based on available signals
   */
  private calculateConfidence(
    components: DeviceFingerprintComponents,
  ): number {
    let score = 0;
    let maxScore = 0;

    // User agent (required, highest weight)
    maxScore += 30;
    if (components.userAgent) {
      score += 30;
    }

    // Screen resolution (high weight)
    maxScore += 20;
    if (components.screen) {
      score += 20;
    }

    // Canvas fingerprint (high weight)
    maxScore += 15;
    if (components.canvas) {
      score += 15;
    }

    // WebGL fingerprint (high weight)
    maxScore += 15;
    if (components.webgl) {
      score += 15;
    }

    // Timezone (medium weight)
    maxScore += 10;
    if (components.timezone) {
      score += 10;
    }

    // Language (low weight)
    maxScore += 5;
    if (components.language) {
      score += 5;
    }

    // Hardware characteristics (medium weight)
    maxScore += 5;
    if (components.hardwareConcurrency) {
      score += 5;
    }

    return Math.round((score / maxScore) * 100);
  }

  /**
   * Calculate risk score based on device characteristics
   */
  private calculateRiskScore(
    components: DeviceFingerprintComponents,
  ): number {
    let riskScore = 0;

    // Parse user agent
    const deviceInfo = this.deviceDetector.parse(components.userAgent);

    // Bot detection (high risk)
    if (deviceInfo.bot !== null) {
      riskScore += 80;
    }

    // Unknown browser (medium risk)
    if (!deviceInfo.client || deviceInfo.client.name === 'Unknown') {
      riskScore += 30;
    }

    // Unknown OS (medium risk)
    if (!deviceInfo.os || deviceInfo.os.name === 'Unknown') {
      riskScore += 25;
    }

    // Do Not Track enabled (slight risk reduction for privacy-conscious users)
    if (components.doNotTrack === '1' || components.doNotTrack === 'yes') {
      riskScore -= 5;
    }

    // Cookies disabled (medium risk)
    if (components.cookiesEnabled === false) {
      riskScore += 20;
    }

    // Missing canvas fingerprint (low risk)
    if (!components.canvas) {
      riskScore += 10;
    }

    // Missing WebGL fingerprint (low risk)
    if (!components.webgl) {
      riskScore += 10;
    }

    return Math.max(0, Math.min(100, riskScore));
  }

  /**
   * Calculate trust confidence
   */
  private calculateTrustConfidence(
    isKnown: boolean,
    sessionCount: number,
    riskScore: number,
  ): number {
    let confidence = 0;

    if (isKnown) {
      confidence += 50;
    }

    // More sessions = higher confidence
    if (sessionCount >= 10) {
      confidence += 30;
    } else if (sessionCount >= 5) {
      confidence += 20;
    } else if (sessionCount >= 2) {
      confidence += 10;
    }

    // Lower risk = higher confidence
    confidence += Math.max(0, 20 - riskScore / 5);

    return Math.min(100, Math.round(confidence));
  }
}
