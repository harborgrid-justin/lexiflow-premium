
import { Risk, ConflictCheck, EthicalWall, AuditLogEntry } from '../../types';
import { db, STORES } from '../db';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const ComplianceService = {
    getRiskStats: async () => {
        const risks = await db.getAll<Risk>(STORES.RISKS);
        
        let low = 0;
        let medium = 0;
        let high = 0;

        risks.forEach(r => {
            const pScore = r.probability === 'High' ? 3 : r.probability === 'Medium' ? 2 : 1;
            const iScore = r.impact === 'High' ? 3 : r.impact === 'Medium' ? 2 : 1;
            const total = pScore * iScore;

            if (total >= 6) high++;
            else if (total >= 3) medium++;
            else low++;
        });

        return [
            { name: 'Low Risk', value: low, color: '#10b981' },
            { name: 'Medium Risk', value: medium, color: '#f59e0b' },
            { name: 'High Risk', value: high, color: '#ef4444' }
        ];
    },

    getRiskMetrics: async () => {
        const [risks, logs] = await Promise.all([
            db.getAll<Risk>(STORES.RISKS),
            db.getAll<AuditLogEntry>(STORES.LOGS || 'logs')
        ]);

        // Calculate high risks dynamically
        const highRiskCount = risks.filter(r => r.probability === 'High' || r.impact === 'High').length;
        
        // Calculate violations from logs
        const violations = logs.filter(l => l.action.includes('UNAUTHORIZED') || l.action.includes('DELETE')).length;

        // Simulate missing docs calculation (randomized for demo or based on client count)
        const missingDocs = Math.floor(Math.random() * 15); 

        return { 
            high: highRiskCount, 
            missingDocs: missingDocs, 
            violations: violations 
        };
    },

    getConflicts: async () => db.getAll<ConflictCheck>(STORES.CONFLICTS),
    
    getEthicalWalls: async () => db.getAll<EthicalWall>(STORES.WALLS),
    
    getPolicies: async () => db.getAll<any>(STORES.POLICIES)
};
