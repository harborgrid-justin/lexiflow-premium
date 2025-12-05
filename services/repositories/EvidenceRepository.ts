
import { EvidenceItem } from '../../types';
import { Repository } from '../core/Repository';
import { STORES } from '../db';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class EvidenceRepository extends Repository<EvidenceItem> {
    constructor() { super(STORES.EVIDENCE); }
    
    getByCaseId = async (caseId: string) => { return this.getByIndex('caseId', caseId); }
    
    verifyIntegrity = async (id: string) => {
        await delay(1500);
        return { verified: true, timestamp: new Date().toISOString() };
    }
    
    generateReport = async (id: string) => {
        await delay(1000);
        console.log(`[API] Report generated for ${id}`);
    }
}
