import { LegalEntity } from '../../../types';
import { Repository } from '../../../core/Repository';
import { STORES } from '../db';
import { IntegrationOrchestrator } from '../../../integration/integrationOrchestrator';
import { SystemEventType } from '../../../types/integration-types';

export class EntityRepository extends Repository<LegalEntity> {
    constructor() {
        super(STORES.ENTITIES);
    }
    
    async getRelationships(id: string) {
        // Mocked for now, in real app this would query a relationship table
        return [];
    }
    
    async add(item: LegalEntity): Promise<LegalEntity> {
        const result = await super.add(item);
        IntegrationOrchestrator.publish(SystemEventType.ENTITY_CREATED, { entity: result });
        return result;
    }
}
