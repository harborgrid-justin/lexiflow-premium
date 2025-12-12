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

export const ML_SIMILAR_CASES_QUERY = gql`
  query GetSimilarCases($caseId: ID!, $limit: Int, $minSimilarity: Float) {
    similarCases(caseId: $caseId, limit: $limit, minSimilarity: $minSimilarity) {
      caseId
      caseNumber
      title
      similarityScore
      matchingFactors {
        factor
        score
        weight
      }
      outcome
      relevantInsights
      matchBreakdown {
        metadataMatch
        textSimilarity
        contextMatch
        outcomePattern
      }
    }
  }
`;

export const ML_SENTIMENT_ANALYSIS_QUERY = gql`
  query GetSentimentAnalysis($caseId: ID!, $entityType: String!) {
    sentimentAnalysis(caseId: $caseId, entityType: $entityType) {
      overallSentiment
      sentimentScore
      confidence
      analysis {
        positiveIndicators
        negativeIndicators
        neutralIndicators
      }
      timeline {
        date
        documentName
        sentimentScore
        sentiment
      }
      trend
    }
  }
`;

export const ML_RISK_SCORE_QUERY = gql`
  query GetRiskScore($caseId: ID!) {
    riskScore(caseId: $caseId) {
      overallRiskScore
      riskLevel
      riskCategories {
        litigationRisk {
          score
          level
          factors
        }
        financialRisk {
          score
          level
          factors
        }
        reputationalRisk {
          score
          level
          factors
        }
        timelineRisk {
          score
          level
          factors
        }
        complianceRisk {
          score
          level
          factors
        }
      }
      probabilisticOutcomes {
        bestCase {
          probability
          description
        }
        worstCase {
          probability
          description
        }
        expectedCase {
          probability
          description
        }
      }
      mitigationStrategies {
        risk
        strategy
        priority
        estimatedImpact
      }
    }
  }
`;

export const ML_SETTLEMENT_RECOMMENDATION_QUERY = gql`
  query GetSettlementRecommendation($caseId: ID!) {
    settlementRecommendation(caseId: $caseId) {
      recommendedAmount
      range {
        minimum
        maximum
        confidence
      }
      percentiles {
        p25
        p50
        p75
      }
      factors {
        factor
        contribution
        weight
      }
      comparables {
        caseId
        similarity
        settlementAmount
        outcome
      }
      timeline {
        optimalTimingDays
        currentLeverage
      }
      negotiationStrategy
    }
  }
`;

export const EXECUTIVE_DASHBOARD_QUERY = gql`
  query GetExecutiveDashboard($firmId: ID!, $period: String!) {
    executiveDashboard(firmId: $firmId, period: $period) {
      summary {
        totalRevenue
        revenueGrowth
        profitMargin
        activeCases
        caseGrowth
        clientRetention
      }
      financialMetrics {
        revenue {
          current
          previous
          growth
          target
          performance
        }
        collections {
          collected
          outstanding
          realizationRate
          daysOutstanding
        }
        profitability {
          grossProfit
          netProfit
          marginPercent
          ebitda
        }
      }
      operationalMetrics {
        caseload {
          active
          opened
          closed
          winRate
        }
        productivity {
          billableHoursPerAttorney
          utilizationRate
          revenuePerAttorney
          casesPerAttorney
        }
      }
      trends {
        revenue {
          period
          value
        }
        caseVolume {
          period
          value
        }
        profitMargin {
          period
          value
        }
      }
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
  ML_SIMILAR_CASES_QUERY,
  ML_SENTIMENT_ANALYSIS_QUERY,
  ML_RISK_SCORE_QUERY,
  ML_SETTLEMENT_RECOMMENDATION_QUERY,
  EXECUTIVE_DASHBOARD_QUERY,
};

export default analyticsQueries;
