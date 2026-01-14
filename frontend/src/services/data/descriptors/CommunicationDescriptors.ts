import { communicationsApi } from '@/lib/frontend-api';
import { CalendarService } from "@/services/domain/calendar.service";
import { CollaborationService } from "@/services/domain/collaboration.service";
import { CorrespondenceService } from "@/services/domain/communication.service";
import { MessengerService } from "@/services/domain/messenger.service";
import { NotificationService } from "@/services/domain/notification.service";

export const CommunicationDescriptors: PropertyDescriptorMap = {
  communications: {
    get: () => communicationsApi.communications,
    enumerable: true,
  },
  correspondence: { get: () => CorrespondenceService, enumerable: true },
  messaging: {
    get: () => communicationsApi.messaging,
    enumerable: true,
  },
  notifications: {
    get: () => NotificationService,
    enumerable: true,
  },
  calendar: {
    get: () => CalendarService,
    enumerable: true,
  },
  collaboration: {
    get: () => CollaborationService,
    enumerable: true,
  },
  messenger: {
    get: () => MessengerService,
    enumerable: true,
  },
};
