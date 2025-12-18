import { Clause } from '../../../types';
import { Repository } from '../../../core/Repository';
import { STORES } from '../db';

export class ClauseRepository extends Repository<Clause> {
    constructor() {
        super(STORES.CLAUSES);
    }
}
