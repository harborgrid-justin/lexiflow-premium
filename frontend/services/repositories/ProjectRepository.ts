import { Project } from '../../types';
import { Repository } from '../core/Repository';
import { STORES } from '../db';

export class ProjectRepository extends Repository<Project> {
    constructor() {
        super(STORES.PROJECTS);
    }
    
    async getByCaseId(caseId: string) {
        return this.getByIndex('caseId', caseId);
    }
}