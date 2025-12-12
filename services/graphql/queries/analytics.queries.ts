import { gql } from '@apollo/client';

export const GET_DASHBOARD_METRICS = gql`
  query GetDashboardMetrics($startDate: DateTime, $endDate: DateTime) {
    dashboardMetrics(startDate: $startDate, endDate: $endDate) {
      totalCases
      activeCases
      closedCases
      totalDocuments
      pendingReviews
      upcomingDeadlines
      totalBillableHours
      totalRevenue
      collectionRate
      generatedAt
    }
  }
`;

export const GET_CASE_ANALYTICS = gql`
  query GetCaseAnalytics($caseId: ID!) {
    caseAnalytics(caseId: $caseId) {
      caseId
      caseNumber
      caseTitle
      totalDocuments
      totalMotions
      totalHearings
      totalHours
      totalCost
      daysOpen
      teamSize
      winProbability
      createdAt
      updatedAt
    }
  }
`;

export const GET_ALL_CASE_ANALYTICS = gql`
  query GetAllCaseAnalytics($startDate: DateTime, $endDate: DateTime) {
    allCaseAnalytics(startDate: $startDate, endDate: $endDate) {
      caseId
      caseNumber
      caseTitle
      totalDocuments
      totalMotions
      totalHearings
      totalHours
      totalCost
      daysOpen
      teamSize
      winProbability
      createdAt
      updatedAt
    }
  }
`;

export const GET_JUDGE_STATISTICS = gql`
  query GetJudgeStatistics($judgeName: String, $court: String) {
    judgeStatistics(judgeName: $judgeName, court: $court) {
      id
      judgeName
      court
      totalCases
      decisionsGranted
      decisionsDenied
      grantRate
      avgDaysToDecision
      commonIssues
      lastUpdated
    }
  }
`;

export const GET_BILLING_ANALYTICS = gql`
  query GetBillingAnalytics($period: String, $startDate: DateTime, $endDate: DateTime) {
    billingAnalytics(period: $period, startDate: $startDate, endDate: $endDate) {
      period
      totalHours
      totalRevenue
      totalCollected
      totalOutstanding
      collectionRate
      invoicesSent
      invoicesPaid
      invoicesOverdue
      byAttorney {
        userId
        userName
        hours
        revenue
        casesWorked
      }
      byCase {
        caseId
        caseNumber
        hours
        revenue
      }
      byMonth {
        month
        hours
        revenue
        invoices
      }
    }
  }
`;

export const GET_DISCOVERY_ANALYTICS = gql`
  query GetDiscoveryAnalytics($caseId: ID!) {
    discoveryAnalytics(caseId: $caseId) {
      caseId
      totalRequests
      requestsCompleted
      requestsPending
      requestsOverdue
      completionRate
      avgDaysToCompletion
      totalDocumentsProduced
      totalDocumentsReceived
      lastUpdated
    }
  }
`;

export const GET_OUTCOME_PREDICTION = gql`
  query GetOutcomePrediction($caseId: ID!) {
    outcomePrediction(caseId: $caseId) {
      caseId
      caseNumber
      caseType
      winProbability
      settlementProbability
      estimatedSettlementAmount
      estimatedDaysToResolution
      keyFactors
      similarCases {
        id
        caseNumber
        title
        status
      }
      confidenceScore
      predictedAt
    }
  }
`;

export const GET_TREND_ANALYSIS = gql`
  query GetTrendAnalysis($metric: String!, $period: String!, $startDate: DateTime, $endDate: DateTime) {
    trendAnalysis(metric: $metric, period: $period, startDate: $startDate, endDate: $endDate) {
      metric
      period
      data {
        timestamp
        value
        label
      }
      trend
      forecast
      generatedAt
    }
  }
`;

export const GET_PERFORMANCE_METRICS = gql`
  query GetPerformanceMetrics($userId: ID, $period: String) {
    performanceMetrics(userId: $userId, period: $period) {
      userId
      userName
      totalHours
      totalRevenue
      casesHandled
      casesWon
      casesLost
      winRate
      avgCaseDuration
      utilizationRate
      period
    }
  }
`;

export const GET_MY_PERFORMANCE = gql`
  query GetMyPerformance($period: String) {
    myPerformance(period: $period) {
      userId
      userName
      totalHours
      totalRevenue
      casesHandled
      casesWon
      casesLost
      winRate
      avgCaseDuration
      utilizationRate
      period
    }
  }
`;
