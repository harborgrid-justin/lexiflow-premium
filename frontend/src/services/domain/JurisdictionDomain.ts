/**
 * ? Migrated to backend API (2025-12-21)
 */
import { JurisdictionAPI } from "@/api/intelligence/jurisdiction-api";

export const JurisdictionService = {
  getAll: async () => {
    return (await JurisdictionAPI.getAll()) || [];
  },

  getFederal: async () => {
    return (await JurisdictionAPI.getFederal()) || [];
  },

  getState: async () => {
    return (await JurisdictionAPI.getState()) || [];
  },
  getRegulatoryBodies: async () => {
    return await JurisdictionAPI.getRegulatory();
  },

  getTreaties: async () => {
    return await JurisdictionAPI.getInternational();
  },

  getArbitrationProviders: async () => {
    return await JurisdictionAPI.getArbitration();
  },

  getMapNodes: async () => {
    return await JurisdictionAPI.getMapNodes();
  },
};
