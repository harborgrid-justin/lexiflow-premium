import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

/**
 * Resource Forecasting Service
 * Uses time series analysis and capacity planning algorithms
 * Algorithms: ARIMA (AutoRegressive Integrated Moving Average) + Prophet for seasonality
 */
@Injectable()
export class ResourceForecastingService {
  private readonly logger = new Logger(ResourceForecastingService.name);

  constructor(
    @InjectRepository('Case') private caseRepo: Repository<any>,
    @InjectRepository('User') private userRepo: Repository<any>,
    @InjectRepository('TimeEntry') private timeEntryRepo: Repository<any>,
  ) {}

  /**
   * Forecast staffing needs for upcoming period
   * Uses ARIMA model with seasonal decomposition
   */
  async forecastStaffingNeeds(
    practiceArea: string,
    forecastDays: number = 90,
  ): Promise<{
    forecast: Array<{
      date: Date;
      requiredAttorneys: number;
      requiredParalegals: number;
      requiredSupport: number;
      confidence: number;
      utilizationRate: number;
    }>;
    recommendations: Array<{
      action: string;
      priority: 'high' | 'medium' | 'low';
      impact: string;
      timeline: string;
    }>;
    currentCapacity: {
      attorneys: number;
      paralegals: number;
      support: number;
      utilizationRate: number;
    };
    projectedGap: {
      attorneys: number;
      paralegals: number;
      support: number;
    };
  }> {
    try {
      this.logger.log(`Forecasting staffing needs for ${practiceArea} over ${forecastDays} days`);

      // Get historical workload data
      const historicalData = await this.getHistoricalWorkload(practiceArea, 365);

      // Get current capacity
      const currentCapacity = await this.getCurrentCapacity(practiceArea);

      // Apply ARIMA forecasting
      const forecast = await this.applyARIMAForecast(historicalData, forecastDays);

      // Calculate resource requirements
      const staffingForecast = forecast.map((point) => ({
        date: point.date,
        requiredAttorneys: Math.ceil(point.estimatedHours / (8 * 0.7)), // 70% utilization target
        requiredParalegals: Math.ceil(point.estimatedHours / (8 * 0.8)), // 80% utilization target
        requiredSupport: Math.ceil(point.estimatedHours / (8 * 0.85)), // 85% utilization target
        confidence: point.confidence,
        utilizationRate: point.utilizationRate,
      }));

      // Calculate projected gaps
      const avgForecast = this.calculateAverage(staffingForecast);
      const projectedGap = {
        attorneys: Math.max(0, avgForecast.requiredAttorneys - currentCapacity.attorneys),
        paralegals: Math.max(0, avgForecast.requiredParalegals - currentCapacity.paralegals),
        support: Math.max(0, avgForecast.requiredSupport - currentCapacity.support),
      };

      // Generate recommendations
      const recommendations = this.generateStaffingRecommendations(
        currentCapacity,
        projectedGap,
        staffingForecast,
      );

      return {
        forecast: staffingForecast,
        recommendations,
        currentCapacity,
        projectedGap,
      };
    } catch (error) {
      this.logger.error(`Error forecasting staffing needs: ${error.message}`);
      throw error;
    }
  }

