import { db, STORES } from '../db';

export const JurisdictionService = {
    // FIX: Use the correct STORES key
    getAll: async () => db.getAll(STORES.JURISDICTIONS),
    getFederal: async () => {
        // FIX: Use the correct STORES key
        const all = await db.getAll<any>(STORES.JURISDICTIONS);
        return all.filter((j: any) => j.system === 'Federal');
    },
    getState: async () => {
        // FIX: Use the correct STORES key
        const all = await db.getAll<any>(STORES.JURISDICTIONS);
        return all.filter((j: any) => j.system === 'State');
    },
    getRegulatoryBodies: async () => [], // Placeholder for future implementation
    getTreaties: async () => [], // Placeholder
    getArbitrationProviders: async () => [], // Placeholder
    getMapNodes: async () => [], // Placeholder
};