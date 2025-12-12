import { Injectable, Logger } from '@nestjs/common';
import { MLEngineService } from '../ml-engine/ml-engine.service';

export interface RiskAssessmentDto {
  caseId: string;
  overallRiskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskCategories: {
    financial: RiskCategoryDetail;
    timeline: RiskCategoryDetail;
    legal: RiskCategoryDetail;
    reputation: RiskCategoryDetail;
  };
  topRisks: RiskItem[];
  mitigationStrategies: MitigationStrategy[];
  confidenceScore: number;
  assessedAt: Date;
}

export interface RiskCategoryDetail {
  score: number; // 0-100
  level: 'low' | 'medium' | 'high' | 'critical';
  factors: RiskFactor[];
}

export interface RiskFactor {
  name: string;
  description: string;
  severity: number; // 0-100
  likelihood: number; // 0-100
  impact: string;
}

export interface RiskItem {
  category: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  likelihood: number; // 0-100
  impact: string;
  mitigationActions: string[];
}

export interface MitigationStrategy {
  risk: string;
  strategy: string;
  priority: 'low' | 'medium' | 'high';
  estimatedCost: number;
  estimatedTimeReduction: number;
  effectiveness: number; // 0-100
}

/**
 * Risk Assessment Service
 * Evaluates and scores various risk factors for legal cases
 */
@Injectable()
export class RiskAssessmentService {
  private readonly logger = new Logger(RiskAssessmentService.name);

  constructor(private readonly mlEngine: MLEngineService) {}

  /**
   * Perform comprehensive risk assessment for a case
   */
  async assessCaseRisk(caseId: string, caseData?: any): Promise<RiskAssessmentDto> {
    this.logger.log(`Performing risk assessment for case ${caseId}`);

    // Mock case data if not provided
    const data = caseData || this.getMockCaseData(caseId);

    // Calculate risk for each category
    const financial = this.assessFinancialRisk(data);
    const timeline = this.assessTimelineRisk(data);
    const legal = this.assessLegalRisk(data);
    const reputation = this.assessReputationRisk(data);

    // Calculate overall risk score
    const categoryScores = [financial.score, timeline.score, legal.score, reputation.score];
    const categoryWeights = [0.35, 0.25, 0.25, 0.15]; // Financial weighted higher

    const overallRiskScore = Math.round(
      this.mlEngine.weightedAverage(categoryScores, categoryWeights),
    );

    const riskLevel = this.getRiskLevel(overallRiskScore);

    // Compile top risks from all categories
    const topRisks = this.compileTopRisks(financial, timeline, legal, reputation);

    // Generate mitigation strategies
    const mitigationStrategies = this.generateMitigationStrategies(topRisks);

    // Calculate confidence based on data completeness
    const confidenceScore = this.calculateConfidence(data);

    return {
      caseId,
      overallRiskScore,
      riskLevel,
      riskCategories: {
        financial,
        timeline,
        legal,
        reputation,
      },
      topRisks,
      mitigationStrategies,
      confidenceScore,
      assessedAt: new Date(),
    };
  }

  /**
   * Assess financial risk factors
   */
  private assessFinancialRisk(caseData: any): RiskCategoryDetail {
    const factors: RiskFactor[] = [];

    // Budget overrun risk
    const budgetUsed = caseData.billedAmount || 0;
    const budgetLimit = caseData.budgetLimit || 1000000;
    const budgetUtilization = (budgetUsed / budgetLimit) * 100;

    if (budgetUtilization > 80) {
      factors.push({
        name: 'Budget Overrun',
        description: `${Math.round(budgetUtilization)}% of budget utilized`,
        severity: Math.min((budgetUtilization - 80) * 5, 100),
        likelihood: 85,
        impact: 'high',
      });
    }

    // Collection risk
    const collectionRate = caseData.collectionRate || 90;
    if (collectionRate < 85) {
      factors.push({
        name: 'Collection Risk',
        description: `${collectionRate}% collection rate`,
        severity: (100 - collectionRate) * 2,
        likelihood: 70,
        impact: 'medium',
      });
    }

    // Cost escalation
    const avgHourlyRate = caseData.avgHourlyRate || 350;
    const hoursPerWeek = caseData.hoursPerWeek || 20;
    const weeksRemaining = caseData.estimatedWeeksRemaining || 12;
    const projectedCost = avgHourlyRate * hoursPerWeek * weeksRemaining;

    if (projectedCost > budgetLimit * 0.5) {
      factors.push({
        name: 'Cost Escalation',
        description: `Projected additional cost: $${projectedCost.toLocaleString()}`,
        severity: 60,
        likelihood: 55,
        impact: 'high',
      });
    }

    // Calculate category score
    const score = factors.length > 0
      ? Math.round(factors.reduce((sum, f) => sum + (f.severity * f.likelihood) / 100, 0) / factors.length)
      : 20; // Low baseline risk

    return {
      score,
      level: this.getRiskLevel(score),
      factors,
    };
  }

