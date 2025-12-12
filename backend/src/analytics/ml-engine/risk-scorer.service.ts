import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

/**
 * Risk Scorer Service
 * Calculates comprehensive risk scores for legal cases
 * Algorithm: Weighted Risk Scoring + Monte Carlo Simulation
 */
@Injectable()
export class RiskScorerService {
  private readonly logger = new Logger(RiskScorerService.name);

  constructor(
    @InjectRepository('Case') private caseRepo: Repository<any>,
    @InjectRepository('TimeEntry') private timeEntryRepo: Repository<any>,
    @InjectRepository('Motion') private motionRepo: Repository<any>,
  ) {}

  /**
   * Calculate comprehensive risk score for a case
   */
  async calculateRiskScore(caseId: string): Promise<{
    overallRiskScore: number; // 0-100, higher = more risk
    riskLevel: 'critical' | 'high' | 'medium' | 'low';
    riskCategories: {
      litigationRisk: { score: number; level: string; factors: string[] };
      financialRisk: { score: number; level: string; factors: string[] };
      reputationalRisk: { score: number; level: string; factors: string[] };
      timelineRisk: { score: number; level: string; factors: string[] };
      complianceRisk: { score: number; level: string; factors: string[] };
    };
    probabilisticOutcomes: {
      bestCase: { probability: number; description: string };
      worstCase: { probability: number; description: string };
      expectedCase: { probability: number; description: string };
    };
    mitigationStrategies: Array<{
      risk: string;
      strategy: string;
      priority: 'high' | 'medium' | 'low';
      estimatedImpact: number; // risk reduction in points
    }>;
    monteCarloSimulation: {
      iterations: number;
      expectedValue: number;
      confidenceInterval95: { lower: number; upper: number };
      riskOfLoss: number; // probability
    };
  }> {
    try {
      this.logger.log(`Calculating risk score for case ${caseId}`);

      // Extract risk features
      const features = await this.extractRiskFeatures(caseId);

      // Calculate individual risk categories
      const litigationRisk = this.calculateLitigationRisk(features);
      const financialRisk = this.calculateFinancialRisk(features);
      const reputationalRisk = this.calculateReputationalRisk(features);
      const timelineRisk = this.calculateTimelineRisk(features);
      const complianceRisk = this.calculateComplianceRisk(features);

      // Calculate overall risk score (weighted average)
      const weights = {
        litigation: 0.35,
        financial: 0.30,
        reputational: 0.15,
        timeline: 0.12,
        compliance: 0.08,
      };

      const overallRiskScore =
        litigationRisk.score * weights.litigation +
        financialRisk.score * weights.financial +
        reputationalRisk.score * weights.reputational +
        timelineRisk.score * weights.timeline +
        complianceRisk.score * weights.compliance;

      // Classify overall risk level
      const riskLevel = this.classifyRiskLevel(overallRiskScore);

      // Perform Monte Carlo simulation
      const monteCarloSimulation = this.runMonteCarloSimulation(features, 10000);

      // Generate probabilistic outcomes
      const probabilisticOutcomes = this.generateProbabilisticOutcomes(
        features,
        monteCarloSimulation,
      );

      // Generate mitigation strategies
      const mitigationStrategies = this.generateMitigationStrategies({
        litigationRisk,
        financialRisk,
        reputationalRisk,
        timelineRisk,
        complianceRisk,
      });

      return {
        overallRiskScore: Math.round(overallRiskScore * 10) / 10,
        riskLevel,
        riskCategories: {
          litigationRisk,
          financialRisk,
          reputationalRisk,
          timelineRisk,
          complianceRisk,
        },
        probabilisticOutcomes,
        mitigationStrategies,
        monteCarloSimulation,
      };
    } catch (error) {
      this.logger.error(`Error calculating risk score: ${error.message}`);
      throw error;
    }
  }

