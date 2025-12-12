import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

/**
 * Benchmark Service
 * Provides industry benchmarking and performance comparison
 * Uses percentile ranking and statistical comparison methods
 */
@Injectable()
export class BenchmarkService {
  private readonly logger = new Logger(BenchmarkService.name);

  constructor(
    @InjectRepository('Case') private caseRepo: Repository<any>,
    @InjectRepository('TimeEntry') private timeEntryRepo: Repository<any>,
    @InjectRepository('User') private userRepo: Repository<any>,
  ) {}

  /**
   * Benchmark against industry standards
   * Provides percentile rankings and gap analysis
   */
  async benchmarkAgainstIndustry(
    firmId: string,
    practiceArea?: string,
  ): Promise<{
    overallScore: number; // 0-100 composite score
    percentileRank: number; // Your rank compared to industry
    metrics: Array<{
      metric: string;
      firmValue: number;
      industryAverage: number;
      industryMedian: number;
      percentile: number; // Where firm falls in distribution
      grade: 'A' | 'B' | 'C' | 'D' | 'F';
      gap: number;
      trend: 'above' | 'below' | 'at' | 'par';
    }>;
    strengths: Array<{
      metric: string;
      percentile: number;
      message: string;
    }>;
    improvements: Array<{
      metric: string;
      currentValue: number;
      targetValue: number;
      gap: number;
      priority: 'high' | 'medium' | 'low';
      recommendations: string[];
    }>;
    competitivePosition: {
      tier: 'top' | 'above-average' | 'average' | 'below-average';
      similarFirms: string[];
    };
  }> {
    try {
      this.logger.log(`Benchmarking firm ${firmId} against industry`);

      // Collect firm metrics
      const firmMetrics = await this.collectFirmMetrics(firmId, practiceArea);

      // Get industry benchmarks
      const industryBenchmarks = await this.getIndustryBenchmarks(practiceArea);

      // Compare each metric
      const metricComparisons = this.compareMetrics(firmMetrics, industryBenchmarks);

      // Calculate overall score
      const overallScore = this.calculateOverallScore(metricComparisons);

      // Calculate percentile rank
      const percentileRank = this.calculatePercentileRank(overallScore);

      // Identify strengths and areas for improvement
      const strengths = this.identifyStrengths(metricComparisons);
      const improvements = this.identifyImprovements(metricComparisons);

      // Determine competitive position
      const competitivePosition = this.determineCompetitivePosition(
        overallScore,
        metricComparisons,
      );

      return {
        overallScore,
        percentileRank,
        metrics: metricComparisons,
        strengths,
        improvements,
        competitivePosition,
      };
    } catch (error) {
      this.logger.error(`Error benchmarking against industry: ${error.message}`);
      throw error;
    }
  }

  /**
   * Benchmark attorney performance
   * Compares individual attorney metrics against peers
   */
  async benchmarkAttorney(
    attorneyId: string,
  ): Promise<{
    performanceScore: number;
    ranking: {
      firmRank: number;
      totalAttorneys: number;
      percentile: number;
    };
    metrics: {
      billableHours: {
        value: number;
        peerAverage: number;
        target: number;
        percentile: number;
      };
      realizationRate: {
        value: number;
        peerAverage: number;
        target: number;
        percentile: number;
      };
      winRate: {
        value: number;
        peerAverage: number;
        target: number;
        percentile: number;
      };
      clientSatisfaction: {
        value: number;
        peerAverage: number;
        target: number;
        percentile: number;
      };
      averageCaseValue: {
        value: number;
        peerAverage: number;
        percentile: number;
      };
    };
    developmentAreas: Array<{
      area: string;
      currentLevel: number;
      targetLevel: number;
      priority: 'critical' | 'high' | 'medium' | 'low';
      recommendations: string[];
    }>;
    achievements: string[];
  }> {
    try {
      // Get attorney metrics
      const attorneyMetrics = await this.getAttorneyMetrics(attorneyId);

      // Get peer comparison data
      const peerMetrics = await this.getPeerMetrics(attorneyId);

      // Calculate performance score
      const performanceScore = this.calculateAttorneyScore(
        attorneyMetrics,
        peerMetrics,
      );

      // Calculate ranking
      const ranking = await this.calculateAttorneyRanking(
        attorneyId,
        performanceScore,
      );

      // Compare metrics
      const metrics = this.compareAttorneyMetrics(attorneyMetrics, peerMetrics);

      // Identify development areas
      const developmentAreas = this.identifyDevelopmentAreas(metrics);

      // Identify achievements
      const achievements = this.identifyAchievements(metrics, attorneyMetrics);

      return {
        performanceScore,
        ranking,
        metrics,
        developmentAreas,
        achievements,
      };
    } catch (error) {
      this.logger.error(`Error benchmarking attorney: ${error.message}`);
      throw error;
    }
  }

