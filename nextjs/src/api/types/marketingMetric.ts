/**
 * Marketing Metrics API Mock Data
 * 
 * @deprecated MOCK DATA - DO NOT IMPORT DIRECTLY
 * Use DataService.marketing.getMetrics() with queryKeys.marketing.metrics() instead.
 * This constant is only for seeding and testing purposes.
 */

import { MarketingMetric } from '@/types/data-infrastructure';

/**
 * @deprecated MOCK DATA - Use DataService.marketing instead
 */
export const MOCK_METRICS: MarketingMetric[] = [
  { source: 'Client Referral', leads: 45, conversions: 20, revenue: 250000, roi: 500 },
  { source: 'Website / SEO', leads: 120, conversions: 5, revenue: 45000, roi: 150 },
  { source: 'LinkedIn', leads: 30, conversions: 2, revenue: 15000, roi: 80 },
  { source: 'Legal Directory', leads: 15, conversions: 8, revenue: 120000, roi: 300 },
];
