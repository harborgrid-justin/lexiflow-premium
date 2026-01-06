import { api, isBackendApiEnabled } from "@/api";
import { repositoryRegistry as legacyRepositoryRegistry } from "@/services/core/RepositoryFactory";
import type { BaseEntity } from "@/types";
import { STORES } from "../db";
import {
  getDiscoveryRepository,
  getEvidenceRepository,
} from "../factories/RepositoryFactories";

export const DiscoveryDescriptors: PropertyDescriptorMap = {
  discovery: {
    get: () =>
      isBackendApiEnabled() ? api.discovery : getDiscoveryRepository(),
    enumerable: true,
  },
  evidence: {
    get: () => (isBackendApiEnabled() ? api.evidence : getEvidenceRepository()),
    enumerable: true,
  },
  legalHolds: {
    get: () =>
      isBackendApiEnabled()
        ? api.legalHolds
        : legacyRepositoryRegistry.getOrCreate<BaseEntity>(STORES.LEGAL_HOLDS),
    enumerable: true,
  },
  depositions: {
    get: () =>
      isBackendApiEnabled()
        ? api.depositions
        : legacyRepositoryRegistry.getOrCreate<BaseEntity>("depositions"),
    enumerable: true,
  },
  discoveryRequests: {
    get: () =>
      isBackendApiEnabled()
        ? api.discoveryRequests
        : legacyRepositoryRegistry.getOrCreate<BaseEntity>("discoveryRequests"),
    enumerable: true,
  },
  esiSources: {
    get: () =>
      isBackendApiEnabled()
        ? api.esiSources
        : legacyRepositoryRegistry.getOrCreate("esiSources"),
    enumerable: true,
  },
  privilegeLog: {
    get: () =>
      isBackendApiEnabled()
        ? api.privilegeLog
        : legacyRepositoryRegistry.getOrCreate(STORES.PRIVILEGE_LOG),
    enumerable: true,
  },
  productions: {
    get: () =>
      isBackendApiEnabled()
        ? api.productions
        : legacyRepositoryRegistry.getOrCreate("productions"),
    enumerable: true,
  },
  custodianInterviews: {
    get: () =>
      isBackendApiEnabled()
        ? api.custodianInterviews
        : legacyRepositoryRegistry.getOrCreate("custodianInterviews"),
    enumerable: true,
  },
  custodians: {
    get: () =>
      isBackendApiEnabled()
        ? api.custodians
        : legacyRepositoryRegistry.getOrCreate("custodians"),
    enumerable: true,
  },
};
