import { Project } from '../../types';
import { Repository } from '../core/Repository';
import { STORES } from '../db';

export class ProjectRepository extends Repository<Project> {
    constructor() {
        super(STORES.PROJECTS);
    }

    // getByCaseId is inherited from base Repository class
}