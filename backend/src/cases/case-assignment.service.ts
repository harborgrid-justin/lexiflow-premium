import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Case, CaseType } from './entities/case.entity';

/**
 * Attorney profile for assignment algorithm
 */
export interface AttorneyProfile {
  id: string;
  name: string;
  email: string;
  specializations: string[];
  caseLoad: number;
  maxCaseLoad: number;
  experienceYears: number;
  successRate: number;
  practiceAreas: CaseType[];
  jurisdiction: string[];
  currentCases: string[];
  performance: {
    averageResolutionTime: number;
    clientSatisfaction: number;
    winRate: number;
  };
  availability: {
    isAvailable: boolean;
    nextAvailableDate?: Date;
    workingHours?: { start: string; end: string };
  };
  preferences?: {
    preferredCaseTypes?: CaseType[];
    maxTravelDistance?: number;
    remoteWork?: boolean;
  };
}

/**
 * Assignment criteria and weights
 */
export interface AssignmentCriteria {
  caseType: CaseType;
  jurisdiction?: string;
  practiceArea?: string;
  complexity?: 'low' | 'medium' | 'high';
  urgency?: 'low' | 'medium' | 'high';
  estimatedDuration?: number;
  requiredExperience?: number;
  clientPreferences?: {
    preferredAttorney?: string;
    languageRequirements?: string[];
  };
}

/**
 * Assignment score breakdown
 */
export interface AssignmentScore {
  attorneyId: string;
  attorneyName: string;
  totalScore: number;
  breakdown: {
    specializationScore: number;
    workloadScore: number;
    experienceScore: number;
    performanceScore: number;
    availabilityScore: number;
    jurisdictionScore: number;
  };
  recommended: boolean;
  reason: string;
}

/**
 * Smart Attorney Assignment Service
 * Implements intelligent algorithms for attorney assignment
 */
@Injectable()
export class CaseAssignmentService {
  private readonly logger = new Logger(CaseAssignmentService.name);

  // Scoring weights for different factors
  private readonly weights = {
    specialization: 0.30,
    workload: 0.20,
    experience: 0.15,
    performance: 0.15,
    availability: 0.15,
    jurisdiction: 0.05,
  };

  constructor(
    @InjectRepository(Case)
    private readonly caseRepository: Repository<Case>,
  ) {}

  /**
   * Find best attorney match using weighted scoring algorithm
   */
  async findBestMatch(
    criteria: AssignmentCriteria,
    availableAttorneys: AttorneyProfile[],
  ): Promise<AssignmentScore[]> {
    const scores: AssignmentScore[] = [];

    for (const attorney of availableAttorneys) {
      const score = await this.calculateAssignmentScore(attorney, criteria);
      scores.push(score);
    }

    // Sort by total score descending
    scores.sort((a, b) => b.totalScore - a.totalScore);

    // Mark top 3 as recommended
    scores.forEach((score, index) => {
      score.recommended = index < 3;
    });

    return scores;
  }

  /**
   * Calculate comprehensive assignment score
   */
  private async calculateAssignmentScore(
    attorney: AttorneyProfile,
    criteria: AssignmentCriteria,
  ): Promise<AssignmentScore> {
    // Specialization score (0-100)
    const specializationScore = this.calculateSpecializationScore(attorney, criteria);

    // Workload score (0-100)
    const workloadScore = this.calculateWorkloadScore(attorney);

    // Experience score (0-100)
    const experienceScore = this.calculateExperienceScore(attorney, criteria);

    // Performance score (0-100)
    const performanceScore = this.calculatePerformanceScore(attorney);

    // Availability score (0-100)
    const availabilityScore = this.calculateAvailabilityScore(attorney, criteria);

    // Jurisdiction score (0-100)
    const jurisdictionScore = this.calculateJurisdictionScore(attorney, criteria);

    // Calculate weighted total score
    const totalScore =
      specializationScore * this.weights.specialization +
      workloadScore * this.weights.workload +
      experienceScore * this.weights.experience +
      performanceScore * this.weights.performance +
      availabilityScore * this.weights.availability +
      jurisdictionScore * this.weights.jurisdiction;

    // Generate recommendation reason
    const reason = this.generateRecommendationReason(
      attorney,
      {
        specializationScore,
        workloadScore,
        experienceScore,
        performanceScore,
        availabilityScore,
        jurisdictionScore,
      },
      totalScore,
    );

    return {
      attorneyId: attorney.id,
      attorneyName: attorney.name,
      totalScore: Math.round(totalScore * 100) / 100,
      breakdown: {
        specializationScore,
        workloadScore,
        experienceScore,
        performanceScore,
        availabilityScore,
        jurisdictionScore,
      },
      recommended: false, // Will be set by findBestMatch
      reason,
    };
  }

