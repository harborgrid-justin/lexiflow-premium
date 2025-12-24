/**
 * Rule Repository
 * Enterprise-grade repository for legal rule management with backend API integration
 */

import { LegalRule } from '@/types';
import { Repository } from '../../core/Repository';
import { STORES } from '../db';
import { isBackendApiEnabled } from '@/services/integration/apiConfig';

export const RULE_QUERY_KEYS = {
    all: () => ['rules'] as const,
    byId: (id: string) => ['rules', id] as const,
    byJurisdiction: (jurisdiction: string) => ['rules', 'jurisdiction', jurisdiction] as const,
    byCategory: (category: string) => ['rules', 'category', category] as const,
} as const;

export class RuleRepository extends Repository<LegalRule> {
    private useBackend: boolean;

    constructor() {
        super(STORES.RULES);
        this.useBackend = isBackendApiEnabled();
        console.log(`[RuleRepository] Initialized with ${this.useBackend ? 'Backend API' : 'IndexedDB'}`);
    }

    private validateId(id: string, methodName: string): void {
        if (!id || typeof id !== 'string' || id.trim() === '') {
            throw new Error(`[RuleRepository.${methodName}] Invalid id parameter`);
        }
    }

    override async getAll(): Promise<LegalRule[]> {
        return await super.getAll();
    }

    override async getById(id: string): Promise<LegalRule | undefined> {
        this.validateId(id, 'getById');
        return await super.getById(id);
    }

    override async add(item: LegalRule): Promise<LegalRule> {
        if (!item || typeof item !== 'object') {
            throw new Error('[RuleRepository.add] Invalid rule data');
        }
        await super.add(item);
        return item;
    }

    override async update(id: string, updates: Partial<LegalRule>): Promise<LegalRule> {
        this.validateId(id, 'update');
        return await super.update(id, updates);
    }

    override async delete(id: string): Promise<void> {
        this.validateId(id, 'delete');
        await super.delete(id);
    }

    async getByJurisdiction(jurisdiction: string): Promise<LegalRule[]> {
        if (!jurisdiction) throw new Error('[RuleRepository.getByJurisdiction] Invalid jurisdiction');
        const rules = await this.getAll();
        return rules.filter(r => r.jurisdiction === jurisdiction);
    }

    async getByCategory(category: string): Promise<LegalRule[]> {
        if (!category) throw new Error('[RuleRepository.getByCategory] Invalid category');
        const rules = await this.getAll();
        return rules.filter(r => r.category === category);
    }

    async search(query: string): Promise<LegalRule[]> {
        if (!query) return [];
        const rules = await this.getAll();
        const lowerQuery = query.toLowerCase();
        return rules.filter(r =>
            r.title?.toLowerCase().includes(lowerQuery) ||
            r.description?.toLowerCase().includes(lowerQuery) ||
            r.ruleNumber?.toLowerCase().includes(lowerQuery)
        );
    }
}
