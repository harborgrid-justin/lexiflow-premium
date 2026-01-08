/**
 * Profitability & Realization Analytics
 *
 * Type definitions and calculation utilities for financial metrics
 * including profitability, realization rates, WIP tracking, and
 * revenue forecasting.
 *
 * @module lib/analytics/profitability
 */

// =============================================================================
// Core Types
// =============================================================================

export type Money = number;
export type Percentage = number;
export type EntityId = string;

// =============================================================================
// Profitability Metrics
// =============================================================================

/**
 * Comprehensive profitability metrics for a given period.
 * Tracks gross and net profit margins, operating expenses, and EBITDA.
 */
export interface ProfitabilityMetrics {
  /** Total revenue before any deductions */
  grossRevenue: Money;
  /** Revenue minus direct costs */
  grossProfit: Money;
  /** Gross profit as a percentage of gross revenue (0-100) */
  grossMargin: Percentage;
  /** Operating expenses (salaries, rent, utilities, etc.) */
  operatingExpenses: Money;
  /** Profit after operating expenses */
  netProfit: Money;
  /** Net profit as a percentage of gross revenue (0-100) */
  netMargin: Percentage;
  /** Earnings Before Interest, Taxes, Depreciation, and Amortization */
  ebitda: Money;
  /** Period start date (ISO 8601) */
  periodStart?: string;
  /** Period end date (ISO 8601) */
  periodEnd?: string;
}

// =============================================================================
// Realization Metrics
// =============================================================================

/**
 * Realization metrics track the difference between standard billing
 * rates and actual collected amounts.
 */
export interface RealizationMetrics {
  /** Standard/target billing rate per hour */
  standardBillingRate: Money;
  /** Actual average billing rate achieved */
  actualBillingRate: Money;
  /** Billing realization: actual billed / standard billed (0-100) */
  billingRealization: Percentage;
  /** Amount that should have been collected */
  standardCollectionAmount: Money;
  /** Amount actually collected */
  actualCollectionAmount: Money;
  /** Collection realization: collected / billed (0-100) */
  collectionRealization: Percentage;
  /** Overall realization: billing * collection realization (0-100) */
  overallRealization: Percentage;
  /** Period for the metrics */
  periodStart?: string;
  periodEnd?: string;
}

// =============================================================================
// Work In Progress (WIP) Metrics
// =============================================================================

/**
 * Work in Progress metrics track unbilled work and aging analysis.
 */
export interface WorkInProgressMetrics {
  /** Total value of all WIP */
  totalWIP: Money;
  /** Value of unbilled time entries */
  unbilledTime: Money;
  /** Value of unbilled expenses */
  unbilledExpenses: Money;
  /** Amount billed but not yet collected */
  billedNotCollected: Money;
  /** Average age of WIP items in days */
  averageAgeDays: number;
  /** Total write-off amount in period */
  writeOffAmount: Money;
  /** Write-off as percentage of total WIP (0-100) */
  writeOffPercentage: Percentage;
  /** Breakdown by age bucket */
  agingBuckets?: WIPAgingBucket[];
}

/**
 * WIP aging bucket for detailed analysis.
 */
export interface WIPAgingBucket {
  /** Bucket label (e.g., "0-30 days", "31-60 days") */
  label: string;
  /** Minimum days in bucket */
  minDays: number;
  /** Maximum days in bucket (null for unbounded) */
  maxDays: number | null;
  /** Total amount in this bucket */
  amount: Money;
  /** Count of items in this bucket */
  count: number;
}

// =============================================================================
// Revenue Forecasting
// =============================================================================

/**
 * Revenue forecast data for a specific period.
 */
export interface RevenueForecasting {
  /** Period identifier (e.g., "2025-01", "Q1 2025") */
  month: string;
  /** Projected/forecasted revenue */
  projectedRevenue: Money;
  /** Actual revenue (0 if period is in future) */
  actualRevenue: Money;
  /** Variance in dollars (actual - projected) */
  variance: Money;
  /** Variance as percentage ((actual - projected) / projected * 100) */
  variancePercent: Percentage;
  /** Whether this is a historical or future projection */
  isForecast?: boolean;
}

