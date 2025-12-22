/**
 * Entity Repository
 * Enterprise-grade repository for legal entity management with backend API integration
 */

import { LegalEntity } from '../../../types';
import { Repository } from '../../core/Repository';
import { STORES } from '../db';
import { IntegrationOrchestrator } from '../../integration/integrationOrchestrator';
import { SystemEventType } from '../../../types/integration-types';
import { isBackendApiEnabled } from '../../integration/apiConfig';

export const ENTITY_QUERY_KEYS = {
    all: () => ['entities'] as const,
    byId: (id: string) => ['entities', id] as const,
    byType: (type: string) => ['entities', 'type', type] as const,
    relationships: (id: string) => ['entities', id, 'relationships'] as const,
} as const;

export class EntityRepository extends Repository<LegalEntity> {
    private useBackend: boolean;

    constructor() {
        super(STORES.ENTITIES);
        this.useBackend = isBackendApiEnabled();
        console.log(`[EntityRepository] Initialized with ${this.useBackend ? 'Backend API' : 'IndexedDB'}`);
    }

    private validateId(id: string, methodName: string): void {
        if (!id || typeof id !== 'string' || id.trim() === '') {
            throw new Error(`[EntityRepository.${methodName}] Invalid id parameter`);
        }
    }

    override async getAll(): Promise<LegalEntity[]> {
        return await super.getAll();
    }

    override async getById(id: string): Promise<LegalEntity | undefined> {
        this.validateId(id, 'getById');
        return await super.getById(id);
    }
    
    async getRelationships(_id: string): Promise<any[]> {
        this.validateId(_id, 'getRelationships');
        // Mocked for now, in real app this would query a relationship table
        return [];
    }
    
    async add(item: LegalEntity): Promise<LegalEntity> {
        if (!item || typeof item !== 'object') {
            throw new Error('[EntityRepository.add] Invalid entity data');
        }

        const result = await super.add(item);
        
        try {
            await IntegrationOrchestrator.publish(SystemEventType.ENTITY_CREATED, { entity: result });
        } catch (eventError) {
            console.warn('[EntityRepository] Failed to publish entity creation event', eventError);
        }
        
        return result;
    }

    override async update(id: string, updates: Partial<LegalEntity>): Promise<LegalEntity> {
        this.validateId(id, 'update');
        return await super.update(id, updates);
    }

    override async delete(id: string): Promise<void> {
        this.validateId(id, 'delete');
        await super.delete(id);
    }

    async getByType(type: string): Promise<LegalEntity[]> {
        if (!type) throw new Error('[EntityRepository.getByType] Invalid type');
        const entities = await this.getAll();
        return entities.filter(e => e.type === type);
    }

    async search(query: string): Promise<LegalEntity[]> {
        if (!query) return [];
        const entities = await this.getAll();
        const lowerQuery = query.toLowerCase();
        return entities.filter(e =>
            e.name?.toLowerCase().includes(lowerQuery) ||
            e.legalName?.toLowerCase().includes(lowerQuery)
        );
    }
}
