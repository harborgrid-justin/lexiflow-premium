/**
 * Communications Domain API Services
 * Clients, correspondence, messaging, notifications
 */

import { ClientsApiService } from '@/api';
import { CommunicationsApiService } from '@/api';
import { CorrespondenceApiService } from '@/api';
import { MessagingApiService } from '@/api';
import { NotificationsApiService } from '@/api';

// Export singleton instances
export const communicationsApi = {
  clients: new ClientsApiService(),
  communications: new CommunicationsApiService(),
  correspondence: new CorrespondenceApiService(),
  messaging: new MessagingApiService(),
  notifications: new NotificationsApiService(),
} as const;
