/**
 * Template Repository
 * Enterprise-grade repository for workflow template management
 */

import { WorkflowTemplateData } from '@/types';
import { Repository } from '../../core/Repository';
import { STORES } from '../db';
import { isBackendApiEnabled } from '@/services/integration/apiConfig';

export const TEMPLATE_QUERY_KEYS = {
    all: () => ['templates'] as const,
    byId: (id: string) => ['templates', id] as const,
    byCategory: (category: string) => ['templates', 'category', category] as const,
} as const;

export class TemplateRepository extends Repository<WorkflowTemplateData> {
    private useBackend: boolean;

    constructor() {
        super(STORES.TEMPLATES);
        this.useBackend = isBackendApiEnabled();
        console.log(`[TemplateRepository] Initialized with ${this.useBackend ? 'Backend API' : 'IndexedDB'}`);
    }

    private validateId(id: string, methodName: string): void {
        if (!id || typeof id !== 'string' || id.trim() === '') {
            throw new Error(`[TemplateRepository.${methodName}] Invalid id parameter`);
        }
    }

    override async add(item: WorkflowTemplateData): Promise<WorkflowTemplateData> {
        if (!item || typeof item !== 'object') {
            throw new Error('[TemplateRepository.add] Invalid template data');
        }
        await super.add(item);
        return item;
    }

    override async update(id: string, updates: Partial<WorkflowTemplateData>): Promise<WorkflowTemplateData> {
        this.validateId(id, 'update');
        return await super.update(id, updates);
    }

    async getByCategory(category: string): Promise<WorkflowTemplateData[]> {
        const templates = await this.getAll();
        return templates.filter(t => t.category === category);
    }

    async search(query: string): Promise<WorkflowTemplateData[]> {
        if (!query) return [];
        const templates = await this.getAll();
        const lowerQuery = query.toLowerCase();
        return templates.filter(t =>
            t.name?.toLowerCase().includes(lowerQuery) ||
            t.description?.toLowerCase().includes(lowerQuery)
        );
    }
}
