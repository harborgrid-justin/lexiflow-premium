import { gql } from '@apollo/client';

/**
 * GraphQL Queries for Analytics and Reporting
 */

// ============ QUERIES ============

export const GET_DASHBOARD_ANALYTICS = gql`
  query GetDashboardAnalytics($dateRange: DateRangeInput) {
    dashboardAnalytics(dateRange: $dateRange) {
      overview {
        activeCases
        totalClients
        teamMembers
        documentCount
        pendingTasks
        overdueItems
      }
      caseMetrics {
        total
        active
        closed
        byStatus {
          status
          count
          percentage
        }
        byPriority {
          priority
          count
          percentage
        }
        byPracticeArea {
          area
          count
          percentage
        }
        averageResolutionTime
        completionRate
        onTimeDeliveryRate
      }
      financialMetrics {
        totalRevenue {
          amount
          currency
        }
        collectedRevenue {
          amount
          currency
        }
        outstandingRevenue {
          amount
          currency
        }
        workInProgress {
          amount
          currency
        }
        revenueGrowth
        collectionRate
        averageRealizationRate
        revenueByMonth {
          month
          revenue {
            amount
            currency
          }
          growth
        }
      }
      productivityMetrics {
        totalHours
        billableHours
        nonBillableHours
        utilizationRate
        billableRate
        documentsProcessed
        tasksCompleted
        averageTaskCompletionTime
      }
      recentActivity {
        id
        action
        description
        createdAt
      }
      upcomingDeadlines {
        id
        title
        dueDate
        priority
      }
      alerts {
        id
        type
        severity
        title
        message
        createdAt
      }
    }
  }
`;

export const GET_TIME_SERIES_ANALYTICS = gql`
  query GetTimeSeriesAnalytics(
    $metric: String!
    $dateRange: DateRangeInput!
    $aggregation: AggregationType!
    $interval: TimePeriod!
  ) {
    timeSeriesAnalytics(
      metric: $metric
      dateRange: $dateRange
      aggregation: $aggregation
      interval: $interval
    ) {
      metric
      dataPoints {
        timestamp
        value
        metadata
      }
      aggregation
      statistics {
        mean
        median
        min
        max
        stdDev
        total
        trend
      }
    }
  }
`;

export const GET_COMPARATIVE_ANALYTICS = gql`
  query GetComparativeAnalytics(
    $metric: String!
    $currentPeriod: DateRangeInput!
    $previousPeriod: DateRangeInput!
  ) {
    comparativeAnalytics(
      metric: $metric
      currentPeriod: $currentPeriod
      previousPeriod: $previousPeriod
    ) {
      metric
      current {
        dateRange {
          startDate
          endDate
        }
        value
      }
      previous {
        dateRange {
          startDate
          endDate
        }
        value
      }
      change
      changePercentage
      trend
    }
  }
`;

export const GET_COHORT_ANALYSIS = gql`
  query GetCohortAnalysis(
    $cohortType: CohortType!
    $dateRange: DateRangeInput!
    $metrics: [String!]!
  ) {
    cohortAnalysis(
      cohortType: $cohortType
      dateRange: $dateRange
      metrics: $metrics
    ) {
      cohortType
      cohorts {
        id
        name
        startDate
        size
        metrics {
          name
          value
        }
        retention {
          period
          retentionRate
          count
        }
      }
      metrics
      dateRange {
        startDate
        endDate
      }
    }
  }
`;

export const GET_FUNNEL_ANALYTICS = gql`
  query GetFunnelAnalytics($funnelName: String!, $dateRange: DateRangeInput!) {
    funnelAnalytics(funnelName: $funnelName, dateRange: $dateRange) {
      name
      stages {
        name
        order
        count
        conversionRate
        dropoffRate
        averageTime
      }
      conversionRate
      dropoffRate
      averageTimeToConvert
    }
  }
`;

export const GET_HEATMAP_DATA = gql`
  query GetHeatmapData(
    $metric: String!
    $xAxis: String!
    $yAxis: String!
    $dateRange: DateRangeInput!
  ) {
    heatmapData(
      metric: $metric
      xAxis: $xAxis
      yAxis: $yAxis
      dateRange: $dateRange
    ) {
      title
      xAxis
      yAxis
      data
      colorScheme
    }
  }
`;

export const GET_DISTRIBUTION_ANALYTICS = gql`
  query GetDistributionAnalytics(
    $metric: String!
    $dateRange: DateRangeInput!
    $bucketCount: Int = 10
  ) {
    distributionAnalytics(
      metric: $metric
      dateRange: $dateRange
      bucketCount: $bucketCount
    ) {
      metric
      buckets {
        label
        min
        max
        count
        percentage
      }
      statistics {
        mean
        median
        mode
        stdDev
        skewness
        kurtosis
      }
    }
  }
`;

export const GET_PREDICTIVE_ANALYTICS = gql`
  query GetPredictiveAnalytics(
    $model: String!
    $horizon: Int!
    $features: JSON
  ) {
    predictiveAnalytics(model: $model, horizon: $horizon, features: $features) {
      model {
        id
        name
        type
        version
        accuracy
      }
      predictions {
        timestamp
        value
        confidence
        factors {
          name
          impact
          value
        }
      }
      accuracy
      confidence
      features {
        name
        importance
        type
      }
    }
  }
`;

