import { Motion } from '../../types';
import { Repository } from '../core/Repository';
import { STORES } from '../db';

export class MotionRepository extends Repository<Motion> {
    constructor() {
        super(STORES.MOTIONS);
    }

    // getByCaseId is inherited from base Repository class
}