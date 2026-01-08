import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComplianceControl, ComplianceFramework, ControlStatus } from './entities/compliance-control.entity';
import { GDPRRequest, GDPRRequestStatus } from './entities/gdpr-request.entity';
import { SecurityIncident, IncidentSeverity, IncidentStatus } from './entities/security-incident.entity';
import { DataRetentionRule } from './entities/data-retention-rule.entity';
import { AuditLog } from './entities/audit-log.entity';

export interface ComplianceScore {
  framework: ComplianceFramework;
  overallScore: number;
  totalControls: number;
  compliantControls: number;
  nonCompliantControls: number;
  inProgressControls: number;
  criticalIssues: number;
  lastAssessmentDate: Date;
  nextReviewDate: Date;
  trend: 'improving' | 'declining' | 'stable';
}

export interface ComplianceDashboardData {
  overallStatus: {
    totalFrameworks: number;
    averageComplianceScore: number;
    criticalFindings: number;
    openIncidents: number;
    pendingGDPRRequests: number;
  };
  frameworkScores: ComplianceScore[];
  recentIncidents: SecurityIncident[];
  overdueControls: ComplianceControl[];
  upcomingReviews: ComplianceControl[];
  gdprActivity: {
    total: number;
    pending: number;
    overdue: number;
    completedThisMonth: number;
  };
  retentionActivity: {
    activeRules: number;
    recordsPendingAction: number;
    nextExecutionDate: Date;
  };
  auditActivity: {
    totalLogsToday: number;
    failedActionsToday: number;
    suspiciousActivities: number;
  };
}

export interface RiskAssessment {
  overallRisk: 'critical' | 'high' | 'medium' | 'low';
  riskScore: number;
  vulnerabilities: {
    control: ComplianceControl;
    impact: string;
    likelihood: string;
    mitigation: string;
  }[];
  recommendations: string[];
  assessmentDate: Date;
}

@Injectable()
export class ComplianceFrameworkService {
  private readonly logger = new Logger(ComplianceFrameworkService.name);

