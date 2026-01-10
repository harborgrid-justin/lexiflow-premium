import { api, integrationsApi, litigationApi } from "@/api";

export const ClientEntitiesDescriptors: PropertyDescriptorMap = {
  clients: {
    get: () => api.clients,
    enumerable: true,
  },
  parties: {
    get: () => litigationApi.parties,
    enumerable: true,
  },
  organizations: {
    get: () => integrationsApi.organizations,
    enumerable: true,
  },
  entities: {
    get: () => api.legalEntities,
    enumerable: true,
  },
};
