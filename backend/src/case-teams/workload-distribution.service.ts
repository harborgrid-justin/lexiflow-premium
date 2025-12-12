import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CaseTeamMember } from './entities/case-team.entity';

export interface WorkloadMetrics {
  userId: string;
  userName?: string;
  totalCases: number;
  activeCases: number;
  leadCases: number;
  supportCases: number;
  averageHoursPerCase: number;
  estimatedWorkload: number;
  capacity: number;
  utilization: number; // percentage
}

export interface TeamBalanceReport {
  teamMetrics: WorkloadMetrics[];
  averageUtilization: number;
  overloadedMembers: WorkloadMetrics[];
  underutilizedMembers: WorkloadMetrics[];
  recommendations: string[];
}

@Injectable()
export class WorkloadDistributionService {
  constructor(
    @InjectRepository(CaseTeamMember)
    private readonly teamRepository: Repository<CaseTeamMember>,
  ) {}

  /**
   * Calculate workload metrics for a user
   */
  async calculateUserWorkload(userId: string): Promise<WorkloadMetrics> {
    const assignments = await this.teamRepository.find({
      where: { userId },
    });

    // Group by case and role
    const caseRoles = new Map<string, string>();
    assignments.forEach((assignment) => {
      if (!caseRoles.has(assignment.caseId)) {
        caseRoles.set(assignment.caseId, assignment.role);
      }
    });

    const totalCases = caseRoles.size;
    let leadCases = 0;
    let supportCases = 0;

    caseRoles.forEach((role) => {
      if (role === 'Lead Attorney' || role === 'Lead Counsel') {
        leadCases++;
      } else {
        supportCases++;
      }
    });

    // Estimate workload (lead cases count more heavily)
    const leadWeight = 10;
    const supportWeight = 3;
    const estimatedWorkload = leadCases * leadWeight + supportCases * supportWeight;

    // Default capacity (can be customized per user)
    const capacity = 100;
    const utilization = Math.min((estimatedWorkload / capacity) * 100, 100);

    // Calculate average hours (simplified - would come from time tracking in real system)
    const averageHoursPerCase =
      totalCases > 0 ? Math.round((estimatedWorkload / totalCases) * 4) : 0;

    return {
      userId,
      totalCases,
      activeCases: totalCases, // In real system, would filter by case status
      leadCases,
      supportCases,
      averageHoursPerCase,
      estimatedWorkload,
      capacity,
      utilization: Math.round(utilization),
    };
  }

  /**
   * Get workload metrics for all team members in a case
   */
  async getCaseTeamWorkload(caseId: string): Promise<WorkloadMetrics[]> {
    const members = await this.teamRepository.find({
      where: { caseId },
    });

    const uniqueUserIds = [...new Set(members.map((m) => m.userId))];
    const metrics = await Promise.all(
      uniqueUserIds.map((userId) => this.calculateUserWorkload(userId)),
    );

    return metrics.sort((a, b) => b.utilization - a.utilization);
  }

  /**
   * Get team balance report for an organization or firm
   */
  async getTeamBalanceReport(
    userIds?: string[],
  ): Promise<TeamBalanceReport> {
    let metrics: WorkloadMetrics[];

    if (userIds && userIds.length > 0) {
      metrics = await Promise.all(
        userIds.map((userId) => this.calculateUserWorkload(userId)),
      );
    } else {
      // Get all team members
      const allMembers = await this.teamRepository.find();
      const uniqueUserIds = [...new Set(allMembers.map((m) => m.userId))];
      metrics = await Promise.all(
        uniqueUserIds.map((userId) => this.calculateUserWorkload(userId)),
      );
    }

    const averageUtilization =
      metrics.length > 0
        ? Math.round(
            metrics.reduce((sum, m) => sum + m.utilization, 0) / metrics.length,
          )
        : 0;

    // Identify overloaded (>80%) and underutilized (<40%) members
    const overloadedMembers = metrics.filter((m) => m.utilization > 80);
    const underutilizedMembers = metrics.filter((m) => m.utilization < 40);

    const recommendations = this.generateRecommendations(
      metrics,
      overloadedMembers,
      underutilizedMembers,
    );

    return {
      teamMetrics: metrics.sort((a, b) => b.utilization - a.utilization),
      averageUtilization,
      overloadedMembers,
      underutilizedMembers,
      recommendations,
    };
  }

