
import { EvidenceItem } from '../../../types';
import { delay } from '../../../utils/async';
import { Repository } from '../../core/Repository';
import { STORES } from '../db';
export class EvidenceRepository extends Repository<EvidenceItem> {
    constructor() { super(STORES.EVIDENCE); }
    getByCaseId = async (caseId: string) => { return this.getByIndex('caseId', caseId); }
    update = async (id: string, updates: Partial<EvidenceItem>): Promise<EvidenceItem> => {
        // Get the existing item to capture old status
        const existing = await this.get(id);
        if (!existing) {
            throw new Error(`Evidence item ${id} not found`);
        }
        // Perform the update
        const result = await super.update(id, updates);
        // If admissibility status changed, publish event
        if (updates.admissibility && updates.admissibility !== existing.admissibility) {
            const { IntegrationOrchestrator } = await import('../../integration/integrationOrchestrator');
            const { SystemEventType } = await import('../../../types/integration-types');
            await IntegrationOrchestrator.publish(SystemEventType.EVIDENCE_STATUS_UPDATED, {
                item: result,
                oldStatus: existing.admissibility,
                newStatus: updates.admissibility
            });
        }
        return result;
    }
    verifyIntegrity = async (id: string) => {
        await delay(1500);
        return { verified: true, timestamp: new Date().toISOString() };
    }
    
    generateReport = async (id: string) => {
        await delay(1000);
        console.log(`[API] Report generated for ${id}`);
    }
}

