// ================================================================================
// JURISDICTION DOMAIN SERVICE
// ================================================================================
//
// POSITION IN ARCHITECTURE:
//   Context/Loader → JurisdictionService → Frontend API → Backend
//
// PURPOSE:
//   - Court jurisdiction management and rules
//   - Venue selection and jurisdiction validation
//   - Court-specific filing requirements
//
// USAGE:
//   Called by JurisdictionContext and route loaders.
//   Never called directly from view components.
//
// ================================================================================

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
