import {
  api,
  integrationsApi,
  isBackendApiEnabled,
  litigationApi,
} from "@/api";
import { repositoryRegistry as legacyRepositoryRegistry } from "@/services/core/RepositoryFactory";
import {
  getClientsRepository,
  getOrganizationsRepository,
} from "../factories/RepositoryFactories";

export const ClientEntitiesDescriptors: PropertyDescriptorMap = {
  clients: {
    get: () => (isBackendApiEnabled() ? api.clients : getClientsRepository()),
    enumerable: true,
  },
  parties: {
    get: () =>
      isBackendApiEnabled()
        ? litigationApi.parties
        : legacyRepositoryRegistry.getOrCreate("parties"),
    enumerable: true,
  },
  organizations: {
    get: () =>
      isBackendApiEnabled()
        ? integrationsApi.organizations
        : getOrganizationsRepository(),
    enumerable: true,
  },
  entities: {
    get: () =>
      isBackendApiEnabled()
        ? api.legalEntities
        : legacyRepositoryRegistry.getOrCreate("entities"),
    enumerable: true,
  },
};
