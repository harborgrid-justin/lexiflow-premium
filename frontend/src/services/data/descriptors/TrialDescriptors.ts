import { api, isBackendApiEnabled } from "@/api";
import { repositoryRegistry as legacyRepositoryRegistry } from "@/services/core/RepositoryFactory";
import { STORES } from "../db";
import {
  getTrialRepository,
  getWitnessesRepository,
} from "../factories/RepositoryFactories";

export const TrialDescriptors: PropertyDescriptorMap = {
  trial: {
    get: () => (isBackendApiEnabled() ? api.trial : getTrialRepository()),
    enumerable: true,
  },
  exhibits: {
    get: () =>
      isBackendApiEnabled()
        ? api.exhibits
        : legacyRepositoryRegistry.getOrCreate(STORES.EXHIBITS),
    enumerable: true,
  },
  witnesses: {
    get: () =>
      isBackendApiEnabled() ? api.witnesses : getWitnessesRepository(),
    enumerable: true,
  },
  examinations: {
    get: () =>
      isBackendApiEnabled()
        ? api.examinations
        : legacyRepositoryRegistry.getOrCreate("examinations"),
    enumerable: true,
  },
};
