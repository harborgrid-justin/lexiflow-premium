import { Injectable, Logger } from '@nestjs/common';

/**
 * CSP Violation Report (from browser)
 */
export interface CspViolationReport {
  // Document that triggered the violation
  documentUri: string;

  // The violated directive
  violatedDirective: string;
  effectiveDirective: string;

  // The resource that violated the policy
  blockedUri: string;

  // Original CSP policy
  originalPolicy: string;

  // Source file information
  sourceFile?: string;
  lineNumber?: number;
  columnNumber?: number;

  // Script sample (if available)
  scriptSample?: string;

  // Disposition (enforce or report-only)
  disposition: 'enforce' | 'report';

  // Status code
  statusCode: number;

  // Referrer
  referrer?: string;
}

/**
 * CSP Violation Entry (processed)
 */
export interface CspViolationEntry {
  id: string;
  timestamp: Date;
  report: CspViolationReport;
  userAgent: string;
  ipAddress: string;
  userId?: string;
  sessionId?: string;

  // Analysis
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'script' | 'style' | 'image' | 'font' | 'frame' | 'connect' | 'media' | 'object' | 'other';
  isAttack: boolean;
  isFalsePositive: boolean;
}

/**
 * CSP Violation Statistics
 */
export interface CspViolationStats {
  totalViolations: number;
  violationsByDirective: Record<string, number>;
  violationsByCategory: Record<string, number>;
  topBlockedUris: Array<{ uri: string; count: number }>;
  suspiciousViolations: number;
  timeRange: { from: Date; to: Date };
}

/**
 * Content Security Policy Violation Reporting Service
 *
 * Handles CSP violation reports from browsers and provides:
 * - CSP violation collection and analysis
 * - Attack pattern detection (XSS, injection attempts)
 * - False positive identification
 * - Policy tuning recommendations
 * - Real-time alerting for suspicious violations
 * - Integration with security monitoring
 *
 * OWASP References:
 * - XSS Prevention Cheat Sheet
 * - Content Security Policy Cheat Sheet
 *
 * @see https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html
 */
/**
 * ╔=================================================================================================================╗
 * ║CSPVIOLATION                                                                                                     ║
 * ╠=================================================================================================================╣
 * ║                                                                                                                 ║
 * ║  External Request                   Controller                            Service                                ║
 * ║       │                                   │                                     │                                ║
 * ║       │  HTTP Endpoints                  │                                     │                                ║
 * ║       └───────────────────────────────────►                                     │                                ║
 * ║                                                                                                                 ║
 * ║                                                                 ┌───────────────┴───────────────┐                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          Repository                    Database                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          PostgreSQL                                          ║
 * ║                                                                                                                 ║
 * ║  DATA IN:  Data input                                                                                         ║

 * ║                                                                                                                 ║
 * ║  DATA OUT: Data output                                                                                        ║

 * ║                                                                                                                 ║

 * ╚=================================================================================================================╝
 */

@Injectable()
export class CspViolationService {
  private readonly logger = new Logger(CspViolationService.name);
  private readonly violations: CspViolationEntry[] = [];
  private readonly MAX_VIOLATIONS = 1000;

