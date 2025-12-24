/**
 * Communications Domain API Services
 * Clients, correspondence, messaging, notifications
 */

import { ClientsApiService } from '../clients-api';
import { CommunicationsApiService } from '../communications-api';
import { CorrespondenceApiService } from '../correspondence-api';
import { MessagingApiService } from '../messaging-api';
import { NotificationsApiService } from '../notifications-api';

// Export service classes
export {
  ClientsApiService,
  CommunicationsApiService,
  CorrespondenceApiService,
  MessagingApiService,
  NotificationsApiService,
};

// Export singleton instances
export const communicationsApi = {
  clients: new ClientsApiService(),
  communications: new CommunicationsApiService(),
  correspondence: new CorrespondenceApiService(),
  messaging: new MessagingApiService(),
  notifications: new NotificationsApiService(),
} as const;