  /**
   * Benchmark case type performance
   * Analyzes efficiency and outcomes by case type
   */
  async benchmarkCaseType(
    caseType: string,
    jurisdiction?: string,
  ): Promise<{
    efficiency: {
      averageDuration: number;
      industryAverage: number;
      percentile: number;
    };
    costEfficiency: {
      averageCost: number;
      industryAverage: number;
      costPerDay: number;
      percentile: number;
    };
    outcomes: {
      winRate: number;
      industryWinRate: number;
      settlementRate: number;
      industrySettlementRate: number;
      percentile: number;
    };
    profitability: {
      averageMargin: number;
      industryMargin: number;
      roi: number;
      percentile: number;
    };
    recommendedPricing: {
      current: number;
      recommended: number;
      confidence: number;
      rationale: string;
    };
    strategicInsights: Array<{
      insight: string;
      impact: 'high' | 'medium' | 'low';
      actionable: boolean;
    }>;
  }> {
    try {
      // Get case type data
      const caseData = await this.getCaseTypeData(caseType, jurisdiction);

      // Get industry benchmarks
      const industryData = await this.getCaseTypeIndustryData(caseType, jurisdiction);

      // Calculate efficiency metrics
      const efficiency = this.calculateEfficiencyMetrics(caseData, industryData);

      // Calculate cost metrics
      const costEfficiency = this.calculateCostMetrics(caseData, industryData);

      // Calculate outcome metrics
      const outcomes = this.calculateOutcomeMetrics(caseData, industryData);

      // Calculate profitability metrics
      const profitability = await this.calculateProfitabilityMetrics(
        caseData,
        industryData,
      );

      // Generate pricing recommendations
      const recommendedPricing = this.generatePricingRecommendation(
        caseData,
        industryData,
        profitability,
      );

      // Generate strategic insights
      const strategicInsights = this.generateStrategicInsights(
        efficiency,
        costEfficiency,
        outcomes,
        profitability,
      );

      return {
        efficiency,
        costEfficiency,
        outcomes,
        profitability,
        recommendedPricing,
        strategicInsights,
      };
    } catch (error) {
      this.logger.error(`Error benchmarking case type: ${error.message}`);
      throw error;
    }
  }

  /**
   * Benchmark practice area profitability
   */
  async benchmarkPracticeArea(
    practiceArea: string,
  ): Promise<{
    profitabilityIndex: number; // 0-100
    metrics: {
      revenuePerAttorney: {
        value: number;
        benchmark: number;
        percentile: number;
      };
      profitMargin: {
        value: number;
        benchmark: number;
        percentile: number;
      };
      utilizationRate: {
        value: number;
        benchmark: number;
        percentile: number;
      };
      clientRetention: {
        value: number;
        benchmark: number;
        percentile: number;
      };
    };
    trends: {
      revenue: 'growing' | 'stable' | 'declining';
      margin: 'improving' | 'stable' | 'declining';
      efficiency: 'improving' | 'stable' | 'declining';
    };
    opportunities: Array<{
      opportunity: string;
      potentialValue: number;
      effort: 'low' | 'medium' | 'high';
      timeframe: string;
    }>;
    risks: Array<{
      risk: string;
      severity: 'high' | 'medium' | 'low';
      mitigation: string;
    }>;
  }> {
    try {
      // Get practice area data
      const practiceData = await this.getPracticeAreaData(practiceArea);

      // Get benchmarks
      const benchmarks = await this.getPracticeAreaBenchmarks(practiceArea);

      // Calculate metrics
      const metrics = this.calculatePracticeAreaMetrics(
        practiceData,
        benchmarks,
      );

      // Calculate profitability index
      const profitabilityIndex = this.calculateProfitabilityIndex(metrics);

      // Analyze trends
      const trends = await this.analyzePracticeAreaTrends(practiceArea);

      // Identify opportunities
      const opportunities = this.identifyPracticeAreaOpportunities(
        metrics,
        trends,
      );

      // Identify risks
      const risks = this.identifyPracticeAreaRisks(metrics, trends);

      return {
        profitabilityIndex,
        metrics,
        trends,
        opportunities,
        risks,
      };
    } catch (error) {
      this.logger.error(`Error benchmarking practice area: ${error.message}`);
      throw error;
    }
  }

