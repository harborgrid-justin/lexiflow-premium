import { communicationsApi } from "@/api";
import { CalendarService } from "@/services/domain/CalendarDomain";
import { CollaborationService } from "@/services/domain/CollaborationDomain";
import { CorrespondenceService } from "@/services/domain/CommunicationDomain";
import { MessengerService } from "@/services/domain/MessengerDomain";
import { NotificationService } from "@/services/domain/NotificationDomain";

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
