import { api } from "@/api";

export const TrialDescriptors: PropertyDescriptorMap = {
  trial: {
    get: () => api.trial,
    enumerable: true,
  },
  exhibits: {
    get: () => api.exhibits,
    enumerable: true,
  },
  witnesses: {
    get: () => api.witnesses,
    enumerable: true,
  },
  examinations: {
    get: () => api.examinations,
    enumerable: true,
  },
};