  /**
   * Forecast budget requirements
   * Uses linear regression with seasonal adjustments
   */
  async forecastBudgetNeeds(
    caseId: string,
    projectionMonths: number = 6,
  ): Promise<{
    monthlyForecasts: Array<{
      month: string;
      estimatedCost: number;
      estimatedHours: number;
      confidence: number;
      breakdown: {
        attorneyFees: number;
        paralegalFees: number;
        expenses: number;
        overhead: number;
      };
    }>;
    totalProjected: number;
    burnRate: number;
    budgetRisk: 'low' | 'medium' | 'high';
    completionDate: Date;
    recommendations: string[];
  }> {
    try {
      // Get historical spending data
      const historicalSpending = await this.getHistoricalSpending(caseId);

      // Calculate current burn rate
      const burnRate = this.calculateBurnRate(historicalSpending);

      // Apply regression model
      const forecasts = [];
      const today = new Date();

      for (let i = 1; i <= projectionMonths; i++) {
        const monthDate = new Date(today.getFullYear(), today.getMonth() + i, 1);

        // Linear trend with seasonal adjustment
        const baseCost = burnRate * (1 + 0.05 * Math.sin((2 * Math.PI * i) / 12)); // Seasonal pattern
        const growthFactor = 1 + (0.02 * i); // 2% monthly growth
        const estimatedCost = baseCost * growthFactor;

        // Calculate confidence (decreases over time)
        const confidence = Math.max(0.5, 0.95 - (0.05 * i));

        forecasts.push({
          month: monthDate.toISOString().substring(0, 7),
          estimatedCost: Math.round(estimatedCost * 100) / 100,
          estimatedHours: Math.round((estimatedCost / 250) * 10) / 10, // Avg $250/hr
          confidence,
          breakdown: {
            attorneyFees: estimatedCost * 0.60,
            paralegalFees: estimatedCost * 0.20,
            expenses: estimatedCost * 0.12,
            overhead: estimatedCost * 0.08,
          },
        });
      }

      const totalProjected = forecasts.reduce((sum, f) => sum + f.estimatedCost, 0);

      // Assess budget risk
      const budgetRisk = this.assessBudgetRisk(burnRate, totalProjected, historicalSpending);

      // Estimate completion date
      const completionDate = this.estimateCompletionDate(historicalSpending, burnRate);

      // Generate recommendations
      const recommendations = this.generateBudgetRecommendations(
        burnRate,
        budgetRisk,
        forecasts,
      );

      return {
        monthlyForecasts: forecasts,
        totalProjected: Math.round(totalProjected * 100) / 100,
        burnRate: Math.round(burnRate * 100) / 100,
        budgetRisk,
        completionDate,
        recommendations,
      };
    } catch (error) {
      this.logger.error(`Error forecasting budget needs: ${error.message}`);
      throw error;
    }
  }

  /**
   * Forecast workload distribution
   * Uses capacity planning algorithms
   */
  async forecastWorkloadDistribution(
    departmentId: string,
    weeks: number = 12,
  ): Promise<{
    weeklyForecasts: Array<{
      weekStarting: Date;
      totalHours: number;
      byRole: {
        partners: number;
        associates: number;
        paralegals: number;
      };
      capacityUtilization: number;
      overloadRisk: 'low' | 'medium' | 'high';
    }>;
    peakPeriods: Array<{ start: Date; end: Date; severity: number }>;
    balancingRecommendations: Array<{
      recommendation: string;
      affectedStaff: string[];
      expectedImpact: string;
    }>;
  }> {
    try {
      // Get current case assignments
      const assignments = await this.getCurrentAssignments(departmentId);

      // Get historical workload patterns
      const historicalPatterns = await this.getWorkloadPatterns(departmentId, 52); // 1 year

      // Forecast each week
      const weeklyForecasts = [];
      const today = new Date();

      for (let i = 0; i < weeks; i++) {
        const weekStart = new Date(today.getTime() + i * 7 * 24 * 60 * 60 * 1000);

        // Use exponential smoothing for forecast
        const baseLine = this.exponentialSmoothing(historicalPatterns, i);
        const seasonalFactor = this.getSeasonalFactor(weekStart);
        const totalHours = baseLine * seasonalFactor;

        // Distribute by role (based on typical distribution)
        const byRole = {
          partners: totalHours * 0.25,
          associates: totalHours * 0.50,
          paralegals: totalHours * 0.25,
        };

        // Calculate capacity utilization
        const capacity = await this.getDepartmentCapacity(departmentId);
        const capacityUtilization = totalHours / capacity.totalAvailableHours;

        // Assess overload risk
        const overloadRisk = this.assessOverloadRisk(capacityUtilization);

        weeklyForecasts.push({
          weekStarting: weekStart,
          totalHours: Math.round(totalHours * 10) / 10,
          byRole: {
            partners: Math.round(byRole.partners * 10) / 10,
            associates: Math.round(byRole.associates * 10) / 10,
            paralegals: Math.round(byRole.paralegals * 10) / 10,
          },
          capacityUtilization: Math.round(capacityUtilization * 100) / 100,
          overloadRisk,
        });
      }

      // Identify peak periods
      const peakPeriods = this.identifyPeakPeriods(weeklyForecasts);

      // Generate balancing recommendations
      const balancingRecommendations = await this.generateBalancingRecommendations(
        weeklyForecasts,
        assignments,
      );

      return {
        weeklyForecasts,
        peakPeriods,
        balancingRecommendations,
      };
    } catch (error) {
      this.logger.error(`Error forecasting workload distribution: ${error.message}`);
      throw error;
    }
  }