  // Suspicious patterns that indicate attacks
  private readonly SUSPICIOUS_PATTERNS = [
    /javascript:/gi,
    /data:text\/html/gi,
    /<script/gi,
    /eval\(/gi,
    /alert\(/gi,
    /document\.cookie/gi,
    /window\\.location/gi,
    /.innerHTML/gi,
  ];

  // Known legitimate sources (can be configured)
  private readonly LEGITIMATE_SOURCES = [
    'self',
    'cdn.jsdelivr.net',
    'cdnjs.cloudflare.com',
    'fonts.googleapis.com',
    'fonts.gstatic.com',
  ];

  constructor() {
    this.logger.log('CSP Violation Service initialized');
  }

  /**
   * Process CSP violation report
   */
  async processViolation(
    report: CspViolationReport,
    userAgent: string,
    ipAddress: string,
    userId?: string,
    sessionId?: string,
  ): Promise<void> {
    // Create violation entry
    const entry: CspViolationEntry = {
      id: this.generateViolationId(),
      timestamp: new Date(),
      report,
      userAgent,
      ipAddress,
      userId,
      sessionId,
      severity: this.calculateSeverity(report),
      category: this.categorizeViolation(report),
      isAttack: this.detectAttack(report),
      isFalsePositive: this.detectFalsePositive(report),
    };

    // Store violation
    this.violations.push(entry);

    // Enforce size limit
    if (this.violations.length > this.MAX_VIOLATIONS) {
      this.violations.shift();
    }

    // Log violation
    this.logViolation(entry);

    // Send alert if suspicious
    if (entry.isAttack || entry.severity === 'critical' || entry.severity === 'high') {
      await this.sendSecurityAlert(entry);
    }
  }

  /**
   * Calculate violation severity
   */
  private calculateSeverity(report: CspViolationReport): CspViolationEntry['severity'] {
    const directive = report.violatedDirective || report.effectiveDirective;

    // Critical: script-src violations (XSS risk)
    if (directive.includes('script-src')) {
      // Check if it's an inline script or eval
      if (report.blockedUri === 'inline' || report.blockedUri === 'eval') {
        return 'critical';
      }
      return 'high';
    }

    // High: object-src, frame-src (clickjacking, plugin vulnerabilities)
    if (directive.includes('object-src') || directive.includes('frame-src')) {
      return 'high';
    }

    // Medium: style-src, connect-src (data exfiltration, CSS injection)
    if (directive.includes('style-src') || directive.includes('connect-src')) {
      return 'medium';
    }

    // Low: img-src, font-src, media-src (usually less critical)
    return 'low';
  }

  /**
   * Categorize violation
   */
  private categorizeViolation(report: CspViolationReport): CspViolationEntry['category'] {
    const directive = report.violatedDirective || report.effectiveDirective;

    if (directive.includes('script')) return 'script';
    if (directive.includes('style')) return 'style';
    if (directive.includes('img')) return 'image';
    if (directive.includes('font')) return 'font';
    if (directive.includes('frame')) return 'frame';
    if (directive.includes('connect')) return 'connect';
    if (directive.includes('media')) return 'media';
    if (directive.includes('object')) return 'object';

    return 'other';
  }

  /**
   * Detect if violation is likely an attack
   */
  private detectAttack(report: CspViolationReport): boolean {
    const blockedUri = report.blockedUri || '';
    const scriptSample = report.scriptSample || '';

    // 1. Check blocked URI for suspicious patterns
    for (const pattern of this.SUSPICIOUS_PATTERNS) {
      if (pattern.test(blockedUri) || pattern.test(scriptSample)) {
        return true;
      }
    }

    // 2. Inline scripts/eval are often XSS attempts
    if ((blockedUri === 'inline' || blockedUri === 'eval') &&
        report.violatedDirective?.includes('script-src')) {
      return true;
    }

    // 3. Data URIs with HTML (XSS vector)
    if (blockedUri.startsWith('data:text/html')) {
      return true;
    }

    // 4. Suspicious domains
    if (this.isSuspiciousDomain(blockedUri)) {
      return true;
    }

    return false;
  }

  /**
   * Detect if violation is likely a false positive
   */
  private detectFalsePositive(report: CspViolationReport): boolean {
    const blockedUri = report.blockedUri || '';

    // 1. Check against legitimate sources
    for (const source of this.LEGITIMATE_SOURCES) {
      if (blockedUri.includes(source)) {
        return true;
      }
    }

    // 2. Browser extensions (common false positives)
    if (blockedUri.startsWith('chrome-extension://') ||
        blockedUri.startsWith('moz-extension://') ||
        blockedUri.startsWith('safari-extension://')) {
      return true;
    }

    // 3. Empty or about:blank (often legitimate)
    if (!blockedUri || blockedUri === 'about:blank') {
      return true;
    }

    return false;
  }

  /**
   * Check if domain is suspicious
   */
  private isSuspiciousDomain(uri: string): boolean {
    try {
      const url = new URL(uri);
      const hostname = url.hostname;

      // Check for IP addresses
      if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\\.\d{1,3}$/.test(hostname)) {
        return true;
      }

      // Check for suspicious TLDs
      const suspiciousTlds = ['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz'];
      for (const tld of suspiciousTlds) {
        if (hostname.endsWith(tld)) {
          return true;
        }
      }

      return false;
    } catch {
      return false;
    }
  }

  /**
   * Send security alert for suspicious violation
   */
  private async sendSecurityAlert(entry: CspViolationEntry): Promise<void> {
    this.logger.warn(
      `SECURITY ALERT: CSP Violation - ${entry.category} - ${entry.severity}`,
      {
        violationId: entry.id,
        blockedUri: entry.report.blockedUri,
        directive: entry.report.violatedDirective,
        isAttack: entry.isAttack,
        userId: entry.userId,
        ipAddress: entry.ipAddress,
      },
    );

    // TODO: Integrate with security monitoring service
  }

  /**
   * Log violation
   */
  private logViolation(entry: CspViolationEntry): void {
    const message = `CSP Violation: ${entry.category} - ${entry.report.violatedDirective} - ${entry.report.blockedUri}`;

    if (entry.isAttack) {
      this.logger.error(`[ATTACK] ${message}`, { entry });
    } else if (entry.severity === 'critical' || entry.severity === 'high') {
      this.logger.warn(message, { entry });
    } else if (!entry.isFalsePositive) {
      this.logger.log(message);
    }
  }

  /**
   * Get violation statistics
   */
  getStatistics(from: Date, to: Date): CspViolationStats {
    const filtered = this.violations.filter(
      v => v.timestamp >= from && v.timestamp <= to,
    );

    const violationsByDirective: Record<string, number> = {};
    const violationsByCategory: Record<string, number> = {};
    const uriCounts: Record<string, number> = {};

    for (const violation of filtered) {
      const directive = violation.report.violatedDirective || violation.report.effectiveDirective;
      violationsByDirective[directive] = (violationsByDirective[directive] || 0) + 1;

      violationsByCategory[violation.category] = (violationsByCategory[violation.category] || 0) + 1;

      const uri = violation.report.blockedUri;
      if (uri) {
        uriCounts[uri] = (uriCounts[uri] || 0) + 1;
      }
    }

    const topBlockedUris = Object.entries(uriCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([uri, count]) => ({ uri, count }));

    return {
      totalViolations: filtered.length,
      violationsByDirective,
      violationsByCategory,
      topBlockedUris,
      suspiciousViolations: filtered.filter(v => v.isAttack).length,
      timeRange: { from, to },
    };
  }

  /**
   * Get recent violations
   */
  getRecentViolations(limit: number = 100): CspViolationEntry[] {
    return this.violations.slice(-limit);
  }

  /**
   * Get suspicious violations
   */
  getSuspiciousViolations(limit: number = 50): CspViolationEntry[] {
    return this.violations
      .filter(v => v.isAttack || v.severity === 'critical' || v.severity === 'high')
      .slice(-limit);
  }

  /**
   * Generate policy recommendations
   */
  generatePolicyRecommendations(): string[] {
    const recommendations: string[] = [];
    const stats = this.getStatistics(
      new Date(Date.now() - 86400000), // Last 24 hours
      new Date(),
    );

    // Analyze violations and suggest policy changes
    for (const [directive, count] of Object.entries(stats.violationsByDirective)) {
      if (count > 10) {
        recommendations.push(
          `Consider reviewing ${directive}: ${count} violations in last 24 hours`,
        );
      }
    }

    // Check for common false positives
    const falsePositives = this.violations.filter(v => v.isFalsePositive);
    if (falsePositives.length > 50) {
      recommendations.push(
        'High number of false positives detected. Consider adding trusted sources to CSP policy.',
      );
    }

    // Check for attacks
    if (stats.suspiciousViolations > 5) {
      recommendations.push(
        `${stats.suspiciousViolations} suspicious violations detected. Review security logs immediately.`,
      );
    }

    return recommendations;
  }

  /**
   * Generate violation ID
   */
  private generateViolationId(): string {
    return `csp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