  constructor(
    @InjectRepository(ComplianceControl)
    private readonly complianceControlRepository: Repository<ComplianceControl>,
    @InjectRepository(GDPRRequest)
    private readonly gdprRequestRepository: Repository<GDPRRequest>,
    @InjectRepository(SecurityIncident)
    private readonly securityIncidentRepository: Repository<SecurityIncident>,
    @InjectRepository(DataRetentionRule)
    private readonly dataRetentionRuleRepository: Repository<DataRetentionRule>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  /**
   * Get comprehensive compliance dashboard data
   */
  async getComplianceDashboard(): Promise<ComplianceDashboardData> {
    this.logger.log('Generating compliance dashboard data');

    const [
      frameworkScores,
      recentIncidents,
      overdueControls,
      upcomingReviews,
      gdprStats,
      retentionStats,
      auditStats,
    ] = await Promise.all([
      this.getFrameworkScores(),
      this.getRecentIncidents(10),
      this.getOverdueControls(),
      this.getUpcomingReviews(30),
      this.getGDPRActivity(),
      this.getRetentionActivity(),
      this.getAuditActivity(),
    ]);

    const averageComplianceScore =
      frameworkScores.reduce((sum, score) => sum + score.overallScore, 0) / frameworkScores.length || 0;

    const criticalFindings = frameworkScores.reduce((sum, score) => sum + score.criticalIssues, 0);

    const openIncidents = await this.securityIncidentRepository.count({
      where: {
        status: IncidentStatus.INVESTIGATING,
      },
    });

    return {
      overallStatus: {
        totalFrameworks: frameworkScores.length,
        averageComplianceScore: Math.round(averageComplianceScore),
        criticalFindings,
        openIncidents,
        pendingGDPRRequests: gdprStats.pending,
      },
      frameworkScores,
      recentIncidents,
      overdueControls,
      upcomingReviews,
      gdprActivity: gdprStats,
      retentionActivity: retentionStats,
      auditActivity: auditStats,
    };
  }

  /**
   * Calculate compliance scores for all frameworks
   */
  async getFrameworkScores(): Promise<ComplianceScore[]> {
    const frameworks = Object.values(ComplianceFramework);
    const scores: ComplianceScore[] = [];

    for (const framework of frameworks) {
      const controls = await this.complianceControlRepository.find({
        where: { framework },
      });

      if (controls.length === 0) {
        continue;
      }

      const totalControls = controls.length;
      const compliantControls = controls.filter(c => c.status === ControlStatus.COMPLIANT).length;
      const nonCompliantControls = controls.filter(c => c.status === ControlStatus.NON_COMPLIANT).length;
      const inProgressControls = controls.filter(c => c.status === ControlStatus.IN_PROGRESS).length;
      const criticalIssues = controls.filter(
        c => c.status === ControlStatus.NON_COMPLIANT && c.severity === 'critical'
      ).length;

      const overallScore = Math.round((compliantControls / totalControls) * 100);

      const reviewDates = controls
        .map(c => c.lastReviewedAt)
        .filter(Boolean)
        .sort((a, b) => b.getTime() - a.getTime());
      const lastAssessmentDate = reviewDates[0] || new Date();

      const nextReviews = controls
        .map(c => c.nextReviewDate)
        .filter(Boolean)
        .sort((a, b) => a.getTime() - b.getTime());
      const nextReviewDate = nextReviews[0] || new Date();

      scores.push({
        framework,
        overallScore,
        totalControls,
        compliantControls,
        nonCompliantControls,
        inProgressControls,
        criticalIssues,
        lastAssessmentDate,
        nextReviewDate,
        trend: 'stable', // TODO: Calculate trend from historical data
      });
    }

    return scores;
  }

  /**
   * Get recent security incidents
   */
  async getRecentIncidents(limit: number = 10): Promise<SecurityIncident[]> {
    return this.securityIncidentRepository.find({
      order: { detectedAt: 'DESC' },
      take: limit,
      relations: ['reporter', 'assignee'],
    });
  }

  /**
   * Get overdue controls that need review
   */
  async getOverdueControls(): Promise<ComplianceControl[]> {
    const now = new Date();
    return this.complianceControlRepository
      .createQueryBuilder('control')
      .where('control.nextReviewDate < :now', { now })
      .andWhere('control.status != :status', { status: ControlStatus.COMPLIANT })
      .orderBy('control.nextReviewDate', 'ASC')
      .getMany();
  }

  /**
   * Get upcoming control reviews
   */
  async getUpcomingReviews(daysAhead: number = 30): Promise<ComplianceControl[]> {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return this.complianceControlRepository
      .createQueryBuilder('control')
      .where('control.nextReviewDate >= :now', { now })
      .andWhere('control.nextReviewDate <= :futureDate', { futureDate })
      .orderBy('control.nextReviewDate', 'ASC')
      .getMany();
  }

  /**
   * Get GDPR request activity statistics
   */
  async getGDPRActivity() {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [total, pending, completed] = await Promise.all([
      this.gdprRequestRepository.count(),
      this.gdprRequestRepository.count({
        where: [
          { status: GDPRRequestStatus.RECEIVED },
          { status: GDPRRequestStatus.VERIFIED },
          { status: GDPRRequestStatus.IN_PROGRESS },
        ],
      }),
      this.gdprRequestRepository.count({
        where: {
          status: GDPRRequestStatus.COMPLETED,
          completedAt: this.gdprRequestRepository
            .createQueryBuilder()
            .where('completed_at >= :start', { start: firstDayOfMonth })
            .andWhere('completed_at <= :end', { end: lastDayOfMonth })
            .getQuery() as any,
        },
      }),
    ]);

    // Get overdue requests (past due date and not completed)
    const overdue = await this.gdprRequestRepository
      .createQueryBuilder('request')
      .where('request.dueDate < :now', { now })
      .andWhere('request.status NOT IN (:...statuses)', {
        statuses: [GDPRRequestStatus.COMPLETED, GDPRRequestStatus.REJECTED, GDPRRequestStatus.CANCELLED],
      })
      .getCount();

    return {
      total,
      pending,
      overdue,
      completedThisMonth: completed,
    };
  }

  /**
   * Get data retention activity statistics
   */
  async getRetentionActivity() {
    const activeRules = await this.dataRetentionRuleRepository.count({
      where: { status: 'active' },
    });

    // Get next execution date from active rules
    const nextExecution = await this.dataRetentionRuleRepository.findOne({
      where: { status: 'active' },
      order: { nextExecutionDate: 'ASC' },
    });

    return {
      activeRules,
      recordsPendingAction: 0, // TODO: Calculate from retention records
      nextExecutionDate: nextExecution?.nextExecutionDate || new Date(),
    };
  }

  /**
   * Get audit log activity for today
   */
  async getAuditActivity() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [totalLogsToday, failedActionsToday] = await Promise.all([
      this.auditLogRepository
        .createQueryBuilder('log')
        .where('log.timestamp >= :today', { today })
        .andWhere('log.timestamp < :tomorrow', { tomorrow })
        .getCount(),
      this.auditLogRepository
        .createQueryBuilder('log')
        .where('log.timestamp >= :today', { today })
        .andWhere('log.timestamp < :tomorrow', { tomorrow })
        .andWhere('log.result = :result', { result: 'failure' })
        .getCount(),
    ]);

    // Detect suspicious activities (multiple failed logins, unusual access patterns)
    const suspiciousActivities = await this.auditLogRepository
      .createQueryBuilder('log')
      .where('log.timestamp >= :today', { today })
      .andWhere('log.action = :action', { action: 'login' })
      .andWhere('log.result = :result', { result: 'failure' })
      .groupBy('log.userId')
      .having('COUNT(*) > 3')
      .getCount();

    return {
      totalLogsToday,
      failedActionsToday,
      suspiciousActivities,
    };
  }

