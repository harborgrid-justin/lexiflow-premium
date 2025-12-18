import { Repository } from '../../core/Repository';
import { STORES } from '../db';

export class WitnessRepository extends Repository<any> {
    constructor() {
        super(STORES.WITNESSES);
    }
    
    async getByCaseId(caseId: string): Promise<any[]> {
        return this.getByIndex('caseId', caseId);
    }
    
    async getByType(witnessType: string): Promise<any[]> {
        const all = await this.getAll();
        return all.filter(w => w.witnessType === witnessType);
    }
    
    async getByStatus(status: string): Promise<any[]> {
        const all = await this.getAll();
        return all.filter(w => w.status === status);
    }
    
    async updateStatus(id: string, status: string): Promise<any> {
        return this.update(id, { status });
    }
}

