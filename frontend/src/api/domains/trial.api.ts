/**
 * Trial Management Domain API Services
 * Trial events, exhibits, witness preparation
 */

import { TrialApiService } from '../trial/trial-api';
import { ExhibitsApiService } from '../trial/exhibits-api';

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
