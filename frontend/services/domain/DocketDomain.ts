import { DocketEntry, DocketId, CaseId } from '../../types';
import { Repository } from '../core/Repository';
import { STORES } from '../data/db';
import { IntegrationOrchestrator } from '../integration/integrationOrchestrator';
import { SystemEventType } from "../../types/integration-types";
import { IdGenerator } from '../../utils/idGenerator';
import { retryWithBackoff, RetryError } from '../../utils/retryWithBackoff';

import { delay } from '../../utils/async';

// ============================================================================
// ERROR CLASSES
// ============================================================================

export class VersionConflictError extends Error {
    constructor(
        public readonly entityId: string,
        public readonly expectedVersion: number,
        public readonly actualVersion: number
    ) {
        super(`Version conflict for ${entityId}: expected ${expectedVersion}, got ${actualVersion}`);
        this.name = 'VersionConflictError';
    }
}

// ============================================================================
// REPOSITORY
// ============================================================================

export interface DocketEntryWithVersion extends DocketEntry {
    version?: number;
}

export class DocketRepository extends Repository<DocketEntry> {
    constructor() { super(STORES.DOCKET); }
    
    async getByCaseId(caseId: string) { 
        return this.getByIndex('caseId', caseId); 
    }
    
    // Phase 3: Pacer Sync Logic with retry
    async syncFromPacer(courtId: string, caseNumber: string) {
        console.log(`[PACER] Syncing for ${caseNumber} in ${courtId}...`);
        
        return retryWithBackoff(async () => {
            await delay(1500);

            // Simulate finding a new entry
            const newEntry: DocketEntry = {
                id: `dk-sync-${Date.now()}` as DocketId,
                sequenceNumber: 9999, // Next available
                pacerSequenceNumber: 123,
                caseId: caseNumber as CaseId, // Assuming ID match
                date: new Date().toISOString().split('T')[0],
                type: 'Order',
                title: 'ORDER ON MOTION TO COMPEL',
                description: 'The court has reviewed the motion and hereby GRANTS it. Signed by Judge Smith.',
                filedBy: 'Court',
                isSealed: false
            };

            // Add to DB
            await this.add(newEntry);
            
            // Trigger orchestrator (Notifications, etc)
            IntegrationOrchestrator.publish(SystemEventType.DOCKET_INGESTED, { entry: newEntry, caseId: caseNumber });
            
            return true;
        }, {
            maxRetries: 3,
            initialDelay: 1000,
            maxDelay: 10000
        });
    }
}
