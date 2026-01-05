/**
 * Discovery Enhanced API
 * Consolidated API for e-discovery management
 * Exports all discovery-related API services
 */

export * from './collections-api';
export * from './processing-api';
export * from './review-api';
export * from './production-sets-api';
export * from './timeline-api';

import { collectionsApi } from './collections-api';
import { processingApi } from './processing-api';
import { reviewApi } from './review-api';
import { productionSetsApi } from './production-sets-api';
import { timelineApi } from './timeline-api';

/**
 * Unified discovery API service
 * Provides access to all e-discovery operations
 */
export const discoveryEnhancedApi = {
  collections: collectionsApi,
  processing: processingApi,
  review: reviewApi,
  productionSets: productionSetsApi,
  timeline: timelineApi,
};

export default discoveryEnhancedApi;
