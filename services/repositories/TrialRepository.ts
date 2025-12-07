
import { Juror, Witness } from '../../types';
import { Repository } from '../core/Repository';
import { STORES, db } from '../db';

export class TrialRepository extends Repository<Juror> {
    constructor() { super(STORES.JURORS); }

    getJurors = async (caseId: string) => this.getByIndex('caseId', caseId);

    strikeJuror = async (id: string, party: 'Plaintiff' | 'Defense', cause?: string) => {
        const juror = await this.getById(id);
        if (juror) {
            await this.update(id, { status: 'Struck', strikeParty: party, notes: cause });
        }
    }

    getWitnesses = async (caseId: string): Promise<Witness[]> => {
        return db.getByIndex(STORES.WITNESSES, 'caseId', caseId);
    }

    rateWitness = async (id: string, score: number) => {
        const witness = await db.get<Witness>(STORES.WITNESSES, id);
        if (witness) {
             await db.put(STORES.WITNESSES, { ...witness, credibilityScore: score });
        }
    }
}
