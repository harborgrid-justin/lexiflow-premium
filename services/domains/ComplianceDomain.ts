
import { Risk, ConflictCheck, EthicalWall, AuditLogEntry } from '../../types';
import { db, STORES } from '../db';
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export const ComplianceService = {
    getRiskStats: async () => { await delay(100); return []; },
    getRiskMetrics: async () => { await delay(100); return { high: 0, missingDocs: 0, violations: 0 }; },
    getConflicts: async () => db.getAll<ConflictCheck>(STORES.CONFLICTS),
    getEthicalWalls: async () => db.getAll<EthicalWall>(STORES.WALLS),
    getPolicies: async () => db.getAll<any>(STORES.POLICIES)
};