export const GET_CUSTOM_REPORT = gql`
  query GetCustomReport($id: ID!) {
    customReport(id: $id) {
      id
      name
      description
      category
      metrics {
        field
        aggregation
        label
        format
      }
      dimensions {
        field
        label
        groupBy
      }
      filters {
        field
        operator
        value
      }
      chartType
      layout
      schedule {
        frequency
        time
        enabled
        nextRun
      }
      isPublic
      isFavorite
      createdAt
      lastRun
    }
  }
`;

export const GET_CUSTOM_REPORTS = gql`
  query GetCustomReports($category: String, $isFavorite: Boolean) {
    customReports(category: $category, isFavorite: $isFavorite) {
      id
      name
      description
      category
      chartType
      isFavorite
      createdAt
      lastRun
    }
  }
`;

export const EXPORT_ANALYTICS = gql`
  query ExportAnalytics(
    $reportType: AnalyticsReportType!
    $dateRange: DateRangeInput!
    $format: ExportFormat!
  ) {
    exportAnalytics(reportType: $reportType, dateRange: $dateRange, format: $format) {
      url
      format
      size
      expiresAt
    }
  }
`;

export const GET_REVENUE_PROJECTION = gql`
  query GetRevenueProjection($months: Int = 12, $includeHistorical: Boolean = true) {
    revenueProjection(months: $months, includeHistorical: $includeHistorical) {
      period
      revenue {
        amount
        currency
      }
      expenses {
        amount
        currency
      }
      profit {
        amount
        currency
      }
    }
  }
`;

// ============ MUTATIONS ============

export const CREATE_CUSTOM_REPORT = gql`
  mutation CreateCustomReport($input: CreateCustomReportInput!) {
    createCustomReport(input: $input) {
      id
      name
      description
      category
      chartType
    }
  }
`;

export const UPDATE_CUSTOM_REPORT = gql`
  mutation UpdateCustomReport($id: ID!, $input: UpdateCustomReportInput!) {
    updateCustomReport(id: $id, input: $input) {
      id
      name
      description
      updatedAt
    }
  }
`;

export const DELETE_CUSTOM_REPORT = gql`
  mutation DeleteCustomReport($id: ID!) {
    deleteCustomReport(id: $id)
  }
`;

export const RUN_CUSTOM_REPORT = gql`
  mutation RunCustomReport($id: ID!) {
    runCustomReport(id: $id) {
      id
      reportType
      data
      summary
      generatedAt
    }
  }
`;

export const SCHEDULE_REPORT = gql`
  mutation ScheduleReport($id: ID!, $schedule: ReportScheduleInput!) {
    scheduleReport(id: $id, schedule: $schedule) {
      id
      schedule {
        frequency
        time
        enabled
        nextRun
      }
    }
  }
`;

export const SHARE_REPORT = gql`
  mutation ShareReport($id: ID!, $userIds: [ID!]!) {
    shareReport(id: $id, userIds: $userIds) {
      id
      recipients {
        id
        firstName
        lastName
      }
    }
  }
`;

export const FAVORITE_REPORT = gql`
  mutation FavoriteReport($id: ID!, $favorite: Boolean!) {
    favoriteReport(id: $id, favorite: $favorite) {
      id
      isFavorite
    }
  }
`;

export const TRAIN_PREDICTION_MODEL = gql`
  mutation TrainPredictionModel($input: TrainModelInput!) {
    trainPredictionModel(input: $input) {
      id
      name
      type
      version
      accuracy
      trainedAt
    }
  }
`;

export const REFRESH_ANALYTICS_CACHE = gql`
  mutation RefreshAnalyticsCache($reportType: AnalyticsReportType) {
    refreshAnalyticsCache(reportType: $reportType)
  }
`;

// ============ SUBSCRIPTIONS ============

export const ANALYTICS_UPDATED_SUBSCRIPTION = gql`
  subscription OnAnalyticsUpdated($reportType: AnalyticsReportType) {
    analyticsUpdated(reportType: $reportType) {
      id
      reportType
      data
      summary
      generatedAt
    }
  }
`;

export const METRIC_ALERT_SUBSCRIPTION = gql`
  subscription OnMetricAlert($userId: ID!) {
    metricAlert(userId: $userId) {
      id
      type
      severity
      title
      message
      createdAt
    }
  }
`;

export const REPORT_GENERATED_SUBSCRIPTION = gql`
  subscription OnReportGenerated($reportId: ID!) {
    reportGenerated(reportId: $reportId) {
      id
      name
      lastRun
    }
  }
`;

export default {
  // Queries
  GET_DASHBOARD_ANALYTICS,
  GET_TIME_SERIES_ANALYTICS,
  GET_COMPARATIVE_ANALYTICS,
  GET_COHORT_ANALYSIS,
  GET_FUNNEL_ANALYTICS,
  GET_HEATMAP_DATA,
  GET_DISTRIBUTION_ANALYTICS,
  GET_PREDICTIVE_ANALYTICS,
  GET_CUSTOM_REPORT,
  GET_CUSTOM_REPORTS,
  EXPORT_ANALYTICS,
  GET_REVENUE_PROJECTION,

  // Mutations
  CREATE_CUSTOM_REPORT,
  UPDATE_CUSTOM_REPORT,
  DELETE_CUSTOM_REPORT,
  RUN_CUSTOM_REPORT,
  SCHEDULE_REPORT,
  SHARE_REPORT,
  FAVORITE_REPORT,
  TRAIN_PREDICTION_MODEL,
  REFRESH_ANALYTICS_CACHE,

  // Subscriptions
  ANALYTICS_UPDATED_SUBSCRIPTION,
  METRIC_ALERT_SUBSCRIPTION,
  REPORT_GENERATED_SUBSCRIPTION,
};
