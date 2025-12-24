import { TrialExhibit } from '@/types';
import { Repository } from '../../core/Repository';
import { STORES } from '../db';

export class ExhibitRepository extends Repository<TrialExhibit> {
    constructor() {
        super(STORES.EXHIBITS);
    }
}
