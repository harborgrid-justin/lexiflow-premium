/**
 * Analytics GraphQL Queries
 * GraphQL queries for analytics data
 */

import { gql } from 'graphql-request';

export const CASE_METRICS_QUERY = gql`
  query GetCaseMetrics($startDate: DateTime, $endDate: DateTime, $practiceArea: String, $status: String) {
    caseMetrics(
      startDate: $startDate
      endDate: $endDate
      practiceArea: $practiceArea
      status: $status
    ) {
      totalCases
      activeCases
      closedCases
      winRate
      lossRate
      settlementRate
      avgCaseDuration
      medianCaseDuration
      avgCaseValue
      totalRevenue
      casesByStatus {
        status
        count
      }
      casesByPracticeArea {
        practiceArea
        count
      }
      trends {
        period
        newCases
        closedCases
        winRate
        avgDuration
        revenue
      }
    }
  }
`;

export const CASE_SPECIFIC_METRICS_QUERY = gql`
  query GetCaseSpecificMetrics($caseId: ID!) {
    caseMetrics(caseId: $caseId) {
      caseId
      caseNumber
      title
      daysOpen
      totalHours
      totalBilled
      totalCollected
      realizationRate
      documentCount
      motionCount
      hearingCount
      depositionCount
      teamUtilization
      upcomingDeadlines
      overdueTasks
      activityTimeline {
        date
        type
        description
        value
      }
    }
  }
`;

export const BILLING_ANALYTICS_QUERY = gql`
  query GetBillingAnalytics($startDate: DateTime, $endDate: DateTime) {
    billingAnalytics(startDate: $startDate, endDate: $endDate) {
      revenue
      collected
      outstanding
      realizationRate
      utilizationRate
      avgHourlyRate
      totalHours
      byAttorney {
        name
        hours
        revenue
        realization
      }
      byPracticeArea {
        area
        revenue
        hours
      }
      trends {
        period
        revenue
        hours
      }
    }
  }
`;

export const OUTCOME_PREDICTION_QUERY = gql`
  query GetOutcomePrediction($caseId: ID!) {
    outcomePrediction(caseId: $caseId) {
      caseId
      predictedOutcome
      confidenceLevel
      confidenceScore
      probabilities {
        outcome
        probability
      }
      influencingFactors {
        name
        description
        weight
        impact
        explanation
      }
      similarCasesCount
      settlementRange {
        min
        max
        median
      }
      predictedDuration
      riskFactors {
        category
        level
        description
        mitigationStrategies
        probability
      }
      recommendations
      modelVersion
      analyzedAt
    }
  }
`;

export const JUDGE_STATISTICS_QUERY = gql`
  query GetJudgeStatistics($judgeId: ID!) {
    judgeStatistics(judgeId: $judgeId) {
      judgeId
      judgeName
      court
      totalCases
      settlementRate
      plaintiffWinRate
      defendantWinRate
      dismissalRate
      avgCaseDuration
      avgSettlementAmount
      motionGrantRate {
        summary
        dismiss
        discovery
      }
      casesByType {
        type
        count
      }
      trialHistory {
        outcome
        duration
        year
      }
    }
  }
`;

export const DISCOVERY_ANALYTICS_QUERY = gql`
  query GetDiscoveryAnalytics($caseId: ID!) {
    discoveryAnalytics(caseId: $caseId) {
      caseId
      totalDocuments
      totalPages
      productionSets {
        setNumber
        documentCount
        pageCount
        dateProduced
        custodians
      }
      documentsByType {
        type
        count
        pages
      }
      timeline {
        date
        event
        documentCount
      }
      custodianStats {
        name
        documentCount
        pageCount
      }
      volumeMetrics {
        avgPagesPerDoc
        totalSizeMB
        duplicateRate
      }
    }
  }
`;

export const DASHBOARD_QUERY = gql`
  query GetDashboard($period: String!) {
    dashboard(period: $period) {
      summary {
        totalCases
        activeCases
        totalRevenue
        outstandingAmount
        upcomingDeadlines
      }
      caseMetrics {
        newCases
        closedCases
        winRate
      }
      billingMetrics {
        revenue
        collected
        realizationRate
      }
      topCases {
        caseId
        title
        status
        revenue
        daysOpen
      }
      recentActivity {
        date
        type
        description
        caseId
      }
      alerts {
        type
        severity
        message
        caseId
      }
    }
  }
`;

export const RISK_ASSESSMENT_QUERY = gql`
  query GetRiskAssessment($caseId: ID!) {
    riskAssessment(caseId: $caseId) {
      caseId
      overallRiskScore
      riskLevel
      riskCategories {
        financial {
          score
          level
          factors {
            name
            description
            severity
            likelihood
            impact
          }
        }
        timeline {
          score
          level
          factors {
            name
            description
            severity
            likelihood
            impact
          }
        }
        legal {
          score
          level
          factors {
            name
            description
            severity
            likelihood
            impact
          }
        }
        reputation {
          score
          level
          factors {
            name
            description
            severity
            likelihood
            impact
          }
        }
      }
      topRisks {
        category
        description
        severity
        likelihood
        impact
        mitigationActions
      }
      mitigationStrategies {
        risk
        strategy
        priority
        estimatedCost
        estimatedTimeReduction
        effectiveness
      }
      confidenceScore
      assessedAt
    }
  }
`;

export const analyticsQueries = {
  CASE_METRICS_QUERY,
  CASE_SPECIFIC_METRICS_QUERY,
  BILLING_ANALYTICS_QUERY,
  OUTCOME_PREDICTION_QUERY,
  JUDGE_STATISTICS_QUERY,
  DISCOVERY_ANALYTICS_QUERY,
  DASHBOARD_QUERY,
  RISK_ASSESSMENT_QUERY,
};

export default analyticsQueries;
