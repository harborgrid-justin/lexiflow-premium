/**
 * Trial Management Domain API Services
 * Trial events, exhibits, witness preparation
 */

import { TrialApiService } from '@/api';
import { ExhibitsApiService } from '@/api';

// Export service classes
export {
  TrialApiService,
  ExhibitsApiService,
};

// Export singleton instances
export const trialApi = {
  trial: new TrialApiService(),
  exhibits: new ExhibitsApiService(),
} as const;