  /**
   * Extract features for risk assessment
   */
  private async extractRiskFeatures(caseId: string): Promise<any> {
    const caseData = await this.caseRepo
      .createQueryBuilder('case')
      .leftJoinAndSelect('case.attorney', 'attorney')
      .leftJoinAndSelect('case.judge', 'judge')
      .leftJoinAndSelect('case.client', 'client')
      .where('case.id = :caseId', { caseId })
      .getOne();

    if (!caseData) {
      throw new Error(`Case ${caseId} not found`);
    }

    // Get financial data
    const timeEntries = await this.timeEntryRepo
      .createQueryBuilder('entry')
      .where('entry.caseId = :caseId', { caseId })
      .getMany();

    const totalCost = timeEntries.reduce((sum, e) => sum + e.amount, 0);
    const budget = caseData.budget || totalCost * 1.5;

    // Get motion data
    const motions = await this.motionRepo
      .createQueryBuilder('motion')
      .where('motion.caseId = :caseId', { caseId })
      .getMany();

    const motionSuccessRate = motions.length > 0
      ? motions.filter((m) => m.status === 'granted').length / motions.length
      : 0.5;

    const caseAge = this.calculateDaysBetween(caseData.filedDate, new Date());

    return {
      // Case characteristics
      caseType: caseData.caseType,
      practiceArea: caseData.practiceArea,
      complexity: caseData.complexity || 'medium',
      caseAge,
      claimAmount: caseData.claimAmount || 0,

      // Legal factors
      judgeRulingHistory: caseData.judge?.rulingPattern || 'neutral',
      jurisdictionRisk: this.assessJurisdictionRisk(caseData.jurisdiction),
      legalTheoryStrength: caseData.legalTheoryStrength || 0.6,
      precedentSupport: caseData.precedentSupport || 0.6,

      // Evidence and discovery
      evidenceQuality: caseData.evidenceQuality || 0.6,
      discoveryProgress: caseData.discoveryProgress || 0,
      witnessReliability: caseData.witnessReliability || 0.7,
      documentCompleteness: caseData.documentCompleteness || 0.7,

      // Financial factors
      totalCost,
      budget,
      budgetUtilization: totalCost / budget,
      costOverrunRisk: totalCost > budget * 0.8 ? 0.7 : 0.3,
      clientPaymentHistory: caseData.client?.paymentScore || 0.8,

      // Opposition factors
      opposingCounselQuality: 0.7, // Would assess from data
      opposingPartyResources: caseData.opposingPartyResources || 'medium',
      settlementWillingness: 0.5,

      // Timeline factors
      daysToTrial: this.calculateDaysToTrial(caseData),
      deadlineCompliance: caseData.deadlineCompliance || 0.9,
      motionSuccessRate,

      // Reputation factors
      clientImportance: caseData.client?.importance || 'standard',
      publicVisibility: caseData.publicVisibility || 'low',
      mediaInterest: caseData.mediaInterest || false,

      // Compliance factors
      ethicsCompliance: 0.95, // Would assess from data
      conflictCheck: caseData.conflictCheckPassed || true,
      regulatoryCompliance: 0.9,
    };
  }

  /**
   * Calculate litigation risk
   */
  private calculateLitigationRisk(features: any): {
    score: number;
    level: string;
    factors: string[];
  } {
    let score = 0;
    const factors = [];

    // Legal theory strength (inverse - weak theory = high risk)
    const theoryRisk = (1 - features.legalTheoryStrength) * 25;
    score += theoryRisk;
    if (theoryRisk > 15) {
      factors.push('Weak legal theory increases litigation risk');
    }

    // Evidence quality (inverse)
    const evidenceRisk = (1 - features.evidenceQuality) * 20;
    score += evidenceRisk;
    if (evidenceRisk > 12) {
      factors.push('Evidence quality concerns');
    }

    // Judge rulings
    if (features.judgeRulingHistory === 'unfavorable') {
      score += 15;
      factors.push('Unfavorable judge ruling history');
    }

    // Motion success rate (inverse)
    const motionRisk = (1 - features.motionSuccessRate) * 15;
    score += motionRisk;
    if (motionRisk > 10) {
      factors.push('Low motion success rate');
    }

    // Opposing counsel quality
    score += features.opposingCounselQuality * 10;
    if (features.opposingCounselQuality > 0.7) {
      factors.push('Strong opposing counsel');
    }

    // Precedent support (inverse)
    score += (1 - features.precedentSupport) * 15;
    if (features.precedentSupport < 0.5) {
      factors.push('Limited precedent support');
    }

    const level = this.classifyRiskLevel(score);

    return {
      score: Math.round(score * 10) / 10,
      level,
      factors,
    };
  }

