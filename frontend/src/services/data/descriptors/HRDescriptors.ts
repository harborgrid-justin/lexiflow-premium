import { api, authApi, litigationApi } from '@/lib/frontend-api';

export const HRDescriptors: PropertyDescriptorMap = {
  hr: {
    get: () => api.hr,
    enumerable: true,
  },
  users: {
    get: () => authApi.users,
    enumerable: true,
  },
  groups: {
    get: () => (authApi as unknown as { groups: unknown }).groups,
    enumerable: true,
  },
  caseTeams: {
    get: () => litigationApi.caseTeams,
    enumerable: true,
  },
  casePhases: {
    get: () => litigationApi.casePhases,
    enumerable: true,
  },
};
