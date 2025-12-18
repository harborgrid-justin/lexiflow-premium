/**
 * HR & Personnel Domain API Services
 * Human resources management
 */

import { HRApiService } from '../hr-api';

// Export service classes
export {
  HRApiService,
};

// Export singleton instances
export const hrApi = {
  hr: new HRApiService(),
} as const;
