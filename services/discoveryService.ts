
import { Deposition, ESISource, ProductionSet, CustodianInterview, DiscoveryRequest } from '../types';
import { db, STORES } from './db';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const DiscoveryService = {
    // Depositions
    getDepositions: async (caseId?: string) => {
        const depositions = await db.getAll<Deposition>(STORES.DISCOVERY_EXT_DEPO);
        return caseId ? depositions.filter(d => d.caseId === caseId) : depositions;
    },
    addDeposition: async (dep: Deposition) => {
        return db.put(STORES.DISCOVERY_EXT_DEPO, dep);
    },
    updateDepositionStatus: async (id: string, status: string) => {
        const dep = await db.get<Deposition>(STORES.DISCOVERY_EXT_DEPO, id);
        if (!dep) throw new Error("Deposition not found");
        return db.put(STORES.DISCOVERY_EXT_DEPO, { ...dep, status: status as any });
    },

    // ESI
    getESISources: async (caseId?: string) => {
        const sources = await db.getAll<ESISource>(STORES.DISCOVERY_EXT_ESI);
        return caseId ? sources.filter(e => e.caseId === caseId) : sources;
    },
    addESISource: async (source: ESISource) => {
        return db.put(STORES.DISCOVERY_EXT_ESI, source);
    },
    updateESISourceStatus: async (id: string, status: string) => {
        const source = await db.get<ESISource>(STORES.DISCOVERY_EXT_ESI, id);
        if (!source) throw new Error("Source not found");
        return db.put(STORES.DISCOVERY_EXT_ESI, { ...source, status: status as any });
    },

    // Productions
    getProductions: async (caseId?: string) => {
        const productions = await db.getAll<ProductionSet>(STORES.DISCOVERY_EXT_PROD);
        return caseId ? productions.filter(p => p.caseId === caseId) : productions;
    },
    createProduction: async (prod: ProductionSet) => {
        return db.put(STORES.DISCOVERY_EXT_PROD, prod);
    },

    // Interviews
    getInterviews: async (caseId?: string) => {
        const interviews = await db.getAll<CustodianInterview>(STORES.DISCOVERY_EXT_INT);
        return caseId ? interviews.filter(i => i.caseId === caseId) : interviews;
    },
    updateInterview: async (id: string, updates: Partial<CustodianInterview>) => {
        const interview = await db.get<CustodianInterview>(STORES.DISCOVERY_EXT_INT, id);
        if (!interview) throw new Error("Interview not found");
        return db.put(STORES.DISCOVERY_EXT_INT, { ...interview, ...updates });
    },
    createInterview: async (interview: CustodianInterview) => {
        return db.put(STORES.DISCOVERY_EXT_INT, interview);
    },

    // Requests (Enhanced)
    getRequests: async (caseId?: string) => {
        const requests = await db.getAll<DiscoveryRequest>(STORES.REQUESTS);
        return caseId ? requests.filter(r => r.caseId === caseId) : requests;
    },
    updateRequestStatus: async (id: string, status: string) => {
        const request = await db.get<DiscoveryRequest>(STORES.REQUESTS, id);
        if (!request) throw new Error("Request not found");
        return db.put(STORES.REQUESTS, { ...request, status: status as any });
    },
    
    getLegalHolds: async () => db.getAll<any>(STORES.LEGAL_HOLDS),
    getPrivilegeLog: async () => db.getAll<any>(STORES.PRIVILEGE_LOG),

    syncDeadlines: async () => { await delay(1000); },
    startCollection: async (id: string) => { await delay(500); return "job-123"; },
    downloadProduction: async (id: string) => { await delay(800); return "https://example.com/prod.zip"; }
};
