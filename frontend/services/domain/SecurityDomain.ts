/**
 * ✅ Migrated to backend API (2025-12-21)
 */
import { adminApi } from '../api/domains/admin.api';

export const SecurityService = {
    getMalwareSignatures: async (): Promise<string[]> => {
        const sigs = await adminApi.security?.getMalwareSignatures?.() || [];
        return Array.isArray(sigs) ? sigs.map((s: any) => s.signature || s) : [];
    }
};