/**
 * Revenue forecast summary with trends.
 */
export interface RevenueForecastSummary {
  /** Individual period forecasts */
  forecasts: RevenueForecasting[];
  /** Total projected revenue for all periods */
  totalProjected: Money;
  /** Total actual revenue for all periods */
  totalActual: Money;
  /** Overall variance */
  totalVariance: Money;
  /** Trend direction */
  trend: 'up' | 'down' | 'stable';
  /** Confidence level of forecast (0-100) */
  confidenceLevel?: Percentage;
}

// =============================================================================
// Timekeeper Performance
// =============================================================================

/**
 * Performance metrics for individual timekeepers (attorneys, paralegals, etc.)
 */
export interface TimekeeperPerformance {
  /** Timekeeper ID */
  id: EntityId;
  /** Timekeeper name */
  name: string;
  /** Professional level (e.g., "Partner", "Associate", "Paralegal") */
  level: string;
  /** Total billable hours logged */
  billableHours: number;
  /** Target billable hours for period */
  targetHours: number;
  /** Utilization rate: billable / target (0-100) */
  utilizationRate: Percentage;
  /** Standard billing rate */
  billingRate: Money;
  /** Total revenue generated */
  revenue: Money;
  /** Realization rate achieved (0-100) */
  realization: Percentage;
  /** Non-billable hours logged */
  nonBillableHours?: number;
  /** Total hours (billable + non-billable) */
  totalHours?: number;
  /** Write-down amount */
  writeDowns?: Money;
  /** Effective rate (revenue / billable hours) */
  effectiveRate?: Money;
}

// =============================================================================
// Matter Profitability
// =============================================================================

/**
 * Profitability analysis for individual matters/cases.
 */
export interface MatterProfitability {
  /** Matter ID */
  id: EntityId;
  /** Matter/case number */
  matterNumber: string;
  /** Matter description */
  matterDescription: string;
  /** Client name */
  client: string;
  /** Client ID */
  clientId?: EntityId;
  /** Total fees billed */
  totalFees: Money;
  /** Total costs/expenses */
  totalCosts: Money;
  /** Net profit (fees - costs) */
  profit: Money;
  /** Profit margin: profit / totalFees (0-100) */
  profitMargin: Percentage;
  /** Total hours worked on matter */
  hoursWorked: number;
  /** Realization rate for this matter (0-100) */
  realizationRate: Percentage;
  /** Budget vs actual comparison */
  budgetVariance?: Money;
  /** Matter type (e.g., "Litigation", "Corporate") */
  matterType?: string;
  /** Responsible attorney ID */
  responsibleAttorney?: EntityId;
  /** Responsible attorney name */
  responsibleAttorneyName?: string;
}

// =============================================================================
// Client Profitability
// =============================================================================

/**
 * Profitability analysis at the client level.
 */
export interface ClientProfitability {
  /** Client ID */
  clientId: EntityId;
  /** Client name */
  clientName: string;
  /** Total revenue from client */
  totalRevenue: Money;
  /** Total costs associated with client */
  totalCosts: Money;
  /** Net profit */
  profit: Money;
  /** Profit margin (0-100) */
  profitMargin: Percentage;
  /** Number of matters for client */
  matterCount: number;
  /** Average realization rate (0-100) */
  averageRealization: Percentage;
  /** Client lifetime value */
  lifetimeValue?: Money;
  /** Average matter value */
  averageMatterValue?: Money;
}

// =============================================================================
// Billing Analytics Filters
// =============================================================================

/**
 * Filters for billing analytics queries.
 */
