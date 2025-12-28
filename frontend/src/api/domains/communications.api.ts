/**
 * Communications Domain API Services
 * Clients, correspondence, messaging, notifications
 */

import { ClientsApiService } from '../communications/clients-api';
import { CommunicationsApiService } from '../communications/communications-api';
import { CorrespondenceApiService } from '../communications/correspondence-api';
import { MessagingApiService } from '../communications/messaging-api';
import { NotificationsApiService } from '../communications/notifications-api';

// Export singleton instances
export const communicationsApi = {
  clients: new ClientsApiService(),
  communications: new CommunicationsApiService(),
  correspondence: new CorrespondenceApiService(),
  messaging: new MessagingApiService(),
  notifications: new NotificationsApiService(),
} as const;
