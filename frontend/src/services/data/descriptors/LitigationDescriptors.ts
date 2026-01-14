import { api } from '@/lib/frontend-api';

export const LitigationDescriptors: PropertyDescriptorMap = {
  cases: {
    get: () => api.cases,
    enumerable: true,
  },
  docket: {
    get: () => api.docket,
    enumerable: true,
  },
  documents: {
    get: () => api.documents,
    enumerable: true,
  },
  drafting: { get: () => api.drafting, enumerable: true },
  pleadings: {
    get: () => api.pleadings,
    enumerable: true,
  },
  motions: {
    get: () => api.motions,
    enumerable: true,
  },
};
