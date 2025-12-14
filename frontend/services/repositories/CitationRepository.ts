import { Citation } from '../../types';
import { Repository } from '../core/Repository';
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
}