  /**
   * Calculate specialization match score
   */
  private calculateSpecializationScore(
    attorney: AttorneyProfile,
    criteria: AssignmentCriteria,
  ): number {
    let score = 0;

    // Check practice area match
    if (attorney.practiceAreas.includes(criteria.caseType)) {
      score += 60;
    }

    // Check specialized areas
    if (criteria.practiceArea) {
      const hasSpecialization = attorney.specializations.some((spec) =>
        spec.toLowerCase().includes(criteria.practiceArea!.toLowerCase()),
      );
      if (hasSpecialization) {
        score += 40;
      }
    } else {
      score += 20; // Partial credit if no specific practice area required
    }

    return Math.min(score, 100);
  }

  /**
   * Calculate workload capacity score
   */
  private calculateWorkloadScore(attorney: AttorneyProfile): number {
    const loadPercentage = (attorney.caseLoad / attorney.maxCaseLoad) * 100;

    // Ideal workload is 60-80%
    if (loadPercentage < 60) {
      // Under-utilized, good availability
      return 100;
    } else if (loadPercentage <= 80) {
      // Optimal workload
      return 90;
    } else if (loadPercentage <= 95) {
      // Near capacity
      return 50;
    } else {
      // Over capacity
      return 10;
    }
  }

  /**
   * Calculate experience level score
   */
  private calculateExperienceScore(
    attorney: AttorneyProfile,
    criteria: AssignmentCriteria,
  ): number {
    const requiredYears = criteria.requiredExperience || 0;

    // Base score on years of experience
    let score = Math.min((attorney.experienceYears / 20) * 50, 50);

    // Bonus for meeting requirements
    if (attorney.experienceYears >= requiredYears) {
      score += 30;
    }

    // Complexity matching
    if (criteria.complexity) {
      const complexityRequirement = {
        low: 0,
        medium: 3,
        high: 7,
      };

      if (attorney.experienceYears >= complexityRequirement[criteria.complexity]) {
        score += 20;
      }
    } else {
      score += 10;
    }

    return Math.min(score, 100);
  }

  /**
   * Calculate performance metrics score
   */
  private calculatePerformanceScore(attorney: AttorneyProfile): number {
    const { successRate, averageResolutionTime, clientSatisfaction, winRate } =
      attorney.performance;

    let score = 0;

    // Success rate (0-30 points)
    score += successRate * 30;

    // Win rate (0-30 points)
    score += winRate * 30;

    // Client satisfaction (0-25 points)
    score += clientSatisfaction * 25;

    // Resolution time bonus (0-15 points)
    // Lower resolution time is better
    const resolutionScore = Math.max(0, 15 - averageResolutionTime / 10);
    score += resolutionScore;

    return Math.min(score, 100);
  }

  /**
   * Calculate availability score
   */
  private calculateAvailabilityScore(
    attorney: AttorneyProfile,
    criteria: AssignmentCriteria,
  ): number {
    if (!attorney.availability.isAvailable) {
      return 0;
    }

    let score = 80; // Base score for availability

    // Urgency factor
    if (criteria.urgency === 'high') {
      // Immediate availability is critical
      score += 20;
    } else if (criteria.urgency === 'medium') {
      score += 10;
    } else {
      score += 5;
    }

    // Check next available date
    if (attorney.availability.nextAvailableDate) {
      const daysUntilAvailable = Math.floor(
        (new Date(attorney.availability.nextAvailableDate).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24),
      );

      if (daysUntilAvailable > 7) {
        score -= 30;
      } else if (daysUntilAvailable > 3) {
        score -= 15;
      }
    }

    return Math.max(0, Math.min(score, 100));
  }

  /**
   * Calculate jurisdiction match score
   */
  private calculateJurisdictionScore(
    attorney: AttorneyProfile,
    criteria: AssignmentCriteria,
  ): number {
    if (!criteria.jurisdiction) {
      return 50; // Neutral score if no jurisdiction specified
    }

    const hasJurisdiction = attorney.jurisdiction.some((j) =>
      j.toLowerCase().includes(criteria.jurisdiction!.toLowerCase()),
    );

    return hasJurisdiction ? 100 : 0;
  }

  /**
   * Generate human-readable recommendation reason
   */
  private generateRecommendationReason(
    attorney: AttorneyProfile,
    scores: {
      specializationScore: number;
      workloadScore: number;
      experienceScore: number;
      performanceScore: number;
      availabilityScore: number;
      jurisdictionScore: number;
    },
    totalScore: number,
  ): string {
    const reasons: string[] = [];

    if (scores.specializationScore >= 80) {
      reasons.push('Strong specialization match');
    }
    if (scores.workloadScore >= 80) {
      reasons.push('Optimal workload capacity');
    }
    if (scores.experienceScore >= 80) {
      reasons.push('Highly experienced');
    }
    if (scores.performanceScore >= 80) {
      reasons.push('Excellent track record');
    }
    if (scores.availabilityScore >= 80) {
      reasons.push('Immediately available');
    }
    if (scores.jurisdictionScore >= 80) {
      reasons.push('Jurisdiction expertise');
    }

    if (reasons.length === 0) {
      if (totalScore >= 60) {
        return 'Adequate match for case requirements';
      } else {
        return 'Below optimal match - consider alternatives';
      }
    }

    return reasons.join(', ');
  }