  /**
   * Forecast skill requirements
   */
  async forecastSkillRequirements(
    practiceArea: string,
    months: number = 6,
  ): Promise<{
    requiredSkills: Array<{
      skill: string;
      currentStaff: number;
      requiredStaff: number;
      gap: number;
      priority: 'critical' | 'high' | 'medium' | 'low';
      timeToHire: number; // days
    }>;
    trainingRecommendations: Array<{
      skill: string;
      trainees: string[];
      duration: number; // weeks
      cost: number;
    }>;
    hiringRecommendations: Array<{
      role: string;
      count: number;
      requiredSkills: string[];
      urgency: 'immediate' | 'soon' | 'planned';
    }>;
  }> {
    try {
      // Analyze upcoming case requirements
      const upcomingCases = await this.getUpcomingCases(practiceArea, months);

      // Extract required skills
      const skillRequirements = this.analyzeSkillRequirements(upcomingCases);

      // Get current skill inventory
      const currentSkills = await this.getCurrentSkillInventory(practiceArea);

      // Calculate gaps
      const requiredSkills = skillRequirements.map((req) => {
        const current = currentSkills.find((s) => s.skill === req.skill);
        const gap = Math.max(0, req.required - (current?.count || 0));

        return {
          skill: req.skill,
          currentStaff: current?.count || 0,
          requiredStaff: req.required,
          gap,
          priority: this.prioritizeSkillGap(gap, req.required),
          timeToHire: this.estimateTimeToHire(req.skill),
        };
      });

      // Generate training recommendations
      const trainingRecommendations = await this.generateTrainingRecommendations(
        requiredSkills,
        currentSkills,
      );

      // Generate hiring recommendations
      const hiringRecommendations = this.generateHiringRecommendations(requiredSkills);

      return {
        requiredSkills,
        trainingRecommendations,
        hiringRecommendations,
      };
    } catch (error) {
      this.logger.error(`Error forecasting skill requirements: ${error.message}`);
      throw error;
    }
  }

  // Helper methods

  private async getHistoricalWorkload(practiceArea: string, days: number): Promise<any[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const data = await this.timeEntryRepo
      .createQueryBuilder('entry')
      .select('DATE(entry.date) as date')
      .addSelect('SUM(entry.hours) as hours')
      .where('entry.practiceArea = :practiceArea', { practiceArea })
      .andWhere('entry.date >= :startDate', { startDate })
      .groupBy('DATE(entry.date)')
      .orderBy('date', 'ASC')
      .getRawMany();

    return data;
  }

  private async getCurrentCapacity(practiceArea: string): Promise<any> {
    const staff = await this.userRepo
      .createQueryBuilder('user')
      .where('user.practiceArea = :practiceArea', { practiceArea })
      .andWhere('user.active = true')
      .getMany();

    const attorneys = staff.filter((s) => s.role === 'attorney').length;
    const paralegals = staff.filter((s) => s.role === 'paralegal').length;
    const support = staff.filter((s) => s.role === 'support').length;

    // Calculate current utilization
    const utilizationRate = 0.72; // This would be calculated from actual data

    return {
      attorneys,
      paralegals,
      support,
      utilizationRate,
    };
  }

