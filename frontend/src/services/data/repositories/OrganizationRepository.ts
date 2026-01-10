/**
 * Organization Repository
 * Enterprise-grade repository for organization management with backend API integration
 */

import { Organization } from '@/types';
import { Repository } from '@/services/core/Repository';
import { OrganizationsApiService } from '@/api/integrations/organizations-api';
import { ValidationError } from '@/services/core/errors';

export const ORGANIZATION_QUERY_KEYS = {
    all: () => ['organizations'] as const,
    byId: (id: string) => ['organizations', id] as const,
    byType: (type: string) => ['organizations', 'type', type] as const,
    byJurisdiction: (jurisdiction: string) => ['organizations', 'jurisdiction', jurisdiction] as const,
} as const;

export class OrganizationRepository extends Repository<Organization> {
    private orgsApi: OrganizationsApiService;

    constructor() {
        super('organizations');
        this.orgsApi = new OrganizationsApiService();
        console.log(`[OrganizationRepository] Initialized with Backend API`);
    }

    private validateId(id: string, methodName: string): void {
        if (!id || id.trim() === '') {
            throw new Error(`[OrganizationRepository.${methodName}] Invalid id parameter`);
        }
    }

    override async getAll(): Promise<Organization[]> {
        try {
            return await this.orgsApi.getAll() as unknown as Organization[];
        } catch (error) {
            console.error('[OrganizationRepository] Backend API error', error);
            throw error;
        }
    }

    override async getById(id: string): Promise<Organization | undefined> {
        this.validateId(id, 'getById');
        try {
            return await this.orgsApi.getById(id) as unknown as Organization;
        } catch (error) {
            console.error('[OrganizationRepository] Backend API error', error);
            throw error;
        }
    }
            try {
                return await this.orgsApi.getById(id) as unknown as Organization;
            } catch (error) {
                console.warn('[OrganizationRepository] Backend API unavailable', error);
            }
        }
        return await super.getById(id);
    }

    override async add(item: Organization): Promise<Organization> {
        if (!item || typeof item !== 'object') {
            throw new ValidationError('[OrganizationRepository.add] Invalid organization data');
        }
        try {
            return await this.orgsApi.create(item as unknown as Record<string, unknown>) as unknown as Organization;
        } catch (error) {
            console.error('[OrganizationRepository] Backend API error', error);
            throw error;
        }
    }

    override async update(id: string, updates: Partial<Organization>): Promise<Organization> {
        this.validateId(id, 'update');
        try {
            return await this.orgsApi.update(id, updates as unknown as Record<string, unknown>) as unknown as Organization;
        } catch (error) {
            console.error('[OrganizationRepository] Backend API error', error);
            throw error;
        }
    }

    override async delete(id: string): Promise<void> {
        this.validateId(id, 'delete');
        try {
            await this.orgsApi.delete(id);
            return;
        } catch (error) {
            console.error('[OrganizationRepository] Backend API error', error);
            throw error;
        }
    }

    async search(searchTerm: string): Promise<Organization[]> {
        if (!searchTerm) return [];
        try {
            return await this.orgsApi.search(searchTerm) as unknown as Organization[];
        } catch (error) {
            console.error('[OrganizationRepository] Backend API error', error);
            throw error;
        }
    }

    async getByType(type: string): Promise<Organization[]> {
        if (!type) throw new ValidationError('[OrganizationRepository.getByType] Invalid type');
        try {
            return await this.orgsApi.getByType(type as unknown as never) as unknown as Organization[];
        } catch (error) {
            console.error('[OrganizationRepository] Backend API error', error);
            throw error;
        }
    }

    async getByJurisdiction(jurisdiction: string): Promise<Organization[]> {
        if (!jurisdiction) throw new ValidationError('[OrganizationRepository.getByJurisdiction] Invalid jurisdiction');
        try {
            return await this.orgsApi.getByJurisdiction(jurisdiction) as unknown as Organization[];
        } catch (error) {
            console.error('[OrganizationRepository] Backend API error', error);
            throw error;
        }
    }
}
