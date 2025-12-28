import { Project } from '@/types';
import { Repository } from '@/services/core/Repository';
import { STORES } from '@/services/data/db';

export class ProjectRepository extends Repository<Project> {
    constructor() {
        super(STORES.PROJECTS);
    }

    // getByCaseId is inherited from base Repository class
}
