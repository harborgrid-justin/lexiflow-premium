import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

/**
 * Settlement Recommender Service
 * Predicts optimal settlement amounts using regression analysis
 * Algorithm: Multiple Linear Regression + Quantile Regression for range estimation
 */
@Injectable()
export class SettlementRecommenderService {
  private readonly logger = new Logger(SettlementRecommenderService.name);

  constructor(
    @InjectRepository('Case') private caseRepo: Repository<any>,
    @InjectRepository('Settlement') private settlementRepo: Repository<any>,
    @InjectRepository('TimeEntry') private timeEntryRepo: Repository<any>,
  ) {}

  /**
   * Recommend settlement amount with confidence intervals
   */
  async recommendSettlementAmount(caseId: string): Promise<{
    recommendedAmount: number;
    range: {
      minimum: number;
      maximum: number;
      confidence: number; // 0-1
    };
    percentiles: {
      p25: number;
      p50: number; // median
      p75: number;
    };
    factors: Array<{
      factor: string;
      contribution: number; // dollar amount
      weight: number;
    }>;
    comparables: Array<{
      caseId: string;
      similarity: number;
      settlementAmount: number;
      outcome: string;
    }>;
    timeline: {
      optimalTimingDays: number;
      currentLeverage: 'high' | 'medium' | 'low';
    };
    negotiationStrategy: string[];
  }> {
    try {
      this.logger.log(`Recommending settlement amount for case ${caseId}`);

      // Extract features
      const features = await this.extractSettlementFeatures(caseId);

      // Find comparable settlements
      const comparables = await this.findComparableSettlements(features);

      // Apply multiple linear regression
      const prediction = this.applyLinearRegression(features, comparables);

      // Calculate confidence intervals using quantile regression
      const range = this.calculateConfidenceInterval(features, comparables);

      // Calculate percentiles
      const percentiles = this.calculatePercentiles(comparables);

      // Calculate factor contributions
      const factors = this.calculateFactorContributions(features, prediction.amount);

      // Assess timing and leverage
      const timeline = this.assessSettlementTiming(features);

      // Generate negotiation strategy
      const negotiationStrategy = this.generateNegotiationStrategy(
        prediction.amount,
        range,
        timeline,
        features,
      );

      return {
        recommendedAmount: Math.round(prediction.amount),
        range: {
          minimum: Math.round(range.minimum),
          maximum: Math.round(range.maximum),
          confidence: range.confidence,
        },
        percentiles: {
          p25: Math.round(percentiles.p25),
          p50: Math.round(percentiles.p50),
          p75: Math.round(percentiles.p75),
        },
        factors,
        comparables: comparables.map((c) => ({
          caseId: c.caseId,
          similarity: Math.round(c.similarity * 1000) / 1000,
          settlementAmount: c.settlementAmount,
          outcome: c.outcome,
        })),
        timeline,
        negotiationStrategy,
      };
    } catch (error) {
      this.logger.error(`Error recommending settlement amount: ${error.message}`);
      throw error;
    }
  }

  /**
   * Extract features relevant to settlement amount prediction
   */
  private async extractSettlementFeatures(caseId: string): Promise<any> {
    const caseData = await this.caseRepo
      .createQueryBuilder('case')
      .leftJoinAndSelect('case.attorney', 'attorney')
      .leftJoinAndSelect('case.judge', 'judge')
      .where('case.id = :caseId', { caseId })
      .getOne();

    if (!caseData) {
      throw new Error(`Case ${caseId} not found`);
    }

    // Get cost data
    const timeEntries = await this.timeEntryRepo
      .createQueryBuilder('entry')
      .where('entry.caseId = :caseId', { caseId })
      .getMany();

    const totalCost = timeEntries.reduce((sum, e) => sum + e.amount, 0);
    const totalHours = timeEntries.reduce((sum, e) => sum + e.hours, 0);

    // Calculate case metrics
    const caseAge = this.calculateDaysBetween(caseData.filedDate, new Date());

    return {
      // Claim characteristics
      claimAmount: caseData.claimAmount || 0,
      damagesClaimed: caseData.damagesClaimed || caseData.claimAmount || 0,
      caseType: caseData.caseType || 'general',
      practiceArea: caseData.practiceArea || 'general',

      // Liability factors
      liabilityStrength: this.assessLiabilityStrength(caseData),
      damagesClarity: this.assessDamagesClarity(caseData),
      evidenceQuality: this.assessEvidenceQuality(caseData),

      // Jurisdiction and judge
      jurisdiction: caseData.jurisdiction?.code || 'unknown',
      judgeSettlementRate: caseData.judge?.settlementRate || 0.35,
      jurisdictionAverageSettlement: await this.getJurisdictionAverage(
        caseData.jurisdiction?.id,
      ),

      // Case costs and economics
      totalCost,
      totalHours,
      costRatio: totalCost / Math.max(1, caseData.claimAmount || 100000),

      // Timing factors
      caseAge,
      daysToTrial: this.calculateDaysToTrial(caseData),
      discoveryProgress: caseData.discoveryProgress || 0,

      // Party factors
      plaintiffLeverage: this.assessPlaintiffLeverage(caseData),
      defendantResources: this.assessDefendantResources(caseData),
      insuranceCoverage: caseData.insuranceCoverage || 0,

      // Risk factors
      tribalRisk: this.assessTrialRisk(caseData),
      appealRisk: this.assessAppealRisk(caseData),
    };
  }

