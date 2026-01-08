'use server';

/**
 * Billing Analytics Server Actions
 *
 * Server-side actions for fetching profitability, realization, WIP,
 * and other financial analytics metrics.
 *
 * @module billing/analytics/actions
 */

import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import type {
  ProfitabilityMetrics,
  RealizationMetrics,
  WorkInProgressMetrics,
  RevenueForecasting,
  TimekeeperPerformance,
  MatterProfitability,
  ClientProfitability,
  BillingAnalyticsFilters,
  getDefaultProfitabilityMetrics,
  getDefaultRealizationMetrics,
  getDefaultWIPMetrics,
} from '@/lib/analytics/profitability';
import type { ActionResult } from '../types';

// =============================================================================
// Cache Tags
// =============================================================================

const CACHE_TAGS = {
  PROFITABILITY: 'billing-analytics-profitability',
  REALIZATION: 'billing-analytics-realization',
  WIP: 'billing-analytics-wip',
  FORECAST: 'billing-analytics-forecast',
  TIMEKEEPER_PERFORMANCE: 'billing-analytics-timekeeper',
  MATTER_PROFITABILITY: 'billing-analytics-matter',
  CLIENT_PROFITABILITY: 'billing-analytics-client',
} as const;

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Build query string from filters object
 */
function buildQueryString(filters: Record<string, unknown>): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });
  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

// =============================================================================
// Profitability Metrics Actions
// =============================================================================

/**
 * Fetch profitability metrics for a given period.
 * Returns gross/net profit, margins, operating expenses, and EBITDA.
 *
 * @param filters - Optional filters for period, client, matter, etc.
 * @returns ActionResult with ProfitabilityMetrics
 */
export async function getProfitabilityMetrics(
  filters?: BillingAnalyticsFilters
): Promise<ActionResult<ProfitabilityMetrics>> {
  try {
    const queryString = filters ? buildQueryString(filters) : '';
    const metrics = await apiFetch<ProfitabilityMetrics>(
      `${API_ENDPOINTS.BILLING.PROFITABILITY}${queryString}`,
      {
        next: {
          tags: [CACHE_TAGS.PROFITABILITY],
          revalidate: 300, // 5 minutes - financial data changes less frequently
        },
      }
    );
    return { success: true, data: metrics };
  } catch (error) {
    console.error('Failed to fetch profitability metrics:', error);
    // Return default metrics on error for graceful degradation
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch profitability metrics',
      data: {
        grossRevenue: 0,
        grossProfit: 0,
        grossMargin: 0,
        operatingExpenses: 0,
        netProfit: 0,
        netMargin: 0,
        ebitda: 0,
      },
    };
  }
}

// =============================================================================
// Realization Metrics Actions
// =============================================================================

/**
 * Fetch realization metrics for a given period.
 * Returns billing and collection realization rates.
 *
 * @param filters - Optional filters for period, client, matter, etc.
 * @returns ActionResult with RealizationMetrics
 */
export async function getRealizationMetrics(
  filters?: BillingAnalyticsFilters
): Promise<ActionResult<RealizationMetrics>> {
  try {
    const queryString = filters ? buildQueryString(filters) : '';
    const metrics = await apiFetch<RealizationMetrics>(
      `${API_ENDPOINTS.BILLING.REALIZATION}${queryString}`,
      {
        next: {
          tags: [CACHE_TAGS.REALIZATION],
          revalidate: 300,
        },
      }
    );
    return { success: true, data: metrics };
  } catch (error) {
    console.error('Failed to fetch realization metrics:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch realization metrics',
      data: {
        standardBillingRate: 0,
        actualBillingRate: 0,
        billingRealization: 0,
        standardCollectionAmount: 0,
        actualCollectionAmount: 0,
        collectionRealization: 0,
        overallRealization: 0,
      },
    };
  }
}

// =============================================================================
// Work In Progress (WIP) Metrics Actions
// =============================================================================

