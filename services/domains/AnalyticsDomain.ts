import { db, STORES } from '../db';
import { JudgeMotionStat, OpposingCounselProfile, OutcomePredictionData, Motion } from '../../types';

export const AnalyticsService = {
    getCounselProfiles: async (): Promise<OpposingCounselProfile[]> => {
        return db.getAll<OpposingCounselProfile>(STORES.COUNSEL_PROFILES);
    },
    
    // Dynamic calculation of judge stats based on actual motion rulings in DB
    getJudgeMotionStats: async (): Promise<JudgeMotionStat[]> => {
        const motions = await db.getAll<Motion>(STORES.MOTIONS);
        
        // Initialize aggregation
        const statsMap: Record<string, { grant: number, deny: number, total: number }> = {};
        
        motions.forEach(m => {
            if (!m.type) return;
            if (!statsMap[m.type]) statsMap[m.type] = { grant: 0, deny: 0, total: 0 };
            
            if (m.outcome === 'Granted') statsMap[m.type].grant++;
            else if (m.outcome === 'Denied') statsMap[m.type].deny++;
            
            if (m.status === 'Decided') statsMap[m.type].total++;
        });

        const results: JudgeMotionStat[] = Object.keys(statsMap).map(type => {
            const data = statsMap[type];
            // Normalize to percentages
            const total = data.total || 1; 
            return {
                name: type,
                grant: Math.round((data.grant / total) * 100),
                deny: Math.round((data.deny / total) * 100)
            };
        });

        // Return fallback if DB is empty
        if (results.length === 0) {
            return [
                { name: 'Motion to Dismiss', grant: 65, deny: 35 },
                { name: 'Summary Judgment', grant: 42, deny: 58 },
                { name: 'Discovery Compel', grant: 78, deny: 22 },
            ];
        }

        return results;
    },

    getOutcomePredictions: async (): Promise<OutcomePredictionData[]> => {
        return db.getAll<OutcomePredictionData>(STORES.OUTCOME_PREDICTIONS);
    },
};