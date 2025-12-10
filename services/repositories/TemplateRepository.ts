import { WorkflowTemplateData } from '../../types';
import { Repository } from '../core/Repository';
import { STORES } from '../db';

export class TemplateRepository extends Repository<WorkflowTemplateData> {
    constructor() {
        super(STORES.TEMPLATES);
    }
}