/**
 * Fetch WIP metrics including unbilled time, expenses, and aging.
 *
 * @param filters - Optional filters for period, client, matter, etc.
 * @returns ActionResult with WorkInProgressMetrics
 */
export async function getWIPMetrics(
  filters?: BillingAnalyticsFilters
): Promise<ActionResult<WorkInProgressMetrics>> {
  try {
    const queryString = filters ? buildQueryString(filters) : '';
    const metrics = await apiFetch<WorkInProgressMetrics>(
      `${API_ENDPOINTS.BILLING.WIP}${queryString}`,
      {
        next: {
          tags: [CACHE_TAGS.WIP],
          revalidate: 120, // 2 minutes - WIP changes more frequently
        },
      }
    );
    return { success: true, data: metrics };
  } catch (error) {
    console.error('Failed to fetch WIP metrics:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch WIP metrics',
      data: {
        totalWIP: 0,
        unbilledTime: 0,
        unbilledExpenses: 0,
        billedNotCollected: 0,
        averageAgeDays: 0,
        writeOffAmount: 0,
        writeOffPercentage: 0,
      },
    };
  }
}

// =============================================================================
// Revenue Forecast Actions
// =============================================================================

/**
 * Fetch revenue forecast data with projected vs actual comparison.
 *
 * @param filters - Optional filters for period range
 * @returns ActionResult with RevenueForecasting array
 */
export async function getRevenueForecast(
  filters?: BillingAnalyticsFilters
): Promise<ActionResult<RevenueForecasting[]>> {
  try {
    const queryString = filters ? buildQueryString(filters) : '';
    const forecast = await apiFetch<RevenueForecasting[]>(
      `${API_ENDPOINTS.BILLING.FORECAST}${queryString}`,
      {
        next: {
          tags: [CACHE_TAGS.FORECAST],
          revalidate: 600, // 10 minutes - forecasts are computed less frequently
        },
      }
    );
    return { success: true, data: forecast };
  } catch (error) {
    console.error('Failed to fetch revenue forecast:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch revenue forecast',
      data: [],
    };
  }
}

// =============================================================================
// Timekeeper Performance Actions
// =============================================================================

/**
 * Fetch timekeeper performance metrics including utilization and realization.
 *
 * @param filters - Optional filters for period, specific timekeeper, etc.
 * @returns ActionResult with TimekeeperPerformance array
 */
export async function getTimekeeperPerformance(
  filters?: BillingAnalyticsFilters
): Promise<ActionResult<TimekeeperPerformance[]>> {
  try {
    const queryString = filters ? buildQueryString(filters) : '';
    const performance = await apiFetch<TimekeeperPerformance[]>(
      `${API_ENDPOINTS.BILLING.TIMEKEEPER_PERFORMANCE}${queryString}`,
      {
        next: {
          tags: [CACHE_TAGS.TIMEKEEPER_PERFORMANCE],
          revalidate: 300,
        },
      }
    );
    return { success: true, data: performance };
  } catch (error) {
    console.error('Failed to fetch timekeeper performance:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch timekeeper performance',
      data: [],
    };
  }
}

// =============================================================================
// Matter Profitability Actions
// =============================================================================

/**
 * Fetch matter profitability analysis.
 *
 * @param filters - Optional filters for client, matter type, etc.
 * @returns ActionResult with MatterProfitability array
 */
export async function getMatterProfitability(
  filters?: BillingAnalyticsFilters
): Promise<ActionResult<MatterProfitability[]>> {
  try {
    const queryString = filters ? buildQueryString(filters) : '';
    const profitability = await apiFetch<MatterProfitability[]>(
      `${API_ENDPOINTS.BILLING.MATTER_PROFITABILITY}${queryString}`,
      {
        next: {
          tags: [CACHE_TAGS.MATTER_PROFITABILITY],
          revalidate: 300,
        },
      }
    );
    return { success: true, data: profitability };
  } catch (error) {
    console.error('Failed to fetch matter profitability:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch matter profitability',
      data: [],
    };
  }
}