  /**
   * Round-robin assignment algorithm
   */
  async roundRobinAssignment(
    availableAttorneys: AttorneyProfile[],
    caseType: CaseType,
  ): Promise<AttorneyProfile> {
    // Filter attorneys by case type
    const qualifiedAttorneys = availableAttorneys.filter(
      (a) => a.practiceAreas.includes(caseType) && a.availability.isAvailable,
    );

    if (qualifiedAttorneys.length === 0) {
      throw new BadRequestException('No qualified attorneys available');
    }

    // Sort by current case load (ascending)
    qualifiedAttorneys.sort((a, b) => a.caseLoad - b.caseLoad);

    // Return attorney with lowest case load
    return qualifiedAttorneys[0];
  }

  /**
   * Workload balancing algorithm
   */
  async balanceWorkload(
    attorneys: AttorneyProfile[],
  ): Promise<{
    balanced: boolean;
    recommendations: Array<{
      from: string;
      to: string;
      casesToMove: number;
    }>;
  }> {
    // Calculate average workload
    const totalWorkload = attorneys.reduce((sum, a) => sum + a.caseLoad, 0);
    const averageWorkload = totalWorkload / attorneys.length;
    const threshold = averageWorkload * 0.2; // 20% variance threshold

    const recommendations: Array<{
      from: string;
      to: string;
      casesToMove: number;
    }> = [];

    // Find overloaded and underloaded attorneys
    const overloaded = attorneys.filter(
      (a) => a.caseLoad > averageWorkload + threshold,
    );
    const underloaded = attorneys.filter(
      (a) => a.caseLoad < averageWorkload - threshold && a.caseLoad < a.maxCaseLoad,
    );

    // Generate rebalancing recommendations
    for (const over of overloaded) {
      for (const under of underloaded) {
        const difference = over.caseLoad - averageWorkload;
        const capacity = under.maxCaseLoad - under.caseLoad;
        const casesToMove = Math.min(
          Math.floor(difference),
          Math.floor(capacity),
          3, // Max 3 cases per transfer
        );

        if (casesToMove > 0) {
          recommendations.push({
            from: over.id,
            to: under.id,
            casesToMove,
          });
        }
      }
    }

    return {
      balanced: recommendations.length === 0,
      recommendations,
    };
  }

  /**
   * Assign case to attorney
   */
  async assignCase(
    caseId: string,
    attorneyId: string,
    userId?: string,
  ): Promise<Case> {
    const caseData = await this.caseRepository.findOne({ where: { id: caseId } });
    if (!caseData) {
      throw new BadRequestException('Case not found');
    }

    // Update assignment
    caseData.leadAttorneyId = attorneyId;
    caseData.metadata = {
      ...caseData.metadata,
      assignedBy: userId,
      assignedAt: new Date().toISOString(),
    };

    const updatedCase = await this.caseRepository.save(caseData);

    this.logger.log(
      `Case ${caseId} assigned to attorney ${attorneyId} by user ${userId}`,
    );

    return updatedCase;
  }

  /**
   * Batch assign multiple cases
   */
  async batchAssign(
    assignments: Array<{ caseId: string; attorneyId: string }>,
    userId?: string,
  ): Promise<{
    succeeded: string[];
    failed: Array<{ caseId: string; reason: string }>;
  }> {
    const succeeded: string[] = [];
    const failed: Array<{ caseId: string; reason: string }> = [];

    for (const { caseId, attorneyId } of assignments) {
      try {
        await this.assignCase(caseId, attorneyId, userId);
        succeeded.push(caseId);
      } catch (error) {
        failed.push({
          caseId,
          reason: error.message,
        });
      }
    }

    return { succeeded, failed };
  }

  /**
   * Get assignment analytics
   */
  async getAssignmentAnalytics(attorneyId: string): Promise<{
    totalCases: number;
    activeCases: number;
    casesByType: Record<CaseType, number>;
    averageResolutionTime: number;
    workloadPercentage: number;
  }> {
    const cases = await this.caseRepository.find({
      where: { leadAttorneyId: attorneyId },
    });

    const activeCases = cases.filter(
      (c) => !['Closed', 'Archived', 'Settled'].includes(c.status),
    );

    const casesByType: Record<string, number> = {};
    cases.forEach((c) => {
      casesByType[c.type] = (casesByType[c.type] || 0) + 1;
    });

    // Calculate average resolution time
    const closedCases = cases.filter((c) => c.closeDate && c.createdAt);
    const totalResolutionTime = closedCases.reduce((sum, c) => {
      const duration =
        new Date(c.closeDate!).getTime() - new Date(c.createdAt).getTime();
      return sum + duration / (1000 * 60 * 60 * 24); // Convert to days
    }, 0);

    const averageResolutionTime =
      closedCases.length > 0 ? totalResolutionTime / closedCases.length : 0;

    return {
      totalCases: cases.length,
      activeCases: activeCases.length,
      casesByType: casesByType as Record<CaseType, number>,
      averageResolutionTime: Math.round(averageResolutionTime * 100) / 100,
      workloadPercentage: 0, // Would need max case load from attorney profile
    };
  }
}