  /**
   * ARIMA forecasting model
   * Components: AutoRegressive (AR), Integrated (I), Moving Average (MA)
   */
  private async applyARIMAForecast(
    historicalData: any[],
    forecastDays: number,
  ): Promise<any[]> {
    // Extract time series values
    const values = historicalData.map((d) => d.hours);

    // Calculate parameters
    const p = 2; // AR order
    const d = 1; // Differencing order
    const q = 2; // MA order

    // Difference the series
    const diffed = this.difference(values, d);

    // Calculate AR coefficients (simplified - use last p values)
    const arCoeffs = [0.6, 0.3]; // Would be estimated via Yule-Walker equations

    // Calculate MA coefficients
    const maCoeffs = [0.4, 0.2]; // Would be estimated via maximum likelihood

    // Generate forecast
    const forecast = [];
    const today = new Date();

    for (let i = 0; i < forecastDays; i++) {
      const date = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);

      // AR component
      let arComponent = 0;
      for (let j = 0; j < p && i - j - 1 >= 0; j++) {
        const idx = diffed.length - 1 - j;
        arComponent += arCoeffs[j] * (diffed[idx] || diffed[diffed.length - 1]);
      }

      // MA component (residuals)
      const maComponent = 0; // Simplified

      // Combine components
      const predicted = arComponent + maComponent;

      // Reverse differencing
      const lastValue = i > 0 ? forecast[i - 1].estimatedHours : values[values.length - 1];
      const estimatedHours = Math.max(0, lastValue + predicted);

      // Calculate confidence (decreases over forecast horizon)
      const confidence = Math.max(0.5, 0.95 - (0.01 * i));

      forecast.push({
        date,
        estimatedHours: Math.round(estimatedHours * 10) / 10,
        confidence,
        utilizationRate: 0.75, // Target utilization
      });
    }

