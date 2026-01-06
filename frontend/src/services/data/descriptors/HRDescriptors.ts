import { api, authApi, isBackendApiEnabled, litigationApi } from "@/api";
import { repositoryRegistry as legacyRepositoryRegistry } from "@/services/core/RepositoryFactory";
import { STORES } from "../db";
import { getHRRepository } from "../factories/RepositoryFactories";

export const HRDescriptors: PropertyDescriptorMap = {
  hr: {
    get: () => (isBackendApiEnabled() && api.hr ? api.hr : getHRRepository()),
    enumerable: true,
  },
  users: {
    get: () =>
      isBackendApiEnabled()
        ? authApi.users
        : legacyRepositoryRegistry.getOrCreate(STORES.USERS),
    enumerable: true,
  },
  groups: {
    get: () =>
      isBackendApiEnabled()
        ? (authApi as unknown as { groups: unknown }).groups
        : legacyRepositoryRegistry.getOrCreate("groups"),
    enumerable: true,
  },
  caseTeams: {
    get: () =>
      isBackendApiEnabled()
        ? litigationApi.caseTeams
        : legacyRepositoryRegistry.getOrCreate("caseTeams"),
    enumerable: true,
  },
  casePhases: {
    get: () =>
      isBackendApiEnabled()
        ? litigationApi.casePhases
        : legacyRepositoryRegistry.getOrCreate(STORES.PHASES),
    enumerable: true,
  },
};
