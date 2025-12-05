
import { DocketEntry } from '../../types';
import { Repository } from '../core/Repository';
import { STORES } from '../db';

export class DocketRepository extends Repository<DocketEntry> {
    constructor() { super(STORES.DOCKET); }
    getByCaseId = async (caseId: string) => { return this.getByIndex('caseId', caseId); }
}