  /**
   * Perform comprehensive risk assessment
   */
  async performRiskAssessment(): Promise<RiskAssessment> {
    this.logger.log('Performing comprehensive risk assessment');

    const nonCompliantControls = await this.complianceControlRepository.find({
      where: { status: ControlStatus.NON_COMPLIANT },
      order: { severity: 'DESC' },
    });

    const vulnerabilities = nonCompliantControls.map(control => ({
      control,
      impact: this.calculateImpact(control),
      likelihood: this.calculateLikelihood(control),
      mitigation: this.generateMitigationPlan(control),
    }));

    const riskScore = this.calculateOverallRiskScore(vulnerabilities);
    const overallRisk = this.determineRiskLevel(riskScore);

    const recommendations = await this.generateRecommendations(vulnerabilities);

    return {
      overallRisk,
      riskScore,
      vulnerabilities,
      recommendations,
      assessmentDate: new Date(),
    };
  }

  private calculateImpact(control: ComplianceControl): string {
    const severityMap = {
      critical: 'Very High',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
    };
    return severityMap[control.severity] || 'Unknown';
  }

  private calculateLikelihood(control: ComplianceControl): string {
    // Simple heuristic based on time since last review
    const daysSinceReview = control.lastReviewedAt
      ? (Date.now() - control.lastReviewedAt.getTime()) / (1000 * 60 * 60 * 24)
      : 999;

    if (daysSinceReview > 180) return 'High';
    if (daysSinceReview > 90) return 'Medium';
    return 'Low';
  }

  private generateMitigationPlan(control: ComplianceControl): string {
    return `Implement ${control.name} according to ${control.framework} requirements. ${control.implementationDetails || 'Review control requirements and develop implementation plan.'}`;
  }

