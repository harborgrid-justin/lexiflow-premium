import { communicationsApi, isBackendApiEnabled } from "@/api";
import { repositoryRegistry as legacyRepositoryRegistry } from "@/services/core/RepositoryFactory";
import { CalendarService } from "@/services/domain/CalendarDomain";
import { CorrespondenceService } from "@/services/domain/CommunicationDomain";

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
    get: () =>
      import("@/services/domain/NotificationDomain").then(
        (m) => m.NotificationService
      ),
    enumerable: true,
  },
  calendar: {
    get: () => CalendarService,
    enumerable: true,
  },
  collaboration: {
    get: () =>
      import("@/services/domain/CollaborationDomain").then(
        (m) => m.CollaborationService
      ),
    enumerable: true,
  },
  messenger: {
    get: () =>
      import("@/services/domain/MessengerDomain").then(
        (m) => m.MessengerService
      ),
    enumerable: true,
  },
};