  /**
   * Calculate financial risk
   */
  private calculateFinancialRisk(features: any): {
    score: number;
    level: string;
    factors: string[];
  } {
    let score = 0;
    const factors = [];

    // Budget overrun risk
    score += features.costOverrunRisk * 30;
    if (features.budgetUtilization > 0.8) {
      factors.push(`Budget ${(features.budgetUtilization * 100).toFixed(0)}% utilized`);
    }

    // Client payment history (inverse - poor payment = high risk)
    const paymentRisk = (1 - features.clientPaymentHistory) * 25;
    score += paymentRisk;
    if (paymentRisk > 15) {
      factors.push('Client payment concerns');
    }

    // Claim amount relative to cost
    const costToClaimRatio = features.totalCost / Math.max(1, features.claimAmount);
    if (costToClaimRatio > 0.5) {
      score += 20;
      factors.push('High costs relative to claim amount');
    } else if (costToClaimRatio > 0.3) {
      score += 10;
    }

    // Opposing party resources
    if (features.opposingPartyResources === 'high') {
      score += 15;
      factors.push('Well-resourced opposing party');
    } else if (features.opposingPartyResources === 'low') {
      score += 5; // Even if we win, collection may be issue
      factors.push('Collection risk due to opposing party resources');
    }

    const level = this.classifyRiskLevel(score);

    return {
      score: Math.round(score * 10) / 10,
      level,
      factors,
    };
  }

  /**
   * Calculate reputational risk
   */
  private calculateReputationalRisk(features: any): {
    score: number;
    level: string;
    factors: string[];
  } {
    let score = 0;
    const factors = [];

    // Client importance
    if (features.clientImportance === 'key') {
      score += 25;
      factors.push('Key client - high reputational stakes');
    } else if (features.clientImportance === 'strategic') {
      score += 15;
      factors.push('Strategic client relationship');
    }

    // Public visibility
    if (features.publicVisibility === 'high') {
      score += 30;
      factors.push('High public visibility case');
    } else if (features.publicVisibility === 'medium') {
      score += 15;
    }

    // Media interest
    if (features.mediaInterest) {
      score += 20;
      factors.push('Media attention increases reputational exposure');
    }

    // Case type reputation factors
    if (features.caseType === 'class_action' || features.caseType === 'securities') {
      score += 10;
      factors.push('Case type carries reputational implications');
    }

    const level = this.classifyRiskLevel(score);

    return {
      score: Math.round(score * 10) / 10,
      level,
      factors,
    };
  }

  /**
   * Calculate timeline risk
   */
  private calculateTimelineRisk(features: any): {
    score: number;
    level: string;
    factors: string[];
  } {
    let score = 0;
    const factors = [];

    // Deadline compliance (inverse)
    const deadlineRisk = (1 - features.deadlineCompliance) * 40;
    score += deadlineRisk;
    if (deadlineRisk > 20) {
      factors.push('Deadline compliance concerns');
    }

    // Days to trial
    if (features.daysToTrial < 60) {
      score += 30;
      factors.push('Trial approaching rapidly - limited preparation time');
    } else if (features.daysToTrial < 120) {
      score += 15;
      factors.push('Moderate time pressure');
    }

    // Case age
    if (features.caseAge > 730) {
      // Over 2 years
      score += 20;
      factors.push('Extended case duration may impact strategy');
    }

    // Discovery progress
    if (features.discoveryProgress < 0.5 && features.daysToTrial < 120) {
      score += 20;
      factors.push('Discovery behind schedule relative to trial date');
    }

    const level = this.classifyRiskLevel(score);

    return {
      score: Math.round(score * 10) / 10,
      level,
      factors,
    };
  }

