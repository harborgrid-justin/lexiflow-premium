
import { BriefAnalysisSession, JudgeProfile } from '../../types';
import { Repository } from '../core/Repository';
import { STORES, db } from '../db';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class AnalysisRepository extends Repository<BriefAnalysisSession> {
    constructor() {
        super(STORES.ANALYSIS);
    }

    async getJudgeProfiles(): Promise<JudgeProfile[]> {
        await delay(100);
        return db.getAll<JudgeProfile>(STORES.JUDGES);
    }
}
