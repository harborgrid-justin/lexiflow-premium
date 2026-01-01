/**
 * Communications API Services
 * Client communications, correspondence, messaging, and notifications
 */

export { ClientsApiService, CLIENTS_QUERY_KEYS, type ClientFilters, type ClientStatistics } from './clients-api';
export { CommunicationsApiService, type Communication, type CommunicationFilters } from './communications-api';
export { CorrespondenceApiService, CORRESPONDENCE_QUERY_KEYS, type Correspondence, type CorrespondenceFilters } from './correspondence-api';
export { MessagingApiService, type Message, type MessageFilters, type Conversation, type Contact } from './messaging-api';
export { NotificationsApiService, NOTIFICATIONS_QUERY_KEYS, type ApiNotification, type ApiNotificationFilters } from './notifications-api';