  private calculateOverallRiskScore(vulnerabilities: any[]): number {
    if (vulnerabilities.length === 0) return 0;

    const severityScores = {
      critical: 100,
      high: 75,
      medium: 50,
      low: 25,
    };

    const totalScore = vulnerabilities.reduce((sum, vuln) => {
      const score = severityScores[vuln.control.severity] || 0;
      return sum + score;
    }, 0);

    return Math.min(100, Math.round(totalScore / vulnerabilities.length));
  }

  private determineRiskLevel(score: number): 'critical' | 'high' | 'medium' | 'low' {
    if (score >= 90) return 'critical';
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }

  private async generateRecommendations(vulnerabilities: any[]): Promise<string[]> {
    const recommendations: string[] = [];

    if (vulnerabilities.length === 0) {
      recommendations.push('Maintain current compliance posture through regular reviews and monitoring.');
      return recommendations;
    }

    const criticalVulns = vulnerabilities.filter(v => v.control.severity === 'critical');
    if (criticalVulns.length > 0) {
      recommendations.push(
        `URGENT: Address ${criticalVulns.length} critical compliance control(s) immediately to reduce risk exposure.`
      );
    }

    const highVulns = vulnerabilities.filter(v => v.control.severity === 'high');
    if (highVulns.length > 0) {
      recommendations.push(
        `Prioritize remediation of ${highVulns.length} high-severity control(s) within the next 30 days.`
      );
    }

    recommendations.push(
      'Implement automated monitoring for all critical controls to enable real-time compliance tracking.'
    );

    recommendations.push('Schedule quarterly compliance assessments to maintain ongoing visibility.');

    recommendations.push(
      'Enhance staff training on compliance requirements relevant to their roles and responsibilities.'
    );

    return recommendations;
  }

  /**
   * Initialize default compliance controls for a framework
   */
  async initializeFrameworkControls(framework: ComplianceFramework): Promise<number> {
    this.logger.log(`Initializing controls for framework: ${framework}`);

    const defaultControls = this.getDefaultControlsForFramework(framework);
    let created = 0;

    for (const controlData of defaultControls) {
      const exists = await this.complianceControlRepository.findOne({
        where: { framework, controlId: controlData.controlId },
      });

      if (!exists) {
        await this.complianceControlRepository.save(
          this.complianceControlRepository.create(controlData)
        );
        created++;
      }
    }

    this.logger.log(`Initialized ${created} new controls for ${framework}`);
    return created;
  }

  private getDefaultControlsForFramework(framework: ComplianceFramework): Partial<ComplianceControl>[] {
    // This would typically be loaded from a configuration file or database
    // Here's a sample for SOC2
    if (framework === ComplianceFramework.SOC2) {
      return [
        {
          framework: ComplianceFramework.SOC2,
          controlId: 'CC6.1',
          name: 'Logical and Physical Access Controls',
          description: 'The entity implements logical access security software, infrastructure, and architectures over protected information assets to protect them from security events.',
          category: 'Common Criteria',
          status: ControlStatus.NEEDS_REVIEW,
          severity: 'critical',
          isMandatory: true,
          reviewFrequencyDays: 90,
        },
        {
          framework: ComplianceFramework.SOC2,
          controlId: 'CC6.6',
          name: 'Logical and Physical Access - Encryption',
          description: 'The entity implements logical access security measures to protect against threats from sources outside its system boundaries.',
          category: 'Common Criteria',
          status: ControlStatus.NEEDS_REVIEW,
          severity: 'high',
          isMandatory: true,
          reviewFrequencyDays: 90,
        },
        {
          framework: ComplianceFramework.SOC2,
          controlId: 'CC7.2',
          name: 'System Monitoring',
          description: 'The entity monitors system components and the operation of those components for anomalies that are indicative of malicious acts, natural disasters, and errors.',
          category: 'Common Criteria',
          status: ControlStatus.NEEDS_REVIEW,
          severity: 'high',
          isMandatory: true,
          reviewFrequencyDays: 90,
        },
      ];
    }

    return [];
  }
}
