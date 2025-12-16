import { BriefAnalysisSession, JudgeProfile } from '../../types';
import { delay } from '../../utils/async';
import { Repository } from '../core/Repository';
import { STORES, db } from '../db';

export class AnalysisRepository extends Repository<BriefAnalysisSession> {
getCounselProfiles<T>(arg0: string[], getCounselProfiles: any, arg2: { staleTime: number; }): { data?: never[] | undefined; } {
throw new Error('Method not implemented.');
}
getPredictionData<T>(arg0: string[], getPredictionData: any, arg2: { staleTime: number; }): { data?: never[] | undefined; } {
    constructor() {
        super(STORES.ANALYSIS);
    }
    async getJudgeProfiles(): Promise<JudgeProfile[]> {
        await delay(100);
        return db.getAll<JudgeProfile>(STORES.JUDGES);
