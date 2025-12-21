import { Risk, ConflictCheck, EthicalWall, ComplianceMetrics, CaseId, GroupId, UserId } from '../../types';
/**
 * ✅ Migrated to backend API (2025-12-21)
 */
import { complianceApi } from '../api/domains/compliance.api';
import type { ConflictCheck as ApiConflictCheck } from '../api/conflict-checks-api';
import type { EthicalWall as ApiEthicalWall } from '../api/compliance-api';

export const ComplianceService = {
    getRiskStats: async () => { 
        // Mock data for now - would need a risks API endpoint
        const risks: Risk[] = [];
        
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
        // Mock data for now - would need proper API endpoints
        const risks: Risk[] = [];
        const walls = await complianceApi.compliance.getEthicalWalls();

        const highRisks = risks.filter(r => r.impact === 'High').length;
        const activeWalls = walls.filter(w => w.status === 'active').length;
        
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

    getConflicts: async (): Promise<ConflictCheck[]> => {
        const apiConflicts = await complianceApi.conflictChecks.getAll();
        
        // Map API ConflictCheck to frontend ConflictCheck type
        return apiConflicts.map((apiCheck: ApiConflictCheck): ConflictCheck => ({
            id: apiCheck.id,
            entityName: apiCheck.clientName,
            date: apiCheck.checkedAt,
            status: apiCheck.status === 'clear' ? 'Cleared' : 
                    apiCheck.status === 'conflict_found' ? 'Flagged' : 
                    apiCheck.status === 'requires_review' ? 'Review' : 'Pending',
            foundIn: apiCheck.conflicts?.map(c => c.description) || [],
            checkedById: (apiCheck.checkedBy || 'system') as any,
            checkedBy: apiCheck.checkedBy || 'System',
            createdAt: apiCheck.checkedAt,
            updatedAt: apiCheck.checkedAt
        }));
    },
    
    runConflictCheck: async (entityName: string): Promise<ConflictCheck> => {
        // Use backend conflict check service
        const backendResult = await complianceApi.conflictChecks.check({
            clientName: entityName
        });
        
        // Map API response to frontend type
        const result: ConflictCheck = {
            id: backendResult.id,
            entityName: backendResult.clientName,
            date: backendResult.checkedAt,
            status: backendResult.status === 'clear' ? 'Cleared' : 
                    backendResult.status === 'conflict_found' ? 'Flagged' : 
                    backendResult.status === 'requires_review' ? 'Review' : 'Pending',
            foundIn: backendResult.conflicts?.map(c => c.description) || [],
            checkedById: (backendResult.checkedBy || 'system') as any,
            checkedBy: backendResult.checkedBy || 'System',
            createdAt: backendResult.checkedAt,
            updatedAt: backendResult.checkedAt
        };

        return result;
    },

    getEthicalWalls: async (): Promise<EthicalWall[]> => {
        const apiWalls = await complianceApi.compliance.getEthicalWalls();
        
        // Map API EthicalWall to frontend EthicalWall type
        return apiWalls.map((apiWall: ApiEthicalWall): EthicalWall => ({
            id: apiWall.id,
            caseId: (apiWall.caseIds?.[0] || '') as CaseId,
            title: apiWall.name,
            restrictedGroups: [] as GroupId[], // API doesn't have groups, using empty array
            authorizedUsers: apiWall.excludedUsers as UserId[],
            status: apiWall.status === 'active' ? 'Active' : 
                    apiWall.status === 'lifted' ? 'Lifted' : 'Inactive',
            createdAt: apiWall.createdAt,
            updatedAt: apiWall.updatedAt
        }));
    },
    
    createEthicalWall: async (wall: EthicalWall): Promise<EthicalWall> => {
        // Map frontend EthicalWall to API format
        const apiWall = await complianceApi.compliance.createEthicalWall({
            name: wall.title,
            reason: 'Created from frontend',
            status: wall.status === 'Active' ? 'active' : 'inactive',
            restrictedParties: [],
            excludedUsers: wall.authorizedUsers as string[],
            caseIds: wall.caseId ? [wall.caseId as string] : [],
            effectiveDate: new Date().toISOString()
        });
        
        // Map back to frontend type
        return {
            id: apiWall.id,
            caseId: (apiWall.caseIds?.[0] || '') as CaseId,
            title: apiWall.name,
            restrictedGroups: [] as GroupId[],
            authorizedUsers: apiWall.excludedUsers as UserId[],
            status: apiWall.status === 'active' ? 'Active' : 
                    apiWall.status === 'lifted' ? 'Lifted' : 'Inactive',
            createdAt: apiWall.createdAt,
            updatedAt: apiWall.updatedAt
        };
    },

    getPolicies: async () => {
        // Mock data - would need a policies API endpoint
        return [];
    }
};
