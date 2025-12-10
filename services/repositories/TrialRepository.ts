
import { Juror, Witness, TrialExhibit, Fact } from '../../types';
import { Repository } from '../core/Repository';
import { STORES, db } from '../db';

export class TrialRepository extends Repository<TrialExhibit> {
    constructor() { super(STORES.EXHIBITS); }

    // --- Jurors ---
    getJurors = async (caseId: string): Promise<Juror[]> => {
        return db.getByIndex(STORES.JURORS, 'caseId', caseId);
    }

    addJuror = async (juror: Juror) => {
        // Direct DB put for Jurors store which isn't wrapped in a full Repository class yet
        return db.put(STORES.JURORS, juror);
    }

    strikeJuror = async (id: string, party: 'Plaintiff' | 'Defense', cause?: string) => {
        const juror = await db.get<Juror>(STORES.JURORS, id);
        if (juror) {
            await db.put(STORES.JURORS, { ...juror, status: 'Struck', strikeParty: party, notes: cause });
        }
    }

    // --- Facts ---
    getFacts = async (caseId: string): Promise<Fact[]> => {
        // Facts store not defined in STORES enum, assuming 'facts' for now or mapping to 'evidence' tags
        // For strictness, let's assume we store facts in a new store or use Evidence with type 'Fact'
        // For this phase, we'll simulate a Fact store access
        return []; 
    }

    // --- Witnesses ---
    getWitnesses = async (caseId: string): Promise<Witness[]> => {
        return db.getByIndex(STORES.WITNESSES, 'caseId', caseId);
    }

    rateWitness = async (id: string, score: number) => {
        const witness = await db.get<Witness>(STORES.WITNESSES, id);
        if (witness) {
             await db.put(STORES.WITNESSES, { ...witness, credibilityScore: score });
        }
    }

    // --- Exhibits ---
    addExhibit = async (exhibit: TrialExhibit): Promise<TrialExhibit> => {
        return this.add(exhibit);
    }
    
    // FIX: Add missing 'getExhibits' method called by useExhibits hook.
    getExhibits = async (caseId?: string): Promise<TrialExhibit[]> => {
        if (caseId) {
            return this.getByIndex('caseId', caseId);
        }
        return this.getAll();
    }

    getAll = async (): Promise<TrialExhibit[]> => {
        return db.getAll<TrialExhibit>(STORES.EXHIBITS);
    }
}