  /**
   * Calculate compliance risk
   */
  private calculateComplianceRisk(features: any): {
    score: number;
    level: string;
    factors: string[];
  } {
    let score = 0;
    const factors = [];

    // Ethics compliance (inverse)
    const ethicsRisk = (1 - features.ethicsCompliance) * 50;
    score += ethicsRisk;
    if (ethicsRisk > 10) {
      factors.push('Ethics compliance review required');
    }

    // Conflict check
    if (!features.conflictCheck) {
      score += 40;
      factors.push('CRITICAL: Conflict check not passed');
    }

    // Regulatory compliance
    const regulatoryRisk = (1 - features.regulatoryCompliance) * 30;
    score += regulatoryRisk;
    if (regulatoryRisk > 15) {
      factors.push('Regulatory compliance concerns');
    }

    // Jurisdiction-specific requirements
    score += features.jurisdictionRisk * 20;
    if (features.jurisdictionRisk > 0.5) {
      factors.push('Jurisdiction has specific compliance requirements');
    }

    const level = this.classifyRiskLevel(score);

    return {
      score: Math.round(score * 10) / 10,
      level,
      factors,
    };
  }

  /**
   * Run Monte Carlo simulation to estimate outcome distribution
   * Simulates thousands of scenarios to estimate probabilities
   */
  private runMonteCarloSimulation(
    features: any,
    iterations: number,
  ): {
    iterations: number;
    expectedValue: number;
    confidenceInterval95: { lower: number; upper: number };
    riskOfLoss: number;
  } {
    const results: number[] = [];

    // Base probabilities
    const baseWinProb = 0.35;
    const baseLossProb = 0.30;
    const baseSettlementProb = 0.35;

    // Run simulations
    for (let i = 0; i < iterations; i++) {
      // Add randomness to probabilities based on features
      const winProb = this.adjustProbability(
        baseWinProb,
        features.legalTheoryStrength,
        features.evidenceQuality,
      );
      const lossProb = this.adjustProbability(
        baseLossProb,
        1 - features.legalTheoryStrength,
        1 - features.evidenceQuality,
      );
      const settlementProb = 1 - winProb - lossProb;

      // Simulate outcome
      const random = Math.random();
      let outcomeValue = 0;

      if (random < winProb) {
        // Win scenario
        outcomeValue = features.claimAmount * this.randomBetween(0.6, 1.0);
      } else if (random < winProb + lossProb) {
        // Loss scenario
        outcomeValue = -features.totalCost * this.randomBetween(1.0, 1.5);
      } else {
        // Settlement scenario
        outcomeValue =
          features.claimAmount *
          this.randomBetween(0.2, 0.6) -
          features.totalCost;
      }

      results.push(outcomeValue);
    }

    // Calculate statistics
    results.sort((a, b) => a - b);

    const expectedValue =
      results.reduce((sum, val) => sum + val, 0) / iterations;

    // 95% confidence interval (2.5th and 97.5th percentiles)
    const lowerIndex = Math.floor(iterations * 0.025);
    const upperIndex = Math.floor(iterations * 0.975);

    const riskOfLoss = results.filter((v) => v < 0).length / iterations;

    return {
      iterations,
      expectedValue: Math.round(expectedValue),
      confidenceInterval95: {
        lower: Math.round(results[lowerIndex]),
        upper: Math.round(results[upperIndex]),
      },
      riskOfLoss: Math.round(riskOfLoss * 1000) / 1000,
    };
  }

  /**
   * Adjust probability based on feature values
   */
  private adjustProbability(...factors: number[]): number {
    const avgFactor = factors.reduce((a, b) => a + b, 0) / factors.length;
    // Add some random noise
    const noise = (Math.random() - 0.5) * 0.2;
    return Math.max(0, Math.min(1, avgFactor + noise));
  }

  /**
   * Generate random number between min and max
   */
  private randomBetween(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }

  /**
   * Generate probabilistic outcomes based on Monte Carlo results
   */
  private generateProbabilisticOutcomes(
    features: any,
    simulation: any,
  ): any {
    return {
      bestCase: {
        probability: 0.1,
        description: `Win case with ${this.formatCurrency(features.claimAmount * 0.9)} recovery`,
      },
      worstCase: {
        probability: simulation.riskOfLoss,
        description: `Lose case with ${this.formatCurrency(features.totalCost * 1.3)} total cost`,
      },
      expectedCase: {
        probability: 0.35,
        description: `Settlement at ${this.formatCurrency(Math.abs(simulation.expectedValue))}`,
      },
    };
  }

