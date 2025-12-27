/**
 * HR & Personnel Domain API Services
 * Human resources management
 */

import { HRApiService } from '@/api';

// Export singleton instances
export const hrApi = {
  hr: new HRApiService(),
} as const;
