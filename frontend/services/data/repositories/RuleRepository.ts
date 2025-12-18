import { LegalRule } from '../../../types';
import { Repository } from '../../core/Repository';
import { STORES } from '../db';

export class RuleRepository extends Repository<LegalRule> {
    constructor() {
        super(STORES.RULES);
    }
}