// =============================================================================
// Client Profitability Actions
// =============================================================================

/**
 * Fetch client profitability analysis.
 *
 * @param filters - Optional filters for specific clients, period, etc.
 * @returns ActionResult with ClientProfitability array
 */
export async function getClientProfitability(
  filters?: BillingAnalyticsFilters
): Promise<ActionResult<ClientProfitability[]>> {
  try {
    const queryString = filters ? buildQueryString(filters) : '';
    const profitability = await apiFetch<ClientProfitability[]>(
      `${API_ENDPOINTS.BILLING.CLIENT_PROFITABILITY}${queryString}`,
      {
        next: {
          tags: [CACHE_TAGS.CLIENT_PROFITABILITY],
          revalidate: 300,
        },
      }
    );
    return { success: true, data: profitability };
  } catch (error) {
    console.error('Failed to fetch client profitability:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch client profitability',
      data: [],
    };
  }
}

// =============================================================================
// Combined Analytics Actions
// =============================================================================

/**
 * Fetch all analytics metrics in parallel for dashboard display.
 * Provides a comprehensive view of firm financial health.
 *
 * @param filters - Optional filters applied to all metrics
 * @returns Combined analytics data
 */
export async function getAllAnalyticsMetrics(filters?: BillingAnalyticsFilters): Promise<{
  profitability: ActionResult<ProfitabilityMetrics>;
  realization: ActionResult<RealizationMetrics>;
  wip: ActionResult<WorkInProgressMetrics>;
  forecast: ActionResult<RevenueForecasting[]>;
  timekeeperPerformance: ActionResult<TimekeeperPerformance[]>;
  matterProfitability: ActionResult<MatterProfitability[]>;
}> {
  const [profitability, realization, wip, forecast, timekeeperPerformance, matterProfitability] =
    await Promise.all([
      getProfitabilityMetrics(filters),
      getRealizationMetrics(filters),
      getWIPMetrics(filters),
      getRevenueForecast(filters),
      getTimekeeperPerformance(filters),
      getMatterProfitability(filters),
    ]);

  return {
    profitability,
    realization,
    wip,
    forecast,
    timekeeperPerformance,
    matterProfitability,
  };
}

// =============================================================================
// Analytics Summary Action
// =============================================================================

/**
 * Get a quick summary of key financial metrics for cards/widgets.
 *
 * @param filters - Optional period filters
 * @returns Key metrics summary
 */
export async function getAnalyticsSummary(filters?: BillingAnalyticsFilters): Promise<
  ActionResult<{
    grossRevenue: number;
    netProfit: number;
    netMargin: number;
    billingRealization: number;
    collectionRealization: number;
    totalWIP: number;
    averageUtilization: number;
  }>
> {
  try {
    const [profitabilityResult, realizationResult, wipResult, timekeeperResult] =
      await Promise.all([
        getProfitabilityMetrics(filters),
        getRealizationMetrics(filters),
        getWIPMetrics(filters),
        getTimekeeperPerformance(filters),
      ]);

    const profitability = profitabilityResult.data;
    const realization = realizationResult.data;
    const wip = wipResult.data;
    const timekeepers = timekeeperResult.data || [];

    // Calculate average utilization across all timekeepers
    const averageUtilization =
      timekeepers.length > 0
        ? timekeepers.reduce((sum, tk) => sum + tk.utilizationRate, 0) / timekeepers.length
        : 0;

    return {
      success: true,
      data: {
        grossRevenue: profitability?.grossRevenue ?? 0,
        netProfit: profitability?.netProfit ?? 0,
        netMargin: profitability?.netMargin ?? 0,
        billingRealization: realization?.billingRealization ?? 0,
        collectionRealization: realization?.collectionRealization ?? 0,
        totalWIP: wip?.totalWIP ?? 0,
        averageUtilization,
      },
    };
  } catch (error) {
    console.error('Failed to fetch analytics summary:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch analytics summary',
    };
  }
}
