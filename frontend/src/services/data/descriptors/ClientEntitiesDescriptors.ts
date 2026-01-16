import { litigationApi } from "@/api/domains/litigation.api";
import { integrationsApi } from "@/lib/frontend-api";
import { api } from "@/services/api";

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
