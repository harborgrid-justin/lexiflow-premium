import { Case, CasePhase, Party, CaseId } from '../../types';
import { Repository } from '../core/Repository';
import { STORES, db } from '../db';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class CaseRepository extends Repository<Case> {
    constructor() { super(STORES.CASES); }

    async getParties(caseId: string): Promise<Party[]> {
        const c = await this.getById(caseId);
        return c?.parties || [];
    }

    async getArchived() {
        const cases = await this.getAll();
        return cases.filter(c => c.status === 'Closed' || c.status === 'Settled').map(c => ({
            id: c.id,
            date: c.dateTerminated || c.filingDate,
            title: c.title,
            client: c.client,
            outcome: c.status
        }));
    }
    
    async getByStatus(status: string) {
        return this.getByIndex('status', status);
    }

    async importDocket(caseId: string, data: any) {
        await delay(500);
        console.log(`[API] Imported docket data for ${caseId}`, data);
        return true;
    }

    async archive(id: string) {
        await delay(300);
        const c = await this.getById(id);
        if (c) await this.update(id, { status: 'Closed' as any });
    }

    async flag(id: string) {
        await delay(300);
        console.log(`[API] Case ${id} flagged`);
    }
}

export const PhaseService = {
    getByCaseId: async (caseId: string): Promise<CasePhase[]> => {
        await delay(50);
        
        // Specific Logic for 1:24-cv-01442-LMB-IDD
        if (caseId === '1:24-cv-01442-LMB-IDD') {
             return [
                { id: 'p1', caseId: caseId as CaseId, name: 'Strategy & Pleadings', startDate: '2024-11-01', duration: 30, status: 'Completed', color: 'bg-blue-500' },
                { id: 'p2', caseId: caseId as CaseId, name: 'Discovery', startDate: '2024-12-01', duration: 90, status: 'Active', color: 'bg-indigo-500' },
                { id: 'p3', caseId: caseId as CaseId, name: 'Expert Witness', startDate: '2025-03-01', duration: 30, status: 'Pending', color: 'bg-purple-500' },
                { id: 'p4', caseId: caseId as CaseId, name: 'Pre-Trial Motions', startDate: '2025-04-01', duration: 45, status: 'Pending', color: 'bg-amber-500' },
                { id: 'p5', caseId: caseId as CaseId, name: 'Trial Prep', startDate: '2025-05-15', duration: 15, status: 'Pending', color: 'bg-red-500' },
                { id: 'p6', caseId: caseId as CaseId, name: 'Trial', startDate: '2025-06-01', duration: 14, status: 'Pending', color: 'bg-slate-800' }
            ];
        }

        return [
            { id: 'p1', caseId: caseId as CaseId, name: 'Intake & Investigation', startDate: '2023-11-15', duration: 45, status: 'Completed', color: 'bg-green-500' },
            { id: 'p2', caseId: caseId as CaseId, name: 'Pleadings', startDate: '2024-01-01', duration: 60, status: 'Completed', color: 'bg-blue-500' },
            { id: 'p3', caseId: caseId as CaseId, name: 'Discovery', startDate: '2024-03-01', duration: 180, status: 'Active', color: 'bg-blue-600' },
            { id: 'p4', caseId: caseId as CaseId, name: 'Pre-Trial Motions', startDate: '2024-09-01', duration: 90, status: 'Pending', color: 'bg-slate-300' },
            { id: 'p5', caseId: caseId as CaseId, name: 'Trial', startDate: '2024-12-01', duration: 14, status: 'Pending', color: 'bg-slate-300' }
        ];
    }
};