export interface BillingAnalyticsFilters {
  /** Start date for period (ISO 8601) */
  startDate?: string;
  /** End date for period (ISO 8601) */
  endDate?: string;
  /** Filter by client ID */
  clientId?: EntityId;
  /** Filter by matter ID */
  matterId?: EntityId;
  /** Filter by timekeeper ID */
  timekeeperId?: EntityId;
  /** Filter by practice area */
  practiceArea?: string;
  /** Filter by office location */
  office?: string;
  /** Filter by matter type */
  matterType?: string;
  /** Group by dimension */
  groupBy?: 'client' | 'matter' | 'timekeeper' | 'practiceArea' | 'month';
  /** Comparison period type */
  comparePeriod?: 'previous_period' | 'previous_year' | 'custom';
  /** Custom comparison start date */
  compareStartDate?: string;
  /** Custom comparison end date */
  compareEndDate?: string;
}

// =============================================================================
// Calculation Utilities
// =============================================================================

/**
 * Calculate gross margin percentage.
 * @param grossProfit - Gross profit amount
 * @param grossRevenue - Gross revenue amount
 * @returns Gross margin as percentage (0-100)
 */
export function calculateGrossMargin(grossProfit: Money, grossRevenue: Money): Percentage {
  if (grossRevenue === 0) return 0;
  return roundToDecimal((grossProfit / grossRevenue) * 100, 2);
}

/**
 * Calculate net margin percentage.
 * @param netProfit - Net profit amount
 * @param grossRevenue - Gross revenue amount
 * @returns Net margin as percentage (0-100)
 */
export function calculateNetMargin(netProfit: Money, grossRevenue: Money): Percentage {
  if (grossRevenue === 0) return 0;
  return roundToDecimal((netProfit / grossRevenue) * 100, 2);
}

/**
 * Calculate billing realization rate.
 * @param actualBilled - Actual amount billed
 * @param standardBilled - Standard/expected amount to bill
 * @returns Realization rate as percentage (0-100)
 */
export function calculateBillingRealization(
  actualBilled: Money,
  standardBilled: Money
): Percentage {
  if (standardBilled === 0) return 0;
  return roundToDecimal((actualBilled / standardBilled) * 100, 2);
}

/**
 * Calculate collection realization rate.
 * @param collected - Amount collected
 * @param billed - Amount billed
 * @returns Collection realization as percentage (0-100)
 */
export function calculateCollectionRealization(
  collected: Money,
  billed: Money
): Percentage {
  if (billed === 0) return 0;
  return roundToDecimal((collected / billed) * 100, 2);
}

/**
 * Calculate overall realization (billing * collection).
 * @param billingRealization - Billing realization percentage
 * @param collectionRealization - Collection realization percentage
 * @returns Overall realization as percentage (0-100)
 */
export function calculateOverallRealization(
  billingRealization: Percentage,
  collectionRealization: Percentage
): Percentage {
  return roundToDecimal((billingRealization * collectionRealization) / 100, 2);
}

/**
 * Calculate utilization rate for a timekeeper.
 * @param billableHours - Billable hours logged
 * @param targetHours - Target billable hours
 * @returns Utilization rate as percentage (0-100)
 */
export function calculateUtilizationRate(
  billableHours: number,
  targetHours: number
): Percentage {
  if (targetHours === 0) return 0;
  return roundToDecimal((billableHours / targetHours) * 100, 2);
}

/**
 * Calculate profit margin.
 * @param profit - Profit amount
 * @param revenue - Total revenue
 * @returns Profit margin as percentage (0-100)
 */
export function calculateProfitMargin(profit: Money, revenue: Money): Percentage {
  if (revenue === 0) return 0;
  return roundToDecimal((profit / revenue) * 100, 2);
}

/**
 * Calculate variance percentage.
 * @param actual - Actual value
 * @param projected - Projected/expected value
 * @returns Variance as percentage
 */
export function calculateVariancePercent(actual: Money, projected: Money): Percentage {
  if (projected === 0) return actual > 0 ? 100 : 0;
  return roundToDecimal(((actual - projected) / projected) * 100, 2);
}

/**
 * Calculate effective hourly rate.
 * @param revenue - Total revenue
 * @param hours - Total hours worked
 * @returns Effective hourly rate
 */
