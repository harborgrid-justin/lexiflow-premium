/**
 * Organization Repository
 * Enterprise-grade repository for organization management with backend API integration
 */

import { Organization } from '@/types';
import { Repository } from '../../core/Repository';
import { STORES } from '../db';
import { isBackendApiEnabled } from '@/services/integration/apiConfig';
import { OrganizationsApiService } from '@/api/organizations-api';

export const ORGANIZATION_QUERY_KEYS = {
    all: () => ['organizations'] as const,
    byId: (id: string) => ['organizations', id] as const,
    byType: (type: string) => ['organizations', 'type', type] as const,
    byJurisdiction: (jurisdiction: string) => ['organizations', 'jurisdiction', jurisdiction] as const,
} as const;

export class OrganizationRepository extends Repository<Organization> {
    private useBackend: boolean;
    private orgsApi: OrganizationsApiService;

    constructor() {
        super(STORES.ORGS);
        this.useBackend = isBackendApiEnabled();
        this.orgsApi = new OrganizationsApiService();
        console.log(`[OrganizationRepository] Initialized with ${this.useBackend ? 'Backend API' : 'IndexedDB'}`);
    }

    private validateId(id: string, methodName: string): void {
        if (!id || typeof id !== 'string' || id.trim() === '') {
            throw new Error(`[OrganizationRepository.${methodName}] Invalid id parameter`);
        }
    }

    override async getAll(): Promise<Organization[]> {
        if (this.useBackend) {
            try {
                return await this.orgsApi.getAll() as any;
            } catch (error) {
                console.warn('[OrganizationRepository] Backend API unavailable', error);
            }
        }
        return await super.getAll();
    }

    override async getById(id: string): Promise<Organization | undefined> {
        this.validateId(id, 'getById');
        if (this.useBackend) {
            try {
                return await this.orgsApi.getById(id) as any;
            } catch (error) {
                console.warn('[OrganizationRepository] Backend API unavailable', error);
            }
        }
        return await super.getById(id);
    }

    override async add(item: Organization): Promise<Organization> {
        if (!item || typeof item !== 'object') {
            throw new Error('[OrganizationRepository.add] Invalid organization data');
        }
        if (this.useBackend) {
            try {
                return await this.orgsApi.create(item as any) as any;
            } catch (error) {
                console.warn('[OrganizationRepository] Backend API unavailable', error);
            }
        }
        await super.add(item);
        return item;
    }

    override async update(id: string, updates: Partial<Organization>): Promise<Organization> {
        this.validateId(id, 'update');
        if (this.useBackend) {
            try {
                return await this.orgsApi.update(id, updates as any) as any;
            } catch (error) {
                console.warn('[OrganizationRepository] Backend API unavailable', error);
            }
        }
        return await super.update(id, updates);
    }

    override async delete(id: string): Promise<void> {
        this.validateId(id, 'delete');
        if (this.useBackend) {
            try {
                await this.orgsApi.delete(id);
                return;
            } catch (error) {
                console.warn('[OrganizationRepository] Backend API unavailable', error);
            }
        }
        await super.delete(id);
    }
    
    async search(searchTerm: string): Promise<Organization[]> {
        if (!searchTerm) return [];
        if (this.useBackend) {
            try {
                return await this.orgsApi.search(searchTerm) as any;
            } catch (error) {
                console.warn('[OrganizationRepository] Backend API unavailable', error);
            }
        }
        const all = await this.getAll();
        return all.filter(org => 
            org.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            org.legalName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    
    async getByType(type: string): Promise<Organization[]> {
        if (!type) throw new Error('[OrganizationRepository.getByType] Invalid type');
        if (this.useBackend) {
            try {
                return await this.orgsApi.getByType(type as any) as any;
            } catch (error) {
                console.warn('[OrganizationRepository] Backend API unavailable', error);
            }
        }
        return await this.getByIndex('organizationType', type);
    }
    
    async getByJurisdiction(jurisdiction: string): Promise<Organization[]> {
        if (!jurisdiction) throw new Error('[OrganizationRepository.getByJurisdiction] Invalid jurisdiction');
        if (this.useBackend) {
            try {
                return await this.orgsApi.getByJurisdiction(jurisdiction) as any;
            } catch (error) {
                console.warn('[OrganizationRepository] Backend API unavailable', error);
            }
        }
        const all = await this.getAll();
        return all.filter(org => org.jurisdiction === jurisdiction);
    }
}
