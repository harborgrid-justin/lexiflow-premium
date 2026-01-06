import { communicationsApi, isBackendApiEnabled } from "@/api";
import { repositoryRegistry as legacyRepositoryRegistry } from "@/services/core/RepositoryFactory";
import { CalendarService } from "@/services/domain/CalendarDomain";
import { CollaborationService } from "@/services/domain/CollaborationDomain";
import { CorrespondenceService } from "@/services/domain/CommunicationDomain";
import { MessengerService } from "@/services/domain/MessengerDomain";
import { NotificationService } from "@/services/domain/NotificationDomain";

export const CommunicationDescriptors: PropertyDescriptorMap = {
  communications: {
    get: () =>
      isBackendApiEnabled()
        ? communicationsApi.communications
        : legacyRepositoryRegistry.getOrCreate("communications"),
    enumerable: true,
  },
  correspondence: { get: () => CorrespondenceService, enumerable: true },
  messaging: {
    get: () =>
      isBackendApiEnabled()
        ? communicationsApi.messaging
        : legacyRepositoryRegistry.getOrCreate("messages"),
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
