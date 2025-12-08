
import { Client } from '../../types';
import { db, STORES } from '../db';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const CRMService = {
    getLeads: async () => {
        return db.getAll(STORES.LEADS);
    },
    getAnalytics: async () => {
        const analytics = await db.get(STORES.CRM_ANALYTICS, 'crm-analytics-main');
        return analytics || { growth: [], industry: [], revenue: [], sources: [] };
    },
    updateLead: async (id: string, updates: { stage: string }) => {
        console.log(`[API] Updating lead ${id}`, updates);
        const lead = await db.get<any>(STORES.LEADS, id);
        if(lead) {
            await db.put(STORES.LEADS, { ...lead, ...updates });
        }
        return { id, ...updates };
    }
};
