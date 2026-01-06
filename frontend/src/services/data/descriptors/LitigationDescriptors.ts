import { api, isBackendApiEnabled } from "@/api";
import {
  getIntegratedCaseRepository,
  getIntegratedDocketRepository,
  getIntegratedDocumentRepository,
  getMotionsRepository,
  getPleadingRepository,
} from "../factories/RepositoryFactories";

export const LitigationDescriptors: PropertyDescriptorMap = {
  cases: {
    get: () =>
      isBackendApiEnabled() ? api.cases : getIntegratedCaseRepository(),
    enumerable: true,
  },
  docket: {
    get: () =>
      isBackendApiEnabled() ? api.docket : getIntegratedDocketRepository(),
    enumerable: true,
  },
  documents: {
    get: () =>
      isBackendApiEnabled() ? api.documents : getIntegratedDocumentRepository(),
    enumerable: true,
  },
  drafting: { get: () => api.drafting, enumerable: true },
  pleadings: {
    get: () =>
      isBackendApiEnabled() ? api.pleadings : getPleadingRepository(),
    enumerable: true,
  },
  motions: {
    get: () => (isBackendApiEnabled() ? api.motions : getMotionsRepository()),
    enumerable: true,
  },
};
