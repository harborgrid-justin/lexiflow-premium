import { Juror, Witness, TrialExhibit } from '../../types';
import { Repository } from '../core/Repository';
import { STORES, db } from '../db';

export class TrialRepository extends Repository<TrialExhibit> {
    constructor() { super(STORES.EXHIBITS); }

    getJurors = async (caseId: string): Promise<Juror[]> => {
        return db.getByIndex(STORES.JURORS, 'caseId', caseId);
    }

    strikeJuror = async (id: string, party: 'Plaintiff' | 'Defense', cause?: string) => {
        const juror = await this.getById(id);
        if (juror) {
            await this.update(id, { status: 'Struck', strikeParty: party, notes: cause } as any);
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

    addExhibit = async (exhibit: TrialExhibit): Promise<TrialExhibit> => {
        return this.add(exhibit);
    }

    getAll = async (): Promise<TrialExhibit[]> => {
        return db.getAll<TrialExhibit>(STORES.EXHIBITS);
    }
}