export function calculateEffectiveRate(revenue: Money, hours: number): Money {
  if (hours === 0) return 0;
  return roundToDecimal(revenue / hours, 2);
}

/**
 * Calculate EBITDA from components.
 * @param netProfit - Net profit
 * @param interest - Interest expense
 * @param taxes - Tax expense
 * @param depreciation - Depreciation expense
 * @param amortization - Amortization expense
 * @returns EBITDA
 */
export function calculateEBITDA(
  netProfit: Money,
  interest: Money,
  taxes: Money,
  depreciation: Money,
  amortization: Money
): Money {
  return roundToDecimal(
    netProfit + interest + taxes + depreciation + amortization,
    2
  );
}

/**
 * Calculate write-off percentage.
 * @param writeOffAmount - Total write-off amount
 * @param totalWIP - Total WIP value
 * @returns Write-off percentage (0-100)
 */
export function calculateWriteOffPercentage(
  writeOffAmount: Money,
  totalWIP: Money
): Percentage {
  if (totalWIP === 0) return 0;
  return roundToDecimal((writeOffAmount / totalWIP) * 100, 2);
}

/**
 * Build profitability metrics from raw data.
 * @param data - Raw financial data
 * @returns Computed ProfitabilityMetrics
 */
export function buildProfitabilityMetrics(data: {
  grossRevenue: Money;
  directCosts: Money;
  operatingExpenses: Money;
  interest?: Money;
  taxes?: Money;
  depreciation?: Money;
  amortization?: Money;
  periodStart?: string;
  periodEnd?: string;
}): ProfitabilityMetrics {
  const grossProfit = data.grossRevenue - data.directCosts;
  const netProfit = grossProfit - data.operatingExpenses;
  const grossMargin = calculateGrossMargin(grossProfit, data.grossRevenue);
  const netMargin = calculateNetMargin(netProfit, data.grossRevenue);
  const ebitda = calculateEBITDA(
    netProfit,
    data.interest ?? 0,
    data.taxes ?? 0,
    data.depreciation ?? 0,
    data.amortization ?? 0
  );

  return {
    grossRevenue: data.grossRevenue,
    grossProfit,
    grossMargin,
    operatingExpenses: data.operatingExpenses,
    netProfit,
    netMargin,
    ebitda,
    periodStart: data.periodStart,
    periodEnd: data.periodEnd,
  };
}

/**
 * Build realization metrics from raw data.
 * @param data - Raw billing/collection data
 * @returns Computed RealizationMetrics
 */
export function buildRealizationMetrics(data: {
  standardBillingRate: Money;
  actualBillingRate: Money;
  standardCollectionAmount: Money;
  actualCollectionAmount: Money;
  periodStart?: string;
  periodEnd?: string;
}): RealizationMetrics {
  const billingRealization = calculateBillingRealization(
    data.actualBillingRate,
    data.standardBillingRate
  );
  const collectionRealization = calculateCollectionRealization(
    data.actualCollectionAmount,
    data.standardCollectionAmount
  );
  const overallRealization = calculateOverallRealization(
    billingRealization,
    collectionRealization
  );

  return {
    standardBillingRate: data.standardBillingRate,
    actualBillingRate: data.actualBillingRate,
    billingRealization,
    standardCollectionAmount: data.standardCollectionAmount,
    actualCollectionAmount: data.actualCollectionAmount,
    collectionRealization,
    overallRealization,
    periodStart: data.periodStart,
    periodEnd: data.periodEnd,
  };
}

/**
 * Build WIP metrics from raw data.
 * @param data - Raw WIP data
 * @returns Computed WorkInProgressMetrics
 */
