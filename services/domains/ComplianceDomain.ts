
import { Risk, ConflictCheck, EthicalWall, AuditLogEntry, ComplianceMetrics } from '../../types';
import { db, STORES } from '../db';
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export const ComplianceService = {
    getRiskStats: async () => { await delay(100); return [
        { name: 'Low Risk', value: 85, color: '#22c55e' },
        { name: 'Medium Risk', value: 12, color: '#f59e0b' },
        { name: 'High Risk', value: 3, color: '#ef4444' },
    ]; },
    getRiskMetrics: async (): Promise<ComplianceMetrics> => { 
        await delay(100); 
        return { score: 94, high: 3, missingDocs: 8, violations: 2, activeWalls: 12 }; 
    },
    getConflicts: async () => db.getAll<ConflictCheck>(STORES.CONFLICTS),
    getEthicalWalls: async () => db.getAll<EthicalWall>(STORES.WALLS),
    getPolicies: async () => db.getAll<any>(STORES.POLICIES)
};