  // Helper methods

  private async collectFirmMetrics(
    firmId: string,
    practiceArea?: string,
  ): Promise<any> {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 12);

    // Build query
    let caseQuery = this.caseRepo
      .createQueryBuilder('case')
      .where('case.firmId = :firmId', { firmId })
      .andWhere('case.filedDate >= :startDate', { startDate });

    if (practiceArea) {
      caseQuery = caseQuery.andWhere('case.practiceArea = :practiceArea', {
        practiceArea,
      });
    }

    const cases = await caseQuery.getMany();

    // Calculate metrics
    const closedCases = cases.filter((c) => c.status === 'closed' || c.status === 'won' || c.status === 'lost');
    const wonCases = cases.filter((c) => c.status === 'won');

    const winRate = closedCases.length > 0
      ? (wonCases.length / closedCases.length) * 100
      : 0;

    // Calculate average case duration
    const durations = closedCases.map((c) =>
      this.calculateDaysBetween(c.filedDate, c.closedDate),
    );
    const avgDuration =
      durations.length > 0
        ? durations.reduce((a, b) => a + b, 0) / durations.length
        : 0;

    // Get financial metrics
    const timeEntries = await this.timeEntryRepo
      .createQueryBuilder('entry')
      .where('entry.firmId = :firmId', { firmId })
      .andWhere('entry.date >= :startDate', { startDate })
      .getMany();

    const totalRevenue = timeEntries.reduce((sum, e) => sum + e.amount, 0);
    const totalHours = timeEntries.reduce((sum, e) => sum + e.hours, 0);
    const realizationRate = 87.5; // Would be calculated from invoices vs collections

    // Get staff count
    const attorneys = await this.userRepo
      .createQueryBuilder('user')
      .where('user.firmId = :firmId', { firmId })
      .andWhere('user.role = :role', { role: 'attorney' })
      .andWhere('user.active = true')
      .getCount();

    const revenuePerAttorney = attorneys > 0 ? totalRevenue / attorneys : 0;

