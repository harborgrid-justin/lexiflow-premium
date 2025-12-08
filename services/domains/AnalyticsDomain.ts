import { db, STORES } from '../db';
import { JudgeMotionStat, OpposingCounselProfile, OutcomePredictionData } from '../../types';

export const AnalyticsService = {
    getCounselProfiles: async (): Promise<OpposingCounselProfile[]> => {
        return db.getAll<OpposingCounselProfile>(STORES.COUNSEL_PROFILES);
    },
    
    getJudgeMotionStats: async (): Promise<JudgeMotionStat[]> => {
        return db.getAll<JudgeMotionStat>(STORES.JUDGE_MOTION_STATS);
    },

    getOutcomePredictions: async (): Promise<OutcomePredictionData[]> => {
        return db.getAll<OutcomePredictionData>(STORES.OUTCOME_PREDICTIONS);
    },
};
