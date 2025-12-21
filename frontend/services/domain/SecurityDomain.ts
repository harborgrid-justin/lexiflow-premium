// TODO: Migrate to backend API - IndexedDB deprecated
import { db, STORES } from '../data/db';

export const SecurityService = {
    getMalwareSignatures: async (): Promise<string[]> => {
        const sigs = await db.getAll<{id: string, signature: string}>(STORES.MALWARE_SIGNATURES);
        return sigs.map(s => s.signature);
    }
};