  /**
   * Assess timeline risk factors
   */
  private assessTimelineRisk(caseData: any): RiskCategoryDetail {
    const factors: RiskFactor[] = [];

    // Deadline pressure
    const daysUntilTrial = caseData.daysUntilTrial || 90;
    if (daysUntilTrial < 60) {
      factors.push({
        name: 'Trial Deadline Pressure',
        description: `${daysUntilTrial} days until trial`,
        severity: Math.min((60 - daysUntilTrial) * 3, 100),
        likelihood: 90,
        impact: 'high',
      });
    }

    // Discovery delays
    const discoveryCompletion = caseData.discoveryCompletion || 0.7;
    if (discoveryCompletion < 0.8 && daysUntilTrial < 90) {
      factors.push({
        name: 'Discovery Delays',
        description: `${Math.round(discoveryCompletion * 100)}% complete`,
        severity: (1 - discoveryCompletion) * 80,
        likelihood: 65,
        impact: 'medium',
      });
    }

    // Pending motions
    const pendingMotions = caseData.pendingMotions || 0;
    if (pendingMotions > 2) {
      factors.push({
        name: 'Motion Practice Delays',
        description: `${pendingMotions} pending motions`,
        severity: Math.min(pendingMotions * 15, 100),
        likelihood: 70,
        impact: 'medium',
      });
    }

    const score = factors.length > 0
      ? Math.round(factors.reduce((sum, f) => sum + (f.severity * f.likelihood) / 100, 0) / factors.length)
      : 25;

    return {
      score,
      level: this.getRiskLevel(score),
      factors,
    };
  }

  /**
   * Assess legal risk factors
   */
  private assessLegalRisk(caseData: any): RiskCategoryDetail {
    const factors: RiskFactor[] = [];

    // Adverse precedent
    const adversePrecedent = caseData.adversePrecedentCount || 0;
    if (adversePrecedent > 2) {
      factors.push({
        name: 'Adverse Precedent',
        description: `${adversePrecedent} unfavorable precedents identified`,
        severity: Math.min(adversePrecedent * 20, 100),
        likelihood: 75,
        impact: 'high',
      });
    }

    // Evidentiary issues
    const evidentiaryStrength = caseData.evidentiaryStrength || 0.7;
    if (evidentiaryStrength < 0.6) {
      factors.push({
        name: 'Evidentiary Weakness',
        description: `${Math.round(evidentiaryStrength * 100)}% evidence strength`,
        severity: (1 - evidentiaryStrength) * 100,
        likelihood: 80,
        impact: 'high',
      });
    }

    // Witness reliability
    const witnessReliability = caseData.witnessReliability || 0.8;
    if (witnessReliability < 0.7) {
      factors.push({
        name: 'Witness Reliability',
        description: 'Key witnesses have credibility concerns',
        severity: (1 - witnessReliability) * 80,
        likelihood: 60,
        impact: 'medium',
      });
    }

    // Procedural compliance
    const complianceIssues = caseData.complianceIssues || 0;
    if (complianceIssues > 0) {
      factors.push({
        name: 'Procedural Compliance',
        description: `${complianceIssues} compliance issues identified`,
        severity: Math.min(complianceIssues * 25, 100),
        likelihood: 85,
        impact: 'medium',
      });
    }

    const score = factors.length > 0
      ? Math.round(factors.reduce((sum, f) => sum + (f.severity * f.likelihood) / 100, 0) / factors.length)
      : 30;

    return {
      score,
      level: this.getRiskLevel(score),
      factors,
    };
  }

  /**
   * Assess reputation risk factors
   */
  private assessReputationRisk(caseData: any): RiskCategoryDetail {
    const factors: RiskFactor[] = [];

    // Media attention
    const mediaAttention = caseData.mediaAttention || 'low';
    if (mediaAttention === 'high' || mediaAttention === 'moderate') {
      factors.push({
        name: 'Media Exposure',
        description: `${mediaAttention} level of media attention`,
        severity: mediaAttention === 'high' ? 80 : 50,
        likelihood: 70,
        impact: 'high',
      });
    }

    // Client satisfaction
    const clientSatisfaction = caseData.clientSatisfaction || 0.8;
    if (clientSatisfaction < 0.6) {
      factors.push({
        name: 'Client Relationship',
        description: `${Math.round(clientSatisfaction * 100)}% satisfaction score`,
        severity: (1 - clientSatisfaction) * 100,
        likelihood: 75,
        impact: 'medium',
      });
    }

    // Public interest
    const publicInterest = caseData.publicInterest || false;
    if (publicInterest) {
      factors.push({
        name: 'Public Interest Case',
        description: 'High visibility in legal community',
        severity: 60,
        likelihood: 80,
        impact: 'medium',
      });
    }

    const score = factors.length > 0
      ? Math.round(factors.reduce((sum, f) => sum + (f.severity * f.likelihood) / 100, 0) / factors.length)
      : 15;

    return {
      score,
      level: this.getRiskLevel(score),
      factors,
    };
  }

  /**
   * Compile top risks across all categories
   */
  private compileTopRisks(...categories: RiskCategoryDetail[]): RiskItem[] {
    const allRisks: RiskItem[] = [];

    categories.forEach((category, index) => {
      const categoryName = ['financial', 'timeline', 'legal', 'reputation'][index];
      category.factors.forEach(factor => {
        allRisks.push({
          category: categoryName,
          description: factor.description,
          severity: this.getRiskLevel((factor.severity * factor.likelihood) / 100),
          likelihood: factor.likelihood,
          impact: factor.impact,
          mitigationActions: this.getMitigationActions(factor.name),
        });
      });
    });

    // Sort by combined severity and likelihood, take top 5
    allRisks.sort((a, b) => {
      const scoreA = this.getRiskScore(a.severity) * a.likelihood;
      const scoreB = this.getRiskScore(b.severity) * b.likelihood;
      return scoreB - scoreA;
    });

    return allRisks.slice(0, 5);
  }

  /**
   * Generate mitigation strategies for identified risks
   */
  private generateMitigationStrategies(risks: RiskItem[]): MitigationStrategy[] {
    return risks.map(risk => {
      const strategies = this.getMitigationStrategyForRisk(risk);
      return strategies;
    }).filter(s => s !== null) as MitigationStrategy[];
  }

  /**
   * Get mitigation strategy for specific risk
   */
  private getMitigationStrategyForRisk(risk: RiskItem): MitigationStrategy | null {
    const strategyMap: Record<string, Partial<MitigationStrategy>> = {
      financial: {
        strategy: 'Implement cost controls and budget monitoring',
        estimatedCost: 5000,
        estimatedTimeReduction: 0,
        effectiveness: 75,
      },
      timeline: {
        strategy: 'Expedite critical path activities and streamline processes',
        estimatedCost: 10000,
        estimatedTimeReduction: 15,
        effectiveness: 70,
      },
      legal: {
        strategy: 'Engage expert witnesses and strengthen legal research',
        estimatedCost: 25000,
        estimatedTimeReduction: 0,
        effectiveness: 80,
      },
      reputation: {
        strategy: 'Develop communication plan and stakeholder management',
        estimatedCost: 8000,
        estimatedTimeReduction: 0,
        effectiveness: 65,
      },
    };

    const baseStrategy = strategyMap[risk.category];
    if (!baseStrategy) return null;

    return {
      risk: risk.description,
      priority: risk.severity === 'critical' || risk.severity === 'high' ? 'high' : 'medium',
      ...baseStrategy,
    } as MitigationStrategy;
  }

  /**
   * Get mitigation actions for a specific risk factor
   */
  private getMitigationActions(riskName: string): string[] {
    const actionMap: Record<string, string[]> = {
      'Budget Overrun': [
        'Review and adjust resource allocation',
        'Negotiate fee arrangements with client',
        'Implement time tracking controls',
      ],
      'Collection Risk': [
        'Implement advance billing',
        'Review payment terms with client',
        'Consider trust account requirements',
      ],
      'Trial Deadline Pressure': [
        'Expedite discovery completion',
        'Consider motion for extension',
        'Increase team resources',
      ],
      'Discovery Delays': [
        'Set aggressive internal deadlines',
        'Increase discovery team staffing',
        'Consider limited discovery agreements',
      ],
      'Adverse Precedent': [
        'Develop distinguishing arguments',
        'Research alternative legal theories',
        'Engage appellate counsel for strategy',
      ],
      'Evidentiary Weakness': [
        'Conduct additional fact investigation',
        'Engage expert witnesses',
        'Strengthen documentary evidence',
      ],
    };

    return actionMap[riskName] || ['Monitor situation closely', 'Develop contingency plan'];
  }

  /**
   * Calculate confidence score based on data completeness
   */
  private calculateConfidence(caseData: any): number {
    const requiredFields = [
      'billedAmount',
      'budgetLimit',
      'daysUntilTrial',
      'discoveryCompletion',
      'evidentiaryStrength',
    ];

    const availableFields = requiredFields.filter(field => caseData[field] !== undefined);
    return Math.round((availableFields.length / requiredFields.length) * 100);
  }

  /**
   * Convert risk score to risk level
   */
  private getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score < 25) return 'low';
    if (score < 50) return 'medium';
    if (score < 75) return 'high';
    return 'critical';
  }

  /**
   * Convert risk level to numeric score
   */
  private getRiskScore(level: string): number {
    const scoreMap = { low: 25, medium: 50, high: 75, critical: 100 };
    return scoreMap[level as keyof typeof scoreMap] || 50;
  }

  /**
   * Get mock case data for testing
   */
  private getMockCaseData(caseId: string): any {
    return {
      caseId,
      billedAmount: 450000,
      budgetLimit: 500000,
      collectionRate: 88,
      avgHourlyRate: 375,
      hoursPerWeek: 25,
      estimatedWeeksRemaining: 8,
      daysUntilTrial: 45,
      discoveryCompletion: 0.75,
      pendingMotions: 3,
      adversePrecedentCount: 1,
      evidentiaryStrength: 0.65,
      witnessReliability: 0.75,
      complianceIssues: 0,
      mediaAttention: 'moderate',
      clientSatisfaction: 0.85,
      publicInterest: false,
    };
  }
}
