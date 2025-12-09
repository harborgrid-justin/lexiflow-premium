
import { Risk, ConflictCheck, EthicalWall, ComplianceMetrics, EntityId, CaseId } from '../../types';
import { db, STORES } from '../db';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const ComplianceService = {
    getRiskStats: async () => { 
        const risks = await db.getAll<Risk>(STORES.RISKS);
        
        const high = risks.filter(r => r.impact === 'High' || r.probability === 'High').length;
        const medium = risks.filter(r => (r.impact === 'Medium' || r.probability === 'Medium') && r.impact !== 'High').length;
        const low = risks.filter(r => r.impact === 'Low' && r.probability === 'Low').length;

        return [
            { name: 'Low Risk', value: low, color: '#22c55e' },
            { name: 'Medium Risk', value: medium, color: '#f59e0b' },
            { name: 'High Risk', value: high, color: '#ef4444' },
        ]; 
    },

    getRiskMetrics: async (): Promise<ComplianceMetrics> => { 
        const [risks, walls, policies] = await Promise.all([
            db.getAll<Risk>(STORES.RISKS),
            db.getAll<EthicalWall>(STORES.WALLS),
            db.getAll<any>(STORES.POLICIES)
        ]);

        const highRisks = risks.filter(r => r.impact === 'High').length;
        const activeWalls = walls.filter(w => w.status === 'Active').length;
        
        // Calculate a mock score based on open high risks
        const baseScore = 100;
        const penalty = (highRisks * 5) + (activeWalls * 0.5); // Minor penalty for walls complexity
        const score = Math.max(0, Math.floor(baseScore - penalty));

        return { 
            score, 
            high: highRisks, 
            missingDocs: 8, // Placeholder for document audit logic
            violations: 0, 
            activeWalls 
        }; 
    },

    getConflicts: async () => db.getAll<ConflictCheck>(STORES.CONFLICTS),
    
    runConflictCheck: async (entityName: string): Promise<ConflictCheck> => {
        await delay(1500); // Simulate search time
        
        // Search across Clients, Parties, and Opposing Counsel
        const [clients, parties, counsel] = await Promise.all([
            db.getAll<any>(STORES.CLIENTS),
            db.getAll<any>(STORES.ENTITIES),
            db.getAll<any>(STORES.COUNSEL)
        ]);

        const hits: string[] = [];
        const q = entityName.toLowerCase();

        clients.forEach(c => { if(c.name.toLowerCase().includes(q)) hits.push(`Client: ${c.name}`); });
        parties.forEach(p => { if(p.name.toLowerCase().includes(q)) hits.push(`Party: ${p.name} (${p.type})`); });
        counsel.forEach(c => { if(c.name.toLowerCase().includes(q)) hits.push(`Counsel: ${c.name} (${c.firm})`); });

        const result: ConflictCheck = {
            id: `conf-${Date.now()}` as any,
            entityName,
            date: new Date().toISOString().split('T')[0],
            status: hits.length > 0 ? 'Flagged' : 'Cleared',
            foundIn: hits,
            checkedById: 'current-user' as any,
            checkedBy: 'System User'
        };

        await db.put(STORES.CONFLICTS, result);
        return result;
    },

    getEthicalWalls: async () => db.getAll<EthicalWall>(STORES.WALLS),
    
    createEthicalWall: async (wall: EthicalWall) => {
        // Logic to update permission/ACLs would go here
        return db.put(STORES.WALLS, wall);
    },

    getPolicies: async () => db.getAll<any>(STORES.POLICIES)
};