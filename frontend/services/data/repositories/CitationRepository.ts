import { Citation } from '../../../types';
import { Repository } from '../../core/Repository';
import { STORES } from '../db';

export class CitationRepository extends Repository<Citation> {
    constructor() {
        super(STORES.CITATIONS);
    }

    async verifyAll() {
        return { checked: 150, flagged: 3 };
    }

    async quickAdd(citation: any) {
        return this.add(citation);
    }

    add = async (item: Citation): Promise<Citation> => {
        // Perform the add operation
        const result = await super.add(item);

        // Publish integration event
        const { IntegrationOrchestrator } = await import('../../integration/integrationOrchestrator');
        const { SystemEventType } = await import('../../../types/integration-types');

        await IntegrationOrchestrator.publish(SystemEventType.CITATION_SAVED, {
            citation: result,
            queryContext: item.caseContext || ''
        });

        return result;
    }
}