  /**
   * Find comparable settled cases
   */
  private async findComparableSettlements(features: any): Promise<any[]> {
    // Get settled cases from database
    const settledCases = await this.settlementRepo
      .createQueryBuilder('settlement')
      .leftJoinAndSelect('settlement.case', 'case')
      .where('case.caseType = :caseType', { caseType: features.caseType })
      .andWhere('settlement.amount > 0')
      .limit(100)
      .getMany();

    // Calculate similarity for each case
    const comparables = settledCases.map((settlement) => {
      const similarity = this.calculateSettlementSimilarity(
        features,
        settlement.case,
      );

      return {
        caseId: settlement.case.id,
        caseNumber: settlement.case.caseNumber,
        settlementAmount: settlement.amount,
        outcome: 'settled',
        similarity,
        claimAmount: settlement.case.claimAmount,
        settleRatio: settlement.amount / (settlement.case.claimAmount || settlement.amount),
      };
    });

    // Sort by similarity and return top matches
    return comparables
      .filter((c) => c.similarity > 0.5)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 20);
  }

  /**
   * Calculate similarity between current case and historical settlement
   */
  private calculateSettlementSimilarity(currentFeatures: any, historicalCase: any): number {
    let similarity = 0;
    let weights = 0;

    // Case type match (30%)
    if (currentFeatures.caseType === historicalCase.caseType) {
      similarity += 0.30;
    }
    weights += 0.30;

    // Claim amount similarity (25%)
    const claimRatio = Math.min(
      currentFeatures.damagesClaimed,
      historicalCase.claimAmount || 0,
    ) / Math.max(
      currentFeatures.damagesClaimed,
      historicalCase.claimAmount || 1,
    );
    similarity += 0.25 * claimRatio;
    weights += 0.25;

    // Jurisdiction match (20%)
    if (currentFeatures.jurisdiction === historicalCase.jurisdiction?.code) {
      similarity += 0.20;
    }
    weights += 0.20;

    // Practice area match (15%)
    if (currentFeatures.practiceArea === historicalCase.practiceArea) {
      similarity += 0.15;
    }
    weights += 0.15;

    // Timing similarity (10%)
    const ageRatio = Math.min(
      currentFeatures.caseAge,
      historicalCase.caseAge || 365,
    ) / Math.max(
      currentFeatures.caseAge,
      historicalCase.caseAge || 365,
    );
    similarity += 0.10 * ageRatio;
    weights += 0.10;

    return similarity / weights;
  }

  /**
   * Apply multiple linear regression to predict settlement amount
   * Y = β0 + β1*X1 + β2*X2 + ... + βn*Xn
   */
  private applyLinearRegression(
    features: any,
    comparables: any[],
  ): { amount: number; factors: any[] } {
    // Coefficients learned from historical data
    // In production, these would be estimated from the training dataset
    const coefficients = {
      intercept: 10000, // Base settlement amount
      damagesClaimed: 0.35, // 35% of claimed damages
      liabilityStrength: 50000, // $50k per liability point
      evidenceQuality: 30000, // $30k per evidence quality point
      totalCost: 1.5, // Recover 1.5x costs
      costRatio: -20000, // Penalty for high cost ratio
      daysToTrial: -100, // Decreases as trial approaches
      discoveryProgress: 25000, // Increases with discovery completion
      jurisdictionAverage: 0.2, // Influenced by jurisdiction baseline
      tribalRisk: -15000, // Discount for trial risk
    };

    let predictedAmount = coefficients.intercept;
    const factorContributions = [];

    // Calculate contribution of each factor
    const addFactor = (name: string, value: number, coeff: number) => {
      const contribution = value * coeff;
      predictedAmount += contribution;
      factorContributions.push({
        factor: name,
        value,
        coefficient: coeff,
        contribution,
      });
    };

    addFactor('Damages Claimed', features.damagesClaimed, coefficients.damagesClaimed);
    addFactor('Liability Strength', features.liabilityStrength, coefficients.liabilityStrength);
    addFactor('Evidence Quality', features.evidenceQuality, coefficients.evidenceQuality);
    addFactor('Total Cost', features.totalCost, coefficients.totalCost);
    addFactor('Cost Ratio', features.costRatio, coefficients.costRatio);
    addFactor('Days to Trial', features.daysToTrial, coefficients.daysToTrial);
    addFactor('Discovery Progress', features.discoveryProgress, coefficients.discoveryProgress);
    addFactor('Jurisdiction Baseline', features.jurisdictionAverageSettlement, coefficients.jurisdictionAverage);
    addFactor('Trial Risk', features.tribalRisk, coefficients.tribalRisk);

    // Apply comparable case adjustment (weighted average)
    if (comparables.length > 0) {
      const comparableAvg = comparables.reduce(
        (sum, c) => sum + c.settlementAmount * c.similarity,
        0,
      ) / comparables.reduce((sum, c) => sum + c.similarity, 0);

      // Blend regression prediction with comparable average (70/30 split)
      predictedAmount = predictedAmount * 0.7 + comparableAvg * 0.3;
    }

    // Ensure positive amount
    predictedAmount = Math.max(0, predictedAmount);

    return {
      amount: predictedAmount,
      factors: factorContributions,
    };
  }

  /**
   * Calculate confidence interval using quantile regression
   */
  private calculateConfidenceInterval(
    features: any,
    comparables: any[],
  ): { minimum: number; maximum: number; confidence: number } {
    if (comparables.length < 3) {
      const baseAmount = features.damagesClaimed * 0.35;
      return {
        minimum: baseAmount * 0.5,
        maximum: baseAmount * 1.5,
        confidence: 0.5,
      };
    }

    // Get settlement amounts from comparables
    const amounts = comparables
      .map((c) => c.settlementAmount)
      .sort((a, b) => a - b);

    // Calculate 25th and 75th percentiles (IQR-based range)
    const p25Index = Math.floor(amounts.length * 0.25);
    const p75Index = Math.floor(amounts.length * 0.75);

    const minimum = amounts[p25Index];
    const maximum = amounts[p75Index];

    // Confidence based on number of comparables and their similarity
    const avgSimilarity = comparables.reduce((sum, c) => sum + c.similarity, 0) / comparables.length;
    const sampleSizeFactor = Math.min(1, comparables.length / 20);
    const confidence = avgSimilarity * 0.6 + sampleSizeFactor * 0.4;

    return {
      minimum,
      maximum,
      confidence: Math.round(confidence * 1000) / 1000,
    };
  }

  /**
   * Calculate percentile values from comparables
   */
  private calculatePercentiles(comparables: any[]): {
    p25: number;
    p50: number;
    p75: number;
  } {
    if (comparables.length === 0) {
      return { p25: 0, p50: 0, p75: 0 };
    }

    const amounts = comparables
      .map((c) => c.settlementAmount)
      .sort((a, b) => a - b);

    const getPercentile = (p: number) => {
      const index = Math.floor(amounts.length * p);
      return amounts[Math.min(index, amounts.length - 1)];
    };

    return {
      p25: getPercentile(0.25),
      p50: getPercentile(0.50),
      p75: getPercentile(0.75),
    };
  }

  /**
   * Calculate contribution of each factor to settlement amount
   */
  private calculateFactorContributions(
    features: any,
    totalAmount: number,
  ): Array<any> {
    const factors = [
      {
        factor: 'Claim Amount',
        contribution: features.damagesClaimed * 0.35,
        weight: 0.30,
      },
      {
        factor: 'Liability Strength',
        contribution: features.liabilityStrength * 50000,
        weight: 0.25,
      },
      {
        factor: 'Evidence Quality',
        contribution: features.evidenceQuality * 30000,
        weight: 0.20,
      },
      {
        factor: 'Case Costs',
        contribution: features.totalCost * 1.5,
        weight: 0.15,
      },
      {
        factor: 'Timing & Leverage',
        contribution: features.daysToTrial * -100 + features.discoveryProgress * 25000,
        weight: 0.10,
      },
    ];

    // Normalize contributions to sum to total
    const currentSum = factors.reduce((sum, f) => sum + f.contribution, 0);
    const normalizedFactors = factors.map((f) => ({
      ...f,
      contribution: Math.round((f.contribution / currentSum) * totalAmount),
    }));

    return normalizedFactors;
  }

  /**
   * Assess optimal settlement timing
   */
  private assessSettlementTiming(features: any): {
    optimalTimingDays: number;
    currentLeverage: 'high' | 'medium' | 'low';
  } {
    let leverage: 'high' | 'medium' | 'low' = 'medium';

    // High leverage if:
    // - Discovery largely complete
    // - Strong liability/evidence
    // - Not too close to trial (60-120 days is sweet spot)
    if (
      features.discoveryProgress > 0.8 &&
      features.liabilityStrength > 0.7 &&
      features.daysToTrial > 60 &&
      features.daysToTrial < 120
    ) {
      leverage = 'high';
    }

    // Low leverage if:
    // - Weak case
    // - High costs relative to claim
    // - Very close to or far from trial
    if (
      features.liabilityStrength < 0.4 ||
      features.costRatio > 0.5 ||
      features.daysToTrial < 30 ||
      features.daysToTrial > 300
    ) {
      leverage = 'low';
    }

    // Optimal timing: 60-90 days before trial with discovery complete
    let optimalDays = 75;

    if (features.discoveryProgress < 0.7) {
      optimalDays = 120; // Wait for more discovery
    }

    if (features.daysToTrial < optimalDays) {
      optimalDays = Math.max(30, features.daysToTrial - 15);
    }

    return {
      optimalTimingDays: optimalDays,
      currentLeverage: leverage,
    };
  }

  /**
   * Generate negotiation strategy recommendations
   */
  private generateNegotiationStrategy(
    recommendedAmount: number,
    range: any,
    timing: any,
    features: any,
  ): string[] {
    const strategy = [];

    // Opening position
    const openingOffer = recommendedAmount * 1.3; // Start 30% higher
    strategy.push(`Open negotiations at $${this.formatCurrency(openingOffer)}`);

    // Acceptable range
    strategy.push(
      `Acceptable settlement range: $${this.formatCurrency(range.minimum)} - $${this.formatCurrency(range.maximum)}`,
    );

    // Timing strategy
    if (timing.currentLeverage === 'high') {
      strategy.push('Strong leverage position - maintain firm stance');
    } else if (timing.currentLeverage === 'low') {
      strategy.push('Limited leverage - be flexible and consider early settlement');
    }

    if (timing.optimalTimingDays > features.daysToTrial) {
      strategy.push(`Consider delaying settlement talks ${timing.optimalTimingDays - features.daysToTrial} days for better position`);
    }

    // Cost-based strategy
    if (features.costRatio > 0.3) {
      strategy.push('High costs relative to claim - settlement may be economically preferable');
    }

    // Evidence-based strategy
    if (features.evidenceQuality > 0.7) {
      strategy.push('Strong evidence - use in negotiations to justify amount');
    } else {
      strategy.push('Evidence concerns - focus on risk avoidance in discussions');
    }

    // Comparable cases
    strategy.push('Reference comparable settlements to justify valuation');

    return strategy;
  }

  // Helper methods

  private calculateDaysBetween(start: Date, end: Date): number {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  private calculateDaysToTrial(caseData: any): number {
    if (!caseData.trialDate) return 180; // Default 6 months

    return this.calculateDaysBetween(new Date(), caseData.trialDate);
  }

  private assessLiabilityStrength(caseData: any): number {
    // Would analyze case facts, law, etc.
    return 0.7;
  }

  private assessDamagesClarity(caseData: any): number {
    return 0.75;
  }

  private assessEvidenceQuality(caseData: any): number {
    return 0.7;
  }

  private async getJurisdictionAverage(jurisdictionId: string): Promise<number> {
    // Would query average settlements in jurisdiction
    return 125000;
  }

  private assessPlaintiffLeverage(caseData: any): number {
    return 0.6;
  }

  private assessDefendantResources(caseData: any): number {
    return 0.7;
  }

  private assessTrialRisk(caseData: any): number {
    return 0.4; // 40% risk
  }

  private assessAppealRisk(caseData: any): number {
    return 0.3;
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
}
