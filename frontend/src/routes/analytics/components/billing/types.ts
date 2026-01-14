export interface BillingMetrics {
  totalRevenue: number;
  collectedRevenue: number;
  outstandingAR: number;
  realizationRate: number;
  collectionRate: number;
  wipTotal: number;
  avgDaysToCollect: number;
}

export interface BillingAnalyticsLoaderData {
  metrics: BillingMetrics;
}
