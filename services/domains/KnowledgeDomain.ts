
import { WikiArticle, Precedent, QAItem } from '../../types';
import { db, STORES } from '../db';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export class KnowledgeRepository {
    getWikiArticles = async (query?: string): Promise<WikiArticle[]> => {
        const all = await db.getAll<WikiArticle>(STORES.WIKI);
        if (!query) return all;
        const q = query.toLowerCase();
        return all.filter(a => a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q));
    }
    
    getPrecedents = async (): Promise<Precedent[]> => {
        return db.getAll<Precedent>(STORES.PRECEDENTS);
    }

    getQA = async (): Promise<QAItem[]> => {
        return db.getAll<QAItem>(STORES.QA);
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
