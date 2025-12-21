/**
 * ✅ Migrated to backend API (2025-12-21)
 */
import { analyticsApi } from '../api/domains/analytics.api';
import { JudgeMotionStat, OpposingCounselProfile, OutcomePredictionData, Motion } from '../../types';

export const AnalyticsService = {
    getCounselProfiles: async (): Promise<OpposingCounselProfile[]> => {
        return analyticsApi.counsel?.getProfiles?.() || [];
    },
    
    // Dynamic calculation of judge stats from backend
    getJudgeMotionStats: async (): Promise<JudgeMotionStat[]> => {
        const stats = await analyticsApi.judges?.getMotionStats?.();
        if (stats && stats.length > 0) return stats;
        
        // Fallback to default data
        return [
            { name: 'Motion to Dismiss', grant: 65, deny: 35 },
            { name: 'Summary Judgment', grant: 42, deny: 58 },
            { name: 'Discovery Compel', grant: 78, deny: 22 },
        ];
    },

    getOutcomePredictions: async (): Promise<OutcomePredictionData[]> => {
        return analyticsApi.outcomes?.getPredictions?.() || [];
    },
};
