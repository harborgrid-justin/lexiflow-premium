import { WikiArticle, Precedent, QAItem } from '../../types';
import { delay } from '../../utils/async';
/**
 * ✅ Migrated to backend API (2025-12-21)
 */
import { analyticsApi } from '../api/domains/analytics.api';

export class KnowledgeRepository {
    getWikiArticles = async (query?: string): Promise<WikiArticle[]> => {
        const all = await analyticsApi.knowledge?.getWikiArticles?.() || [];
        if (!query) return all;
        const q = query.toLowerCase();
        return all.filter((a: WikiArticle) => a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q));
    }
    
    getPrecedents = async (): Promise<Precedent[]> => {
        return analyticsApi.knowledge?.getPrecedents?.() || [];
    }
    
    getQA = async (): Promise<QAItem[]> => {
        return analyticsApi.knowledge?.getQA?.() || [];
    }
    
    getAnalytics = async (): Promise<any> => {
        await delay(200);
        return { 
            usage: [
                { name: 'Jan', views: 400 },
                { name: 'Feb', views: 300 },
                { name: 'Mar', views: 600 },
            ], 
            topics: [
                { name: 'Litigation', value: 40, color: '#3b82f6' },
                { name: 'Finance', value: 25, color: '#8b5cf6' },
                { name: 'HR', value: 15, color: '#10b981' },
            ]
        };
    }
}

