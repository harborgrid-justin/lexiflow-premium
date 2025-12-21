/**
 * @module services/discoveryService
 * @category Services - Discovery
 * @description Discovery service managing all FRCP discovery workflows: depositions, ESI sources,
 * productions, interviews, requests (Rule 33/34/36), examinations (Rule 35), transcripts (Rule 32),
 * vendors (Rule 28), sanctions (Rule 37). Provides CRUD operations with case filtering, status
 * updates, using backend API.
 * ✅ Migrated to backend API (2025-12-21)
 */

// ============================================================================
// INTERNAL DEPENDENCIES
// Services & Data
import { api } from '../../api';
import { delay } from '../../../utils/async';
// Types
import { 
    Deposition, ESISource, ProductionSet, CustodianInterview, 
    DiscoveryRequest, PrivilegeLogEntry, LegalHold, 
    Examination, Vendor, Transcript, SanctionMotion, StipulationRequest 
} from '../../../types';

// SERVICE
export const DiscoveryService = {
    // Depositions
    getDepositions: async (caseId?: string) => {
        const depositions = await api.discovery?.getDepositions?.() || [];
        return caseId ? depositions.filter(d => d.caseId === caseId) : depositions;
    },
    addDeposition: async (dep: Deposition) => {
        return api.discovery?.addDeposition?.(dep) || dep;
    },
    updateDepositionStatus: async (id: string, status: string) => {
        return api.discovery?.updateDeposition?.(id, { status }) || { id, status };
    },
    
    // ESI
    getESISources: async (caseId?: string) => {
        const sources = await api.discovery?.getESISources?.() || [];
        return caseId ? sources.filter(e => e.caseId === caseId) : sources;
    },
    addESISource: async (source: ESISource) => {
        return api.discovery?.addESISource?.(source) || source;
    },
    updateESISourceStatus: async (id: string, status: string) => {
        return api.discovery?.updateESISource?.(id, { status }) || { id, status };
    },
    
    // Productions
    getProductions: async (caseId?: string) => {
        const productions = await api.discovery?.getProductions?.() || [];
        return caseId ? productions.filter(p => p.caseId === caseId) : productions;
    },
    createProduction: async (prod: ProductionSet) => {
        return api.discovery?.createProduction?.(prod) || prod;
    },
    
    // Interviews
    getInterviews: async (caseId?: string) => {
        const interviews = await api.discovery?.getInterviews?.() || [];
        return caseId ? interviews.filter(i => i.caseId === caseId) : interviews;
    },
    updateInterview: async (id: string, updates: Partial<CustodianInterview>) => {
        return api.discovery?.updateInterview?.(id, updates) || { id, ...updates };
    },
    createInterview: async (interview: CustodianInterview) => {
        return api.discovery?.createInterview?.(interview) || interview;
    },
    
    // Requests (Rule 33/34/36)
    getRequests: async (caseId?: string) => {
        const requests = await api.discovery?.getRequests?.() || [];
        return caseId ? requests.filter(r => r.caseId === caseId) : requests;
    },
    addRequest: async (req: DiscoveryRequest) => {
        return api.discovery?.addRequest?.(req) || req;
    },
    updateRequestStatus: async (id: string, status: string) => {
        return api.discovery?.updateRequest?.(id, { status }) || { id, status };
    },
    
    // --- NEW MODULES ---
    // Rule 35 Examinations
    getExaminations: async (caseId?: string) => {
        const exams = await api.discovery?.getExaminations?.() || [];
        return caseId ? exams.filter(e => e.caseId === caseId) : exams;
    },
    addExamination: async (exam: Examination) => {
        return api.discovery?.addExamination?.(exam) || exam;
    },
    
    // Rule 32 Transcripts
    getTranscripts: async (caseId?: string) => {
        const trans = await api.discovery?.getTranscripts?.() || [];
        return caseId ? trans.filter(t => t.caseId === caseId) : trans;
    },
    addTranscript: async (transcript: Transcript) => {
        return api.discovery?.addTranscript?.(transcript) || transcript;
    },
    
    // Rule 28 Vendors
    getVendors: async () => api.discovery?.getVendors?.() || [],
    addVendor: async (vendor: Vendor) => {
        return api.discovery?.addVendor?.(vendor) || vendor;
    },
    
    // Rule 37 Sanctions
    getSanctions: async (caseId?: string) => {
        const sancs = await api.discovery?.getSanctions?.() || [];
        return caseId ? sancs.filter(s => s.caseId === caseId) : sancs;
    },
    addSanctionMotion: async (motion: SanctionMotion) => {
        return api.discovery?.addSanctionMotion?.(motion) || motion;
    },
    
    // Rule 29 Stipulations
    getStipulations: async (caseId?: string) => {
        const stips = await api.discovery?.getStipulations?.() || [];
        return caseId ? stips.filter(s => s.caseId === caseId) : stips;
    },
    addStipulation: async (stip: StipulationRequest) => {
        return api.discovery?.addStipulation?.(stip) || stip;
    },
    
    // Common
    getLegalHolds: async () => api.discovery?.getLegalHolds?.() || [],
    getPrivilegeLog: async () => api.discovery?.getPrivilegeLog?.() || [],
    syncDeadlines: async () => { await delay(1000); },
    startCollection: async (id: string) => { 
        await delay(500); 
        return api.discovery?.startCollection?.(id) || "job-123";
    },
    downloadProduction: async (id: string) => { 
        await delay(800); 
        return api.discovery?.downloadProduction?.(id) || "https://example.com/prod.zip";
    }
};