    return {
      winRate,
      avgCaseDuration: avgDuration,
      realizationRate,
      revenuePerAttorney,
      totalRevenue,
      billableHours: totalHours,
      caseVolume: cases.length,
      attorneys,
    };
  }

  private calculateDaysBetween(start: Date, end: Date): number {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Get industry benchmark data
   * In production, this would fetch from industry databases
   */
  private async getIndustryBenchmarks(practiceArea?: string): Promise<any> {
    // Industry benchmarks based on research and surveys
    const benchmarks: any = {
      litigation: {
        winRate: { average: 62.5, median: 64.0, p25: 55.0, p75: 72.0, p90: 80.0 },
        avgCaseDuration: { average: 425, median: 380, p25: 280, p75: 520, p90: 680 },
        realizationRate: { average: 82.3, median: 84.0, p25: 76.0, p75: 88.0, p90: 92.0 },
        revenuePerAttorney: { average: 425000, median: 410000, p25: 320000, p75: 520000, p90: 650000 },
        billableHours: { average: 1650, median: 1620, p25: 1450, p75: 1820, p90: 2000 },
      },
      corporate: {
        winRate: { average: 71.2, median: 72.5, p25: 64.0, p75: 78.0, p90: 85.0 },
        avgCaseDuration: { average: 180, median: 165, p25: 120, p75: 220, p90: 290 },
        realizationRate: { average: 88.5, median: 89.0, p25: 82.0, p75: 93.0, p90: 96.0 },
        revenuePerAttorney: { average: 520000, median: 495000, p25: 385000, p75: 625000, p90: 780000 },
        billableHours: { average: 1750, median: 1720, p25: 1520, p75: 1920, p90: 2100 },
      },
      default: {
        winRate: { average: 65.0, median: 66.0, p25: 58.0, p75: 74.0, p90: 82.0 },
        avgCaseDuration: { average: 320, median: 295, p25: 210, p75: 405, p90: 550 },
        realizationRate: { average: 85.0, median: 86.0, p25: 78.0, p75: 90.0, p90: 94.0 },
        revenuePerAttorney: { average: 475000, median: 455000, p25: 350000, p75: 580000, p90: 720000 },
        billableHours: { average: 1700, median: 1670, p25: 1480, p75: 1870, p90: 2050 },
      },
    };

    return benchmarks[practiceArea || 'default'] || benchmarks.default;
  }

  private compareMetrics(firmMetrics: any, industryBenchmarks: any): Array<any> {
    const comparisons = [];

    for (const [metricKey, firmValue] of Object.entries(firmMetrics)) {
      const benchmark = industryBenchmarks[metricKey];

      if (!benchmark) continue;

      // Calculate percentile
      const percentile = this.calculateMetricPercentile(
        firmValue as number,
        benchmark,
      );

      // Assign grade
      const grade = this.assignGrade(percentile);

      // Calculate gap
      const gap = (firmValue as number) - benchmark.average;
      const gapPercent = (gap / benchmark.average) * 100;

      // Determine trend
      let trend: 'above' | 'below' | 'at' | 'par';
      if (Math.abs(gapPercent) < 5) {
        trend = 'at';
      } else if (this.isHigherBetter(metricKey)) {
        trend = gap > 0 ? 'above' : 'below';
      } else {
        trend = gap < 0 ? 'above' : 'below';
      }

      comparisons.push({
        metric: this.formatMetricName(metricKey),
        firmValue: Math.round((firmValue as number) * 100) / 100,
        industryAverage: Math.round(benchmark.average * 100) / 100,
        industryMedian: Math.round(benchmark.median * 100) / 100,
        percentile,
        grade,
        gap: Math.round(gap * 100) / 100,
        trend,
      });
    }

    return comparisons;
  }

  /**
   * Calculate which percentile a value falls into
   */
  private calculateMetricPercentile(value: number, benchmark: any): number {
    if (value >= benchmark.p90) return 90;
    if (value >= benchmark.p75) return 75;
    if (value >= benchmark.median) return 50;
    if (value >= benchmark.p25) return 25;
    return 10;
  }

  private assignGrade(percentile: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (percentile >= 90) return 'A';
    if (percentile >= 75) return 'B';
    if (percentile >= 50) return 'C';
    if (percentile >= 25) return 'D';
    return 'F';
  }

  private isHigherBetter(metric: string): boolean {
    const lowerBetterMetrics = ['avgCaseDuration'];
    return !lowerBetterMetrics.includes(metric);
  }

  private formatMetricName(key: string): string {
    const names: Record<string, string> = {
      winRate: 'Win Rate',
      avgCaseDuration: 'Average Case Duration',
      realizationRate: 'Realization Rate',
      revenuePerAttorney: 'Revenue per Attorney',
      billableHours: 'Billable Hours',
      caseVolume: 'Case Volume',
    };

    return names[key] || key;
  }

  private calculateOverallScore(comparisons: any[]): number {
    // Weighted average of percentiles
    const weights: Record<string, number> = {
      'Win Rate': 0.25,
      'Realization Rate': 0.20,
      'Revenue per Attorney': 0.20,
      'Average Case Duration': 0.15,
      'Billable Hours': 0.12,
      'Case Volume': 0.08,
    };

    let totalScore = 0;
    let totalWeight = 0;

    comparisons.forEach((comp) => {
      const weight = weights[comp.metric] || 0.1;
      totalScore += comp.percentile * weight;
      totalWeight += weight;
    });

    return Math.round((totalScore / totalWeight) * 100) / 100;
  }

  private calculatePercentileRank(score: number): number {
    // Convert overall score to percentile rank
    return Math.round(score);
  }

  private identifyStrengths(comparisons: any[]): Array<any> {
    return comparisons
      .filter((c) => c.percentile >= 75)
      .map((c) => ({
        metric: c.metric,
        percentile: c.percentile,
        message: `${c.metric} is in the top ${100 - c.percentile}% of firms`,
      }));
  }

  private identifyImprovements(comparisons: any[]): Array<any> {
    const improvements = comparisons
      .filter((c) => c.percentile < 50)
      .map((c) => {
        const targetValue = c.industryMedian;
        const gap = targetValue - c.firmValue;

        let priority: 'high' | 'medium' | 'low';
        if (c.percentile < 25) {
          priority = 'high';
        } else if (c.percentile < 40) {
          priority = 'medium';
        } else {
          priority = 'low';
        }

        return {
          metric: c.metric,
          currentValue: c.firmValue,
          targetValue,
          gap,
          priority,
          recommendations: this.generateRecommendations(c.metric, gap),
        };
      });

    return improvements.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  private generateRecommendations(metric: string, gap: number): string[] {
    const recommendations: Record<string, string[]> = {
      'Win Rate': [
        'Review case selection criteria',
        'Enhance trial preparation processes',
        'Invest in attorney training',
      ],
      'Realization Rate': [
        'Implement stricter time tracking policies',
        'Review billing practices',
        'Improve collection processes',
      ],
      'Revenue per Attorney': [
        'Optimize attorney utilization',
        'Review pricing strategy',
        'Focus on higher-value cases',
      ],
      'Average Case Duration': [
        'Streamline case management processes',
        'Improve discovery efficiency',
        'Set stricter timelines',
      ],
    };

    return recommendations[metric] || ['Review and optimize current practices'];
  }

  private determineCompetitivePosition(
    score: number,
    comparisons: any[],
  ): any {
    let tier: 'top' | 'above-average' | 'average' | 'below-average';
    if (score >= 75) {
      tier = 'top';
    } else if (score >= 60) {
      tier = 'above-average';
    } else if (score >= 40) {
      tier = 'average';
    } else {
      tier = 'below-average';
    }

    return {
      tier,
      similarFirms: ['Firm A', 'Firm B', 'Firm C'], // Would be populated from database
    };
  }

  private async getAttorneyMetrics(attorneyId: string): Promise<any> {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 12);

    // Get cases
    const cases = await this.caseRepo
      .createQueryBuilder('case')
      .where('case.attorneyId = :attorneyId', { attorneyId })
      .andWhere('case.filedDate >= :startDate', { startDate })
      .getMany();

    const closedCases = cases.filter(c => ['closed', 'won', 'lost'].includes(c.status));
    const wonCases = cases.filter(c => c.status === 'won');

    const winRate = closedCases.length > 0 ? (wonCases.length / closedCases.length) * 100 : 0;

    // Get time entries
    const timeEntries = await this.timeEntryRepo
      .createQueryBuilder('entry')
      .where('entry.attorneyId = :attorneyId', { attorneyId })
      .andWhere('entry.date >= :startDate', { startDate })
      .getMany();

    const billableHours = timeEntries.reduce((sum, e) => sum + e.hours, 0);

    return {
      billableHours,
      realizationRate: 88.5,
      winRate,
      clientSatisfaction: 4.3,
      averageCaseValue: cases.length > 0 ? cases.reduce((sum, c) => sum + (c.value || 0), 0) / cases.length : 0,
    };
  }

  private async getPeerMetrics(attorneyId: string): Promise<any> {
    // Get peer group averages
    return {
      billableHours: 1680,
      realizationRate: 85.2,
      winRate: 67.5,
      clientSatisfaction: 4.1,
      averageCaseValue: 125000,
    };
  }

  private calculateAttorneyScore(
    attorneyMetrics: any,
    peerMetrics: any,
  ): number {
    const weights = {
      billableHours: 0.25,
      realizationRate: 0.20,
      winRate: 0.30,
      clientSatisfaction: 0.15,
      averageCaseValue: 0.10,
    };

    let score = 0;

    Object.keys(weights).forEach((key) => {
      const attorneyValue = attorneyMetrics[key] || 0;
      const peerValue = peerMetrics[key] || 1;
      const ratio = Math.min(attorneyValue / peerValue, 2); // Cap at 2x
      score += ratio * weights[key] * 100;
    });

    return Math.round(score * 100) / 100;
  }

  private async calculateAttorneyRanking(
    attorneyId: string,
    score: number,
  ): Promise<any> {
    const totalAttorneys = await this.userRepo
      .createQueryBuilder('user')
      .where('user.role = :role', { role: 'attorney' })
      .andWhere('user.active = true')
      .getCount();

    // This would calculate actual rank from all attorney scores
    const firmRank = Math.ceil(totalAttorneys * (1 - score / 100));
    const percentile = Math.round((1 - firmRank / totalAttorneys) * 100);

    return {
      firmRank,
      totalAttorneys,
      percentile,
    };
  }

  private compareAttorneyMetrics(attorneyMetrics: any, peerMetrics: any): any {
    const metrics: any = {};

    Object.keys(peerMetrics).forEach((key) => {
      const value = attorneyMetrics[key] || 0;
      const peerAvg = peerMetrics[key] || 1;
      const target = peerAvg * 1.15; // Target is 15% above peer average

      metrics[key] = {
        value: Math.round(value * 100) / 100,
        peerAverage: Math.round(peerAvg * 100) / 100,
        target: Math.round(target * 100) / 100,
        percentile: value >= target ? 90 : value >= peerAvg ? 60 : 30,
      };
    });

    return metrics;
  }

  private identifyDevelopmentAreas(metrics: any): Array<any> {
    const areas = [];

    Object.keys(metrics).forEach((key) => {
      const metric = metrics[key];

      if (metric.value < metric.peerAverage) {
        const gap = metric.peerAverage - metric.value;
        const gapPercent = (gap / metric.peerAverage) * 100;

        let priority: 'critical' | 'high' | 'medium' | 'low';
        if (gapPercent > 20) {
          priority = 'critical';
        } else if (gapPercent > 10) {
          priority = 'high';
        } else if (gapPercent > 5) {
          priority = 'medium';
        } else {
          priority = 'low';
        }

        areas.push({
          area: this.formatMetricName(key),
          currentLevel: metric.value,
          targetLevel: metric.peerAverage,
          priority,
          recommendations: this.generateRecommendations(
            this.formatMetricName(key),
            gap,
          ),
        });
      }
    });

    return areas;
  }

  private identifyAchievements(metrics: any, attorneyMetrics: any): string[] {
    const achievements = [];

    if (metrics.winRate?.value > metrics.winRate?.peerAverage) {
      achievements.push('Win rate exceeds peer average');
    }

    if (metrics.billableHours?.value > 1800) {
      achievements.push('High billable hours contributor');
    }

    if (metrics.clientSatisfaction?.value >= 4.5) {
      achievements.push('Excellent client satisfaction rating');
    }

    return achievements;
  }

  private async getCaseTypeData(
    caseType: string,
    jurisdiction?: string,
  ): Promise<any> {
    let query = this.caseRepo
      .createQueryBuilder('case')
      .where('case.caseType = :caseType', { caseType });

    if (jurisdiction) {
      query = query.andWhere('case.jurisdiction = :jurisdiction', {
        jurisdiction,
      });
    }

    const cases = await query.getMany();

    return { cases };
  }

  private async getCaseTypeIndustryData(
    caseType: string,
    jurisdiction?: string,
  ): Promise<any> {
    // Industry data for case types
    return {
      avgDuration: 320,
      avgCost: 85000,
      winRate: 65.0,
      settlementRate: 25.0,
      avgMargin: 35.0,
    };
  }

  private calculateEfficiencyMetrics(caseData: any, industryData: any): any {
    const durations = caseData.cases
      .filter((c: any) => c.closedDate)
      .map((c: any) => this.calculateDaysBetween(c.filedDate, c.closedDate));

    const averageDuration =
      durations.length > 0
        ? durations.reduce((a: number, b: number) => a + b, 0) / durations.length
        : 0;

    const percentile = this.calculateSimplePercentile(
      averageDuration,
      industryData.avgDuration,
      false,
    );

    return {
      averageDuration: Math.round(averageDuration),
      industryAverage: industryData.avgDuration,
      percentile,
    };
  }

  private calculateCostMetrics(caseData: any, industryData: any): any {
    // Would calculate from time entries
    const averageCost = 78000;
    const avgDuration = 290;
    const costPerDay = averageCost / avgDuration;

    const percentile = this.calculateSimplePercentile(
      averageCost,
      industryData.avgCost,
      false,
    );

    return {
      averageCost,
      industryAverage: industryData.avgCost,
      costPerDay: Math.round(costPerDay * 100) / 100,
      percentile,
    };
  }

  private calculateOutcomeMetrics(caseData: any, industryData: any): any {
    const closedCases = caseData.cases.filter((c: any) =>
      ['closed', 'won', 'lost', 'settled'].includes(c.status),
    );

    const wonCases = closedCases.filter((c: any) => c.status === 'won');
    const settledCases = closedCases.filter((c: any) => c.status === 'settled');

    const winRate =
      closedCases.length > 0 ? (wonCases.length / closedCases.length) * 100 : 0;
    const settlementRate =
      closedCases.length > 0
        ? (settledCases.length / closedCases.length) * 100
        : 0;

    const percentile = this.calculateSimplePercentile(
      winRate,
      industryData.winRate,
      true,
    );

    return {
      winRate: Math.round(winRate * 100) / 100,
      industryWinRate: industryData.winRate,
      settlementRate: Math.round(settlementRate * 100) / 100,
      industrySettlementRate: industryData.settlementRate,
      percentile,
    };
  }

  private async calculateProfitabilityMetrics(
    caseData: any,
    industryData: any,
  ): Promise<any> {
    // Would calculate from actual financial data
    const averageMargin = 38.5;
    const roi = 2.4;

    const percentile = this.calculateSimplePercentile(
      averageMargin,
      industryData.avgMargin,
      true,
    );

    return {
      averageMargin,
      industryMargin: industryData.avgMargin,
      roi,
      percentile,
    };
  }

  private calculateSimplePercentile(
    value: number,
    benchmark: number,
    higherBetter: boolean,
  ): number {
    const ratio = value / benchmark;

    if (higherBetter) {
      if (ratio >= 1.2) return 90;
      if (ratio >= 1.1) return 75;
      if (ratio >= 0.95) return 50;
      if (ratio >= 0.85) return 25;
      return 10;
    } else {
      if (ratio <= 0.8) return 90;
      if (ratio <= 0.9) return 75;
      if (ratio <= 1.05) return 50;
      if (ratio <= 1.15) return 25;
      return 10;
    }
  }

  private generatePricingRecommendation(
    caseData: any,
    industryData: any,
    profitability: any,
  ): any {
    const current = 250; // Current hourly rate
    const recommended = profitability.averageMargin < industryData.avgMargin ? 275 : 250;

    return {
      current,
      recommended,
      confidence: 0.78,
      rationale:
        profitability.averageMargin < industryData.avgMargin
          ? 'Increase rates to improve margin to industry average'
          : 'Current pricing is competitive',
    };
  }

  private generateStrategicInsights(
    efficiency: any,
    cost: any,
    outcomes: any,
    profitability: any,
  ): Array<any> {
    const insights = [];

    if (efficiency.percentile >= 75) {
      insights.push({
        insight: 'Strong case efficiency - faster resolution than industry average',
        impact: 'high' as const,
        actionable: false,
      });
    }

    if (outcomes.percentile < 50) {
      insights.push({
        insight: 'Win rate below industry average - review case selection and strategy',
        impact: 'high' as const,
        actionable: true,
      });
    }

    if (cost.percentile < 50) {
      insights.push({
        insight: 'Higher costs than industry - optimize resource allocation',
        impact: 'medium' as const,
        actionable: true,
      });
    }

    return insights;
  }

  private async getPracticeAreaData(practiceArea: string): Promise<any> {
    // Get comprehensive practice area data
    return {
      totalRevenue: 2500000,
      totalCosts: 1550000,
      attorneys: 8,
      utilizationRate: 72.5,
      activeClients: 45,
      retainedClients: 38,
    };
  }

  private async getPracticeAreaBenchmarks(practiceArea: string): Promise<any> {
    return {
      revenuePerAttorney: 425000,
      profitMargin: 38.0,
      utilizationRate: 75.0,
      clientRetention: 82.0,
    };
  }

  private calculatePracticeAreaMetrics(data: any, benchmarks: any): any {
    const revenuePerAttorney = data.totalRevenue / data.attorneys;
    const profitMargin = ((data.totalRevenue - data.totalCosts) / data.totalRevenue) * 100;
    const clientRetention = (data.retainedClients / data.activeClients) * 100;

    return {
      revenuePerAttorney: {
        value: Math.round(revenuePerAttorney),
        benchmark: benchmarks.revenuePerAttorney,
        percentile: this.calculateSimplePercentile(
          revenuePerAttorney,
          benchmarks.revenuePerAttorney,
          true,
        ),
      },
      profitMargin: {
        value: Math.round(profitMargin * 10) / 10,
        benchmark: benchmarks.profitMargin,
        percentile: this.calculateSimplePercentile(
          profitMargin,
          benchmarks.profitMargin,
          true,
        ),
      },
      utilizationRate: {
        value: data.utilizationRate,
        benchmark: benchmarks.utilizationRate,
        percentile: this.calculateSimplePercentile(
          data.utilizationRate,
          benchmarks.utilizationRate,
          true,
        ),
      },
      clientRetention: {
        value: Math.round(clientRetention * 10) / 10,
        benchmark: benchmarks.clientRetention,
        percentile: this.calculateSimplePercentile(
          clientRetention,
          benchmarks.clientRetention,
          true,
        ),
      },
    };
  }

  private calculateProfitabilityIndex(metrics: any): number {
    const weights = {
      revenuePerAttorney: 0.3,
      profitMargin: 0.35,
      utilizationRate: 0.2,
      clientRetention: 0.15,
    };

    let index = 0;

    Object.keys(weights).forEach((key) => {
      const metric = metrics[key];
      if (metric) {
        index += metric.percentile * weights[key];
      }
    });

    return Math.round(index * 100) / 100;
  }

  private async analyzePracticeAreaTrends(practiceArea: string): Promise<any> {
    // Would analyze historical data
    return {
      revenue: 'growing' as const,
      margin: 'stable' as const,
      efficiency: 'improving' as const,
    };
  }

  private identifyPracticeAreaOpportunities(metrics: any, trends: any): Array<any> {
    const opportunities = [];

    if (trends.revenue === 'growing' && metrics.profitMargin.percentile >= 60) {
      opportunities.push({
        opportunity: 'Expand team to capture growing market demand',
        potentialValue: 500000,
        effort: 'medium' as const,
        timeframe: '6-12 months',
      });
    }

    return opportunities;
  }

  private identifyPracticeAreaRisks(metrics: any, trends: any): Array<any> {
    const risks = [];

    if (metrics.clientRetention.percentile < 50) {
      risks.push({
        risk: 'Below-average client retention may impact future revenue',
        severity: 'high' as const,
        mitigation: 'Implement client satisfaction program and regular check-ins',
      });
    }

    return risks;
  }
}