  /**
   * Suggest optimal team member for case assignment
   */
  async suggestTeamMember(
    role: string,
    requiredSkills?: string[],
    excludeUserIds?: string[],
  ): Promise<{
    recommendedUserId: string;
    reason: string;
    workload: WorkloadMetrics;
  } | null> {
    // Get all team members
    const allMembers = await this.teamRepository.find();
    let uniqueUserIds = [...new Set(allMembers.map((m) => m.userId))];

    // Filter out excluded users
    if (excludeUserIds && excludeUserIds.length > 0) {
      uniqueUserIds = uniqueUserIds.filter((id) => !excludeUserIds.includes(id));
    }

    if (uniqueUserIds.length === 0) {
      return null;
    }

    // Get workload for each user
    const workloads = await Promise.all(
      uniqueUserIds.map((userId) => this.calculateUserWorkload(userId)),
    );

    // Find user with lowest utilization who has capacity
    const available = workloads.filter((w) => w.utilization < 90);

    if (available.length === 0) {
      // All users are overloaded, return least loaded
      const leastLoaded = workloads.sort((a, b) => a.utilization - b.utilization)[0];
      return {
        recommendedUserId: leastLoaded.userId,
        reason: 'Least loaded team member (all members at high capacity)',
        workload: leastLoaded,
      };
    }

    // Return user with lowest utilization
    const best = available.sort((a, b) => a.utilization - b.utilization)[0];
    return {
      recommendedUserId: best.userId,
      reason: `Available capacity: ${Math.round(100 - best.utilization)}%`,
      workload: best,
    };
  }

  /**
   * Get workload distribution chart data
   */
  async getWorkloadChartData(userIds?: string[]): Promise<{
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
    }>;
  }> {
    const report = await this.getTeamBalanceReport(userIds);

    return {
      labels: report.teamMetrics.map((m) => m.userName || m.userId.substring(0, 8)),
      datasets: [
        {
          label: 'Utilization %',
          data: report.teamMetrics.map((m) => m.utilization),
        },
        {
          label: 'Total Cases',
          data: report.teamMetrics.map((m) => m.totalCases),
        },
      ],
    };
  }

  private generateRecommendations(
    metrics: WorkloadMetrics[],
    overloaded: WorkloadMetrics[],
    underutilized: WorkloadMetrics[],
  ): string[] {
    const recommendations: string[] = [];

    if (overloaded.length > 0) {
      recommendations.push(
        `${overloaded.length} team member(s) are overloaded (>80% utilization). Consider redistributing cases.`,
      );

      overloaded.forEach((member) => {
        recommendations.push(
          `User ${member.userName || member.userId} has ${member.utilization}% utilization with ${member.totalCases} cases.`,
        );
      });
    }

    if (underutilized.length > 0 && overloaded.length > 0) {
      recommendations.push(
        `Consider assigning new cases to underutilized team members (${underutilized.length} available).`,
      );
    }

    if (metrics.length > 0) {
      const variance = this.calculateVariance(metrics.map((m) => m.utilization));
      if (variance > 500) {
        recommendations.push(
          'High variance in workload distribution detected. Team rebalancing recommended.',
        );
      }
    }

    if (recommendations.length === 0) {
      recommendations.push('Team workload is well-balanced.');
    }

    return recommendations;
  }

  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
    const squaredDiffs = numbers.map((n) => Math.pow(n - mean, 2));
    return squaredDiffs.reduce((sum, d) => sum + d, 0) / numbers.length;
  }
}