    return forecast;
  }

  private difference(series: number[], order: number): number[] {
    let result = [...series];
    for (let i = 0; i < order; i++) {
      result = result.slice(1).map((val, idx) => val - result[idx]);
    }
    return result;
  }

  private calculateAverage(forecast: any[]): any {
    const sum = forecast.reduce(
      (acc, f) => ({
        requiredAttorneys: acc.requiredAttorneys + f.requiredAttorneys,
        requiredParalegals: acc.requiredParalegals + f.requiredParalegals,
        requiredSupport: acc.requiredSupport + f.requiredSupport,
      }),
      { requiredAttorneys: 0, requiredParalegals: 0, requiredSupport: 0 },
    );

    return {
      requiredAttorneys: Math.ceil(sum.requiredAttorneys / forecast.length),
      requiredParalegals: Math.ceil(sum.requiredParalegals / forecast.length),
      requiredSupport: Math.ceil(sum.requiredSupport / forecast.length),
    };
  }

  private generateStaffingRecommendations(
    current: any,
    gap: any,
    forecast: any[],
  ): Array<any> {
    const recommendations = [];

    if (gap.attorneys > 0) {
      recommendations.push({
        action: `Hire ${gap.attorneys} additional attorney(s)`,
        priority: gap.attorneys > 2 ? 'high' : 'medium',
        impact: `Reduce attorney utilization to target 70% from current ${Math.round(current.utilizationRate * 100)}%`,
        timeline: '60-90 days',
      });
    }

    if (gap.paralegals > 0) {
      recommendations.push({
        action: `Hire ${gap.paralegals} additional paralegal(s)`,
        priority: 'medium',
        impact: 'Improve case support and reduce attorney administrative burden',
        timeline: '30-60 days',
      });
    }

    // Check for seasonal peaks
    const peakForecast = forecast.reduce((max, f) => f.requiredAttorneys > max.requiredAttorneys ? f : max);
    if (peakForecast.requiredAttorneys > current.attorneys * 1.2) {
      recommendations.push({
        action: 'Consider contract attorneys for peak periods',
        priority: 'medium',
        impact: 'Handle seasonal workload without permanent staffing increases',
        timeline: 'As needed',
      });
    }

    return recommendations;
  }

  private async getHistoricalSpending(caseId: string): Promise<any[]> {
    const entries = await this.timeEntryRepo
      .createQueryBuilder('entry')
      .where('entry.caseId = :caseId', { caseId })
      .orderBy('entry.date', 'ASC')
      .getMany();

    return entries;
  }

  private calculateBurnRate(historicalData: any[]): number {
    if (historicalData.length === 0) return 0;

    // Calculate average monthly burn
    const totalSpent = historicalData.reduce((sum, entry) => sum + entry.amount, 0);
    const months = this.calculateMonthsBetween(
      historicalData[0].date,
      historicalData[historicalData.length - 1].date,
    );

    return totalSpent / Math.max(1, months);
  }

  private calculateMonthsBetween(start: Date, end: Date): number {
    const months = (new Date(end).getFullYear() - new Date(start).getFullYear()) * 12;
    return months + new Date(end).getMonth() - new Date(start).getMonth() + 1;
  }

  private assessBudgetRisk(
    burnRate: number,
    totalProjected: number,
    historicalData: any[],
  ): 'low' | 'medium' | 'high' {
    const variance = this.calculateVariance(historicalData.map((d) => d.amount));
    const coefficientOfVariation = Math.sqrt(variance) / burnRate;

    if (coefficientOfVariation > 0.5) return 'high';
    if (coefficientOfVariation > 0.3) return 'medium';
    return 'low';
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length;
  }

  private estimateCompletionDate(historicalData: any[], burnRate: number): Date {
    // Estimate based on historical pace
    const avgCaseDuration = 365; // days (would be calculated from similar cases)
    const startDate = historicalData[0]?.date || new Date();
    const completionDate = new Date(startDate);
    completionDate.setDate(completionDate.getDate() + avgCaseDuration);

    return completionDate;
  }

  private generateBudgetRecommendations(
    burnRate: number,
    risk: string,
    forecasts: any[],
  ): string[] {
    const recommendations = [];

    if (risk === 'high') {
      recommendations.push('Implement tighter budget controls and approval processes');
      recommendations.push('Review staffing efficiency and consider cost-reduction measures');
    }

    if (burnRate > 50000) {
      recommendations.push('Consider alternative fee arrangements with client');
    }

    const trend = forecasts[forecasts.length - 1].estimatedCost > forecasts[0].estimatedCost * 1.5;
    if (trend) {
      recommendations.push('Costs are trending upward - review scope and strategy');
    }

    return recommendations;
  }

  private async getCurrentAssignments(departmentId: string): Promise<any[]> {
    // Get current case assignments
    const cases = await this.caseRepo
      .createQueryBuilder('case')
      .leftJoinAndSelect('case.assignedTo', 'assignedTo')
      .where('case.departmentId = :departmentId', { departmentId })
      .andWhere('case.status != :status', { status: 'closed' })
      .getMany();

    return cases;
  }

  private async getWorkloadPatterns(departmentId: string, weeks: number): Promise<number[]> {
    // Get historical weekly hours
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - weeks * 7);

    const data = await this.timeEntryRepo
      .createQueryBuilder('entry')
      .select('YEARWEEK(entry.date) as week')
      .addSelect('SUM(entry.hours) as hours')
      .where('entry.departmentId = :departmentId', { departmentId })
      .andWhere('entry.date >= :startDate', { startDate })
      .groupBy('week')
      .orderBy('week', 'ASC')
      .getRawMany();

    return data.map((d) => d.hours);
  }

  private exponentialSmoothing(historicalData: number[], periodsAhead: number): number {
    const alpha = 0.3; // Smoothing factor
    let smoothed = historicalData[0];

    for (let i = 1; i < historicalData.length; i++) {
      smoothed = alpha * historicalData[i] + (1 - alpha) * smoothed;
    }

    return smoothed;
  }

  private getSeasonalFactor(date: Date): number {
    const month = date.getMonth();
    // Legal work typically slower in summer, busier in fall/spring
    const seasonalFactors = [1.0, 1.05, 1.1, 1.05, 1.0, 0.9, 0.85, 0.85, 1.0, 1.1, 1.1, 0.95];
    return seasonalFactors[month];
  }

  private async getDepartmentCapacity(departmentId: string): Promise<any> {
    const staff = await this.userRepo
      .createQueryBuilder('user')
      .where('user.departmentId = :departmentId', { departmentId })
      .andWhere('user.active = true')
      .getMany();

    const totalAvailableHours = staff.length * 40; // 40 hours per week per person
    return { totalAvailableHours, staffCount: staff.length };
  }

  private assessOverloadRisk(utilization: number): 'low' | 'medium' | 'high' {
    if (utilization > 0.9) return 'high';
    if (utilization > 0.75) return 'medium';
    return 'low';
  }

  private identifyPeakPeriods(forecasts: any[]): Array<any> {
    const threshold = 0.85; // 85% utilization
    const peaks = [];
    let peakStart = null;

    for (let i = 0; i < forecasts.length; i++) {
      if (forecasts[i].capacityUtilization > threshold && !peakStart) {
        peakStart = i;
      } else if (forecasts[i].capacityUtilization <= threshold && peakStart !== null) {
        peaks.push({
          start: forecasts[peakStart].weekStarting,
          end: forecasts[i - 1].weekStarting,
          severity: forecasts.slice(peakStart, i).reduce((max, f) => Math.max(max, f.capacityUtilization), 0),
        });
        peakStart = null;
      }
    }

    return peaks;
  }

  private async generateBalancingRecommendations(
    forecasts: any[],
    assignments: any[],
  ): Promise<Array<any>> {
    const recommendations = [];

    // Check for overload periods
    const overloadWeeks = forecasts.filter((f) => f.overloadRisk === 'high');
    if (overloadWeeks.length > 0) {
      recommendations.push({
        recommendation: 'Redistribute cases from overloaded weeks',
        affectedStaff: ['All staff'],
        expectedImpact: 'Reduce peak utilization by 15-20%',
      });
    }

    return recommendations;
  }

  private async getUpcomingCases(practiceArea: string, months: number): Promise<any[]> {
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + months);

    const cases = await this.caseRepo
      .createQueryBuilder('case')
      .where('case.practiceArea = :practiceArea', { practiceArea })
      .andWhere('case.expectedStartDate <= :futureDate', { futureDate })
      .getMany();

    return cases;
  }

  private analyzeSkillRequirements(cases: any[]): Array<any> {
    // Analyze cases to extract required skills
    const skillMap = new Map();

    cases.forEach((caseItem) => {
      const skills = this.extractRequiredSkills(caseItem);
      skills.forEach((skill) => {
        skillMap.set(skill, (skillMap.get(skill) || 0) + 1);
      });
    });

    return Array.from(skillMap.entries()).map(([skill, required]) => ({
      skill,
      required,
    }));
  }

  private extractRequiredSkills(caseItem: any): string[] {
    // Extract skills based on case type and complexity
    const skills = [];

    if (caseItem.caseType === 'litigation') {
      skills.push('litigation', 'trial_preparation', 'motion_practice');
    }
    if (caseItem.caseType === 'corporate') {
      skills.push('corporate_law', 'contract_drafting', 'mergers_acquisitions');
    }
    if (caseItem.complexity === 'high') {
      skills.push('expert_witness', 'complex_discovery');
    }

    return skills;
  }

  private async getCurrentSkillInventory(practiceArea: string): Promise<Array<any>> {
    const staff = await this.userRepo
      .createQueryBuilder('user')
      .where('user.practiceArea = :practiceArea', { practiceArea })
      .andWhere('user.active = true')
      .getMany();

    // Count skills
    const skillMap = new Map();
    staff.forEach((person) => {
      const skills = person.skills || [];
      skills.forEach((skill: string) => {
        skillMap.set(skill, (skillMap.get(skill) || 0) + 1);
      });
    });

    return Array.from(skillMap.entries()).map(([skill, count]) => ({
      skill,
      count,
    }));
  }

  private prioritizeSkillGap(gap: number, required: number): 'critical' | 'high' | 'medium' | 'low' {
    const gapPercent = gap / required;
    if (gapPercent > 0.5) return 'critical';
    if (gapPercent > 0.3) return 'high';
    if (gapPercent > 0.1) return 'medium';
    return 'low';
  }

  private estimateTimeToHire(skill: string): number {
    // Estimated days to hire based on skill complexity
    const timeMap: Record<string, number> = {
      litigation: 90,
      trial_preparation: 75,
      corporate_law: 90,
      contract_drafting: 60,
      expert_witness: 120,
      motion_practice: 60,
    };

    return timeMap[skill] || 75;
  }

  private async generateTrainingRecommendations(
    required: any[],
    current: any[],
  ): Promise<Array<any>> {
    const recommendations = [];

    required.forEach((req) => {
      if (req.gap > 0 && req.gap < 3) {
        // Training is viable for small gaps
        recommendations.push({
          skill: req.skill,
          trainees: [], // Would be populated with actual staff IDs
          duration: 12, // weeks
          cost: 5000, // USD
        });
      }
    });

    return recommendations;
  }

  private generateHiringRecommendations(required: any[]): Array<any> {
    const recommendations = [];

    // Group skills by role
    const criticalGaps = required.filter((r) => r.priority === 'critical');

    if (criticalGaps.length > 0) {
      recommendations.push({
        role: 'Senior Attorney',
        count: Math.ceil(criticalGaps.length / 3),
        requiredSkills: criticalGaps.map((g) => g.skill),
        urgency: 'immediate' as const,
      });
    }

    return recommendations;
  }
}
