import { db, STORES } from '../db';

export const SecurityService = {
    getMalwareSignatures: async (): Promise<string[]> => {
        const sigs = await db.getAll<{id: string, signature: string}>(STORES.MALWARE_SIGNATURES);
        return sigs.map(s => s.signature);
    }
};