import { TrialExhibit } from '@/types';
import { Repository } from '@services/core/Repository';
import { STORES } from '@services/data/db';

export class ExhibitRepository extends Repository<TrialExhibit> {
    constructor() {
        super(STORES.EXHIBITS);
    }
}