  /**
   * Generate mitigation strategies for identified risks
   */
  private generateMitigationStrategies(risks: any): Array<any> {
    const strategies = [];

    // Litigation risk mitigation
    if (risks.litigationRisk.score > 60) {
      strategies.push({
        risk: 'Litigation Risk',
        strategy: 'Engage expert witnesses to strengthen case theory',
        priority: 'high' as const,
        estimatedImpact: 15,
      });
      strategies.push({
        risk: 'Litigation Risk',
        strategy: 'Conduct additional legal research to bolster precedent support',
        priority: 'high' as const,
        estimatedImpact: 10,
      });
    }

    // Financial risk mitigation
    if (risks.financialRisk.score > 50) {
      strategies.push({
        risk: 'Financial Risk',
        strategy: 'Review budget and cost controls',
        priority: 'high' as const,
        estimatedImpact: 12,
      });
      strategies.push({
        risk: 'Financial Risk',
        strategy: 'Discuss fee arrangements with client',
        priority: 'medium' as const,
        estimatedImpact: 8,
      });
    }

    // Timeline risk mitigation
    if (risks.timelineRisk.score > 50) {
      strategies.push({
        risk: 'Timeline Risk',
        strategy: 'Accelerate discovery and preparation',
        priority: 'high' as const,
        estimatedImpact: 15,
      });
      strategies.push({
        risk: 'Timeline Risk',
        strategy: 'Request continuance if necessary',
        priority: 'medium' as const,
        estimatedImpact: 20,
      });
    }

    // Compliance risk mitigation
    if (risks.complianceRisk.score > 30) {
      strategies.push({
        risk: 'Compliance Risk',
        strategy: 'Conduct immediate compliance audit',
        priority: 'high' as const,
        estimatedImpact: 25,
      });
    }

    // Sort by priority and impact
    return strategies.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return b.estimatedImpact - a.estimatedImpact;
    });
  }

  // Helper methods

  private classifyRiskLevel(score: number): 'critical' | 'high' | 'medium' | 'low' {
    if (score >= 75) return 'critical';
    if (score >= 50) return 'high';
    if (score >= 25) return 'medium';
    return 'low';
  }

  private calculateDaysBetween(start: Date, end: Date): number {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  private calculateDaysToTrial(caseData: any): number {
    if (!caseData.trialDate) return 180;
    return this.calculateDaysBetween(new Date(), caseData.trialDate);
  }

  private assessJurisdictionRisk(jurisdiction: any): number {
    // Would assess based on jurisdiction-specific factors
    return 0.3;
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(amount));
  }

  /**
   * Compare risk across multiple cases
   */
  async compareRisks(caseIds: string[]): Promise<{
    cases: Array<{
      caseId: string;
      caseNumber: string;
      overallRisk: number;
      riskLevel: string;
      topRisks: string[];
    }>;
    ranking: Array<{ caseId: string; rank: number }>;
  }> {
    const riskAssessments = await Promise.all(
      caseIds.map(async (caseId) => {
        const risk = await this.calculateRiskScore(caseId);
        const caseData = await this.caseRepo.findOne({ where: { id: caseId } });

        return {
          caseId,
          caseNumber: caseData?.caseNumber || 'Unknown',
          overallRisk: risk.overallRiskScore,
          riskLevel: risk.riskLevel,
          topRisks: Object.values(risk.riskCategories)
            .filter((cat: any) => cat.score > 50)
            .map((cat: any) => cat.factors[0])
            .filter((f) => f)
            .slice(0, 3),
        };
      }),
    );

    // Sort by risk score (highest first)
    const ranking = riskAssessments
      .sort((a, b) => b.overallRisk - a.overallRisk)
      .map((assessment, index) => ({
        caseId: assessment.caseId,
        rank: index + 1,
      }));

    return {
      cases: riskAssessments,
      ranking,
    };
  }
}
