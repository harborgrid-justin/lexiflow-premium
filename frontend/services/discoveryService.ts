/**
 * @module services/discoveryService
 * @category Services - Discovery
 * @description Discovery service managing all FRCP discovery workflows: depositions, ESI sources,
 * productions, interviews, requests (Rule 33/34/36), examinations (Rule 35), transcripts (Rule 32),
 * vendors (Rule 28), sanctions (Rule 37). Provides CRUD operations with case filtering, status
 * updates, and IndexedDB persistence for each discovery type.
 */

// ============================================================================
// INTERNAL DEPENDENCIES
// Services & Data
import { db, STORES } from './db';
import { delay } from '../utils/async';
// Types
import { 
    Deposition, ESISource, ProductionSet, CustodianInterview, 
    DiscoveryRequest, PrivilegeLogEntry, LegalHold, 
    Examination, Vendor, Transcript, SanctionMotion, StipulationRequest 
} from '../types';
// HELPER FUNCTIONS
// SERVICE
export const DiscoveryService = {
    // Depositions
    getDepositions: async (caseId?: string) => {
        const depositions = await db.getAll<Deposition>(STORES.DISCOVERY_EXT_DEPO);
        return caseId ? depositions.filter(d => d.caseId === caseId) : depositions;
    },
    addDeposition: async (dep: Deposition) => {
        return db.put(STORES.DISCOVERY_EXT_DEPO, dep);
    updateDepositionStatus: async (id: string, status: string) => {
        const dep = await db.get<Deposition>(STORES.DISCOVERY_EXT_DEPO, id);
        if (!dep) throw new Error("Deposition not found");
        return db.put(STORES.DISCOVERY_EXT_DEPO, { ...dep, status: status as any });
    // ESI
    getESISources: async (caseId?: string) => {
        const sources = await db.getAll<ESISource>(STORES.DISCOVERY_EXT_ESI);
        return caseId ? sources.filter(e => e.caseId === caseId) : sources;
    addESISource: async (source: ESISource) => {
        return db.put(STORES.DISCOVERY_EXT_ESI, source);
    updateESISourceStatus: async (id: string, status: string) => {
        const source = await db.get<ESISource>(STORES.DISCOVERY_EXT_ESI, id);
        if (!source) throw new Error("Source not found");
        return db.put(STORES.DISCOVERY_EXT_ESI, { ...source, status: status as any });
    // Productions
    getProductions: async (caseId?: string) => {
        const productions = await db.getAll<ProductionSet>(STORES.DISCOVERY_EXT_PROD);
        return caseId ? productions.filter(p => p.caseId === caseId) : productions;
    createProduction: async (prod: ProductionSet) => {
        return db.put(STORES.DISCOVERY_EXT_PROD, prod);
    // Interviews
    getInterviews: async (caseId?: string) => {
        const interviews = await db.getAll<CustodianInterview>(STORES.DISCOVERY_EXT_INT);
        return caseId ? interviews.filter(i => i.caseId === caseId) : interviews;
    updateInterview: async (id: string, updates: Partial<CustodianInterview>) => {
        const interview = await db.get<CustodianInterview>(STORES.DISCOVERY_EXT_INT, id);
        if (!interview) throw new Error("Interview not found");
        return db.put(STORES.DISCOVERY_EXT_INT, { ...interview, ...updates });
    createInterview: async (interview: CustodianInterview) => {
        return db.put(STORES.DISCOVERY_EXT_INT, interview);
    // Requests (Rule 33/34/36)
    getRequests: async (caseId?: string) => {
        const requests = await db.getAll<DiscoveryRequest>(STORES.REQUESTS);
        return caseId ? requests.filter(r => r.caseId === caseId) : requests;
    addRequest: async (req: DiscoveryRequest) => {
        return db.put(STORES.REQUESTS, req);
    },
    updateRequestStatus: async (id: string, status: string) => {
        const request = await db.get<DiscoveryRequest>(STORES.REQUESTS, id);
        if (!request) throw new Error("Request not found");
        return db.put(STORES.REQUESTS, { ...request, status: status as any });
    },
    // --- NEW MODULES ---
    // Rule 35 Examinations
    getExaminations: async (caseId?: string) => {
        const exams = await db.getAll<Examination>(STORES.EXAMINATIONS);
        return caseId ? exams.filter(e => e.caseId === caseId) : exams;
    },
    addExamination: async (exam: Examination) => db.put(STORES.EXAMINATIONS, exam),
    // Rule 32 Transcripts
    getTranscripts: async (caseId?: string) => {
        const trans = await db.getAll<Transcript>(STORES.TRANSCRIPTS);
        return caseId ? trans.filter(t => t.caseId === caseId) : trans;
    },
    addTranscript: async (transcript: Transcript) => db.put(STORES.TRANSCRIPTS, transcript),
    // Rule 28 Vendors
    getVendors: async () => db.getAll<Vendor>(STORES.VENDORS),
    addVendor: async (vendor: Vendor) => db.put(STORES.VENDORS, vendor),
    // Rule 37 Sanctions
    getSanctions: async (caseId?: string) => {
        const sancs = await db.getAll<SanctionMotion>(STORES.SANCTIONS);
        return caseId ? sancs.filter(s => s.caseId === caseId) : sancs;
    },
    addSanctionMotion: async (motion: SanctionMotion) => db.put(STORES.SANCTIONS, motion),
    // Rule 29 Stipulations
    getStipulations: async (caseId?: string) => {
        const stips = await db.getAll<StipulationRequest>(STORES.STIPULATIONS);
        return caseId ? stips.filter(s => s.caseId === caseId) : stips;
    },
    addStipulation: async (stip: StipulationRequest) => db.put(STORES.STIPULATIONS, stip),
    
    // Common
    getLegalHolds: async () => db.getAll<LegalHold>(STORES.LEGAL_HOLDS),
    getPrivilegeLog: async () => db.getAll<PrivilegeLogEntry>(STORES.PRIVILEGE_LOG),
    syncDeadlines: async () => { await delay(1000); },
    startCollection: async (id: string) => { await delay(500); return "job-123"; },
    downloadProduction: async (id: string) => { await delay(800); return "https://example.com/prod.zip"; }
};
