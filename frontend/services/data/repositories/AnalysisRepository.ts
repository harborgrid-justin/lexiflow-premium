import { BriefAnalysisSession, JudgeProfile } from '../../../types';
import { delay } from '../../../utils/async';
import { Repository } from '../../../core/Repository';
import { STORES, db } from '../db';

export class AnalysisRepository extends Repository<BriefAnalysisSession> {
    constructor() {
        super(STORES.ANALYSIS);
    }
    
    async getJudgeProfiles(): Promise<JudgeProfile[]> {
        await delay(100);
        return db.getAll<JudgeProfile>(STORES.JUDGES);
    }
    
    async getCounselProfiles(): Promise<any[]> {
        await delay(100);
        // Return empty array - this would typically fetch from a COUNSEL_PROFILES store
        return [];
    }
    
    async getPredictionData(): Promise<any[]> {
        await delay(100);
        // Return empty array - this would typically fetch from a PREDICTIONS store
        return [];
    }
}

