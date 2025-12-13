import { BriefAnalysisSession, JudgeProfile } from '../../types';
import { Repository } from '../core/Repository';
import { STORES, db } from '../db';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class AnalysisRepository extends Repository<BriefAnalysisSession> {
getCounselProfiles<T>(arg0: string[], getCounselProfiles: any, arg2: { staleTime: number; }): { data?: never[] | undefined; } {
throw new Error('Method not implemented.');
}
getPredictionData<T>(arg0: string[], getPredictionData: any, arg2: { staleTime: number; }): { data?: never[] | undefined; } {
throw new Error('Method not implemented.');
}
    constructor() {
        super(STORES.ANALYSIS);
    }

    async getJudgeProfiles(): Promise<JudgeProfile[]> {
        await delay(100);
        return db.getAll<JudgeProfile>(STORES.JUDGES);
    }
}