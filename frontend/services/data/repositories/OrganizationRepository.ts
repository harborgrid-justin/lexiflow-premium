import { Organization } from '../../../types';
import { Repository } from '../../../core/Repository';
import { STORES } from '../db';

export class OrganizationRepository extends Repository<Organization> {
    constructor() {
        super(STORES.ORGS);
    }
    
    async search(searchTerm: string): Promise<Organization[]> {
        const all = await this.getAll();
        return all.filter(org => 
            org.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            org.legalName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    
    async getByType(type: string): Promise<Organization[]> {
        return this.getByIndex('organizationType', type);
    }
    
    async getByJurisdiction(jurisdiction: string): Promise<Organization[]> {
        const all = await this.getAll();
        return all.filter(org => org.jurisdiction === jurisdiction);
    }
}

