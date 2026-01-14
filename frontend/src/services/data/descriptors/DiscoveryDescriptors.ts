import { api } from '@/lib/frontend-api';

export const DiscoveryDescriptors: PropertyDescriptorMap = {
  discovery: {
    get: () => api.discovery,
    enumerable: true,
  },
  evidence: {
    get: () => api.evidence,
    enumerable: true,
  },
  legalHolds: {
    get: () => api.legalHolds,
    enumerable: true,
  },
  depositions: {
    get: () => api.depositions,
    enumerable: true,
  },
  discoveryRequests: {
    get: () => api.discoveryRequests,
    enumerable: true,
  },
  esiSources: {
    get: () => api.esiSources,
    enumerable: true,
  },
  privilegeLog: {
    get: () => api.privilegeLog,
    enumerable: true,
  },
  productions: {
    get: () => api.productions,
    enumerable: true,
  },
  custodianInterviews: {
    get: () => api.custodianInterviews,
    enumerable: true,
  },
  custodians: {
    get: () => api.custodians,
    enumerable: true,
  },
};