export function buildWIPMetrics(data: {
  unbilledTime: Money;
  unbilledExpenses: Money;
  billedNotCollected: Money;
  averageAgeDays: number;
  writeOffAmount: Money;
  agingBuckets?: WIPAgingBucket[];
}): WorkInProgressMetrics {
  const totalWIP = data.unbilledTime + data.unbilledExpenses + data.billedNotCollected;
  const writeOffPercentage = calculateWriteOffPercentage(data.writeOffAmount, totalWIP);

  return {
    totalWIP,
    unbilledTime: data.unbilledTime,
    unbilledExpenses: data.unbilledExpenses,
    billedNotCollected: data.billedNotCollected,
    averageAgeDays: data.averageAgeDays,
    writeOffAmount: data.writeOffAmount,
    writeOffPercentage,
    agingBuckets: data.agingBuckets,
  };
}

/**
 * Build timekeeper performance metrics.
 * @param data - Raw timekeeper data
 * @returns Computed TimekeeperPerformance
 */
export function buildTimekeeperPerformance(data: {
  id: EntityId;
  name: string;
  level: string;
  billableHours: number;
  targetHours: number;
  billingRate: Money;
  revenue: Money;
  standardRevenue: Money;
  nonBillableHours?: number;
  writeDowns?: Money;
}): TimekeeperPerformance {
  const utilizationRate = calculateUtilizationRate(data.billableHours, data.targetHours);
  const realization = calculateBillingRealization(data.revenue, data.standardRevenue);
  const totalHours = data.billableHours + (data.nonBillableHours ?? 0);
  const effectiveRate = calculateEffectiveRate(data.revenue, data.billableHours);

  return {
    id: data.id,
    name: data.name,
    level: data.level,
    billableHours: data.billableHours,
    targetHours: data.targetHours,
    utilizationRate,
    billingRate: data.billingRate,
    revenue: data.revenue,
    realization,
    nonBillableHours: data.nonBillableHours,
    totalHours,
    writeDowns: data.writeDowns,
    effectiveRate,
  };
}

/**
 * Build matter profitability metrics.
 * @param data - Raw matter data
 * @returns Computed MatterProfitability
 */
export function buildMatterProfitability(data: {
  id: EntityId;
  matterNumber: string;
  matterDescription: string;
  client: string;
  clientId?: EntityId;
  totalFees: Money;
  totalCosts: Money;
  hoursWorked: number;
  standardRevenue: Money;
  budgetAmount?: Money;
  matterType?: string;
  responsibleAttorney?: EntityId;
  responsibleAttorneyName?: string;
}): MatterProfitability {
  const profit = data.totalFees - data.totalCosts;
  const profitMargin = calculateProfitMargin(profit, data.totalFees);
  const realizationRate = calculateBillingRealization(data.totalFees, data.standardRevenue);
  const budgetVariance = data.budgetAmount
    ? data.totalFees - data.budgetAmount
    : undefined;

  return {
    id: data.id,
    matterNumber: data.matterNumber,
    matterDescription: data.matterDescription,
    client: data.client,
    clientId: data.clientId,
    totalFees: data.totalFees,
    totalCosts: data.totalCosts,
    profit,
    profitMargin,
    hoursWorked: data.hoursWorked,
    realizationRate,
    budgetVariance,
    matterType: data.matterType,
    responsibleAttorney: data.responsibleAttorney,
    responsibleAttorneyName: data.responsibleAttorneyName,
  };
}

// =============================================================================
// Formatting Utilities
// =============================================================================

/**
 * Format currency value for display.
 * @param amount - Amount to format
 * @param currency - Currency code (default: USD)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: Money, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format currency with decimal precision.
 * @param amount - Amount to format
 * @param currency - Currency code (default: USD)
 * @returns Formatted currency string with decimals
 */
export function formatCurrencyPrecise(amount: Money, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format percentage for display.
 * @param value - Percentage value (0-100)
 * @param decimals - Decimal places (default: 1)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: Percentage, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format hours for display.
 * @param hours - Number of hours
 * @returns Formatted hours string
 */
export function formatHours(hours: number): string {
  return `${hours.toFixed(1)}h`;
}

/**
 * Format number with commas.
 * @param value - Number to format
 * @returns Formatted number string
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

/**
 * Round number to specified decimal places.
 * @param value - Value to round
 * @param decimals - Number of decimal places
 * @returns Rounded value
 */
export function roundToDecimal(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

// =============================================================================
// Trend Analysis Utilities
// =============================================================================

/**
 * Determine trend direction from values.
 * @param current - Current value
 * @param previous - Previous value
 * @param threshold - Threshold for "stable" (default: 1%)
 * @returns Trend direction
 */
export function determineTrend(
  current: number,
  previous: number,
  threshold = 1
): 'up' | 'down' | 'stable' {
  if (previous === 0) {
    return current > 0 ? 'up' : 'stable';
  }
  const percentChange = ((current - previous) / Math.abs(previous)) * 100;
  if (percentChange > threshold) return 'up';
  if (percentChange < -threshold) return 'down';
  return 'stable';
}

/**
 * Calculate period-over-period change.
 * @param current - Current period value
 * @param previous - Previous period value
 * @returns Change information
 */
export function calculatePeriodChange(
  current: number,
  previous: number
): {
  absolute: number;
  percent: number;
  trend: 'up' | 'down' | 'stable';
} {
  const absolute = current - previous;
  const percent = previous === 0 ? (current > 0 ? 100 : 0) : roundToDecimal(
    (absolute / Math.abs(previous)) * 100,
    2
  );
  const trend = determineTrend(current, previous);

  return { absolute, percent, trend };
}

// =============================================================================
// Default/Mock Data Generators (for development/testing)
// =============================================================================

/**
 * Generate default profitability metrics.
 */
export function getDefaultProfitabilityMetrics(): ProfitabilityMetrics {
  return {
    grossRevenue: 0,
    grossProfit: 0,
    grossMargin: 0,
    operatingExpenses: 0,
    netProfit: 0,
    netMargin: 0,
    ebitda: 0,
  };
}

/**
 * Generate default realization metrics.
 */
export function getDefaultRealizationMetrics(): RealizationMetrics {
  return {
    standardBillingRate: 0,
    actualBillingRate: 0,
    billingRealization: 0,
    standardCollectionAmount: 0,
    actualCollectionAmount: 0,
    collectionRealization: 0,
    overallRealization: 0,
  };
}

/**
 * Generate default WIP metrics.
 */
export function getDefaultWIPMetrics(): WorkInProgressMetrics {
  return {
    totalWIP: 0,
    unbilledTime: 0,
    unbilledExpenses: 0,
    billedNotCollected: 0,
    averageAgeDays: 0,
    writeOffAmount: 0,
    writeOffPercentage: 0,
  };
}

/**
 * Generate default revenue forecast.
 */
export function getDefaultRevenueForecast(): RevenueForecasting[] {
  return [];
}

// =============================================================================
// Type Guards
// =============================================================================

/**
 * Type guard for ProfitabilityMetrics.
 */
export function isProfitabilityMetrics(obj: unknown): obj is ProfitabilityMetrics {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'grossRevenue' in obj &&
    'grossProfit' in obj &&
    'grossMargin' in obj &&
    'operatingExpenses' in obj &&
    'netProfit' in obj &&
    'netMargin' in obj &&
    'ebitda' in obj
  );
}

/**
 * Type guard for RealizationMetrics.
 */
export function isRealizationMetrics(obj: unknown): obj is RealizationMetrics {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'standardBillingRate' in obj &&
    'actualBillingRate' in obj &&
    'billingRealization' in obj &&
    'collectionRealization' in obj &&
    'overallRealization' in obj
  );
}

/**
 * Type guard for TimekeeperPerformance.
 */
export function isTimekeeperPerformance(obj: unknown): obj is TimekeeperPerformance {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    'billableHours' in obj &&
    'utilizationRate' in obj &&
    'realization' in obj
  );
}

/**
 * Type guard for MatterProfitability.
 */
export function isMatterProfitability(obj: unknown): obj is MatterProfitability {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'matterNumber' in obj &&
    'totalFees' in obj &&
    'profitMargin' in obj &&
    'realizationRate' in obj
  );
}
