
import { 
    Deposition, ESISource, ProductionSet, CustodianInterview, 
    DiscoveryRequest, PrivilegeLogEntry, LegalHold, 
    Examination, Vendor, Transcript, SanctionMotion, StipulationRequest,
    ReviewBatch, ProcessingJob
} from '../../types';
import { db, STORES } from '../db';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class DiscoveryRepository {

    // --- Dashboard Stats ---
    getFunnelStats = async (): Promise<any[]> => {
        const stats = await db.get<any>(STORES.DISCOVERY_FUNNEL_STATS, 'funnel-main');
        return stats?.data || [];
    }

    getCustodianStats = async (): Promise<any[]> => {
        const stats = await db.get<any>(STORES.DISCOVERY_CUSTODIAN_STATS, 'custodian-main');
        return stats?.data || [];
    }
    
    // --- Review & Production ---
    
    getReviewBatches = async (caseId: string): Promise<ReviewBatch[]> => {
        return db.getByIndex(STORES.REVIEW_BATCHES, 'caseId', caseId);
    }

    createReviewBatch = async (batch: ReviewBatch) => {
        return db.put(STORES.REVIEW_BATCHES, batch);
    }

    getProcessingJobs = async (): Promise<ProcessingJob[]> => {
        return db.getAll(STORES.PROCESSING_JOBS);
    }

    // --- Core Discovery ---

    getDepositions = async (caseId?: string) => {
        const depositions = await db.getAll<Deposition>(STORES.DISCOVERY_EXT_DEPO);
        return caseId ? depositions.filter(d => d.caseId === caseId) : depositions;
    }
    addDeposition = async (dep: Deposition) => db.put(STORES.DISCOVERY_EXT_DEPO, dep);
    
    getESISources = async (caseId?: string) => {
        const sources = await db.getAll<ESISource>(STORES.DISCOVERY_EXT_ESI);
        return caseId ? sources.filter(e => e.caseId === caseId) : sources;
    }
    addESISource = async (source: ESISource) => db.put(STORES.DISCOVERY_EXT_ESI, source);
    updateESISourceStatus = async (id: string, status: string) => {
        const source = await db.get<ESISource>(STORES.DISCOVERY_EXT_ESI, id);
        if (!source) throw new Error("Source not found");
        return db.put(STORES.DISCOVERY_EXT_ESI, { ...source, status: status as any });
    }

    getProductions = async (caseId?: string) => {
        const productions = await db.getAll<ProductionSet>(STORES.DISCOVERY_EXT_PROD);
        return caseId ? productions.filter(p => p.caseId === caseId) : productions;
    }
    createProduction = async (prod: ProductionSet) => db.put(STORES.DISCOVERY_EXT_PROD, prod);
    downloadProduction = async (id: string) => { await delay(800); return "https://example.com/prod.zip"; }

    getInterviews = async (caseId?: string) => {
        const interviews = await db.getAll<CustodianInterview>(STORES.DISCOVERY_EXT_INT);
        return caseId ? interviews.filter(i => i.caseId === caseId) : interviews;
    }
    createInterview = async (interview: CustodianInterview) => db.put(STORES.DISCOVERY_EXT_INT, interview);

    getRequests = async (caseId?: string) => {
        const requests = await db.getAll<DiscoveryRequest>(STORES.REQUESTS);
        return caseId ? requests.filter(r => r.caseId === caseId) : requests;
    }
    addRequest = async (req: DiscoveryRequest) => db.put(STORES.REQUESTS, req);
    updateRequestStatus = async (id: string, status: string) => {
        const request = await db.get<DiscoveryRequest>(STORES.REQUESTS, id);
        if (!request) throw new Error("Request not found");
        return db.put(STORES.REQUESTS, { ...request, status: status as any });
    }

    // --- Extended Rules ---
    getExaminations = async (caseId?: string) => {
        const exams = await db.getAll<Examination>(STORES.EXAMINATIONS);
        return caseId ? exams.filter(e => e.caseId === caseId) : exams;
    }
    addExamination = async (exam: Examination) => db.put(STORES.EXAMINATIONS, exam);

    getTranscripts = async (caseId?: string) => {
        const trans = await db.getAll<Transcript>(STORES.TRANSCRIPTS);
        return caseId ? trans.filter(t => t.caseId === caseId) : trans;
    }
    addTranscript = async (transcript: Transcript) => db.put(STORES.TRANSCRIPTS, transcript);

    getVendors = async () => db.getAll<Vendor>(STORES.VENDORS);
    addVendor = async (vendor: Vendor) => db.put(STORES.VENDORS, vendor);
    
    getReporters = async () => db.getAll(STORES.REPORTERS);

    getSanctions = async (caseId?: string) => {
        const sancs = await db.getAll<SanctionMotion>(STORES.SANCTIONS);
        return caseId ? sancs.filter(s => s.caseId === caseId) : sancs;
    }
    addSanctionMotion = async (motion: SanctionMotion) => db.put(STORES.SANCTIONS, motion);

    getStipulations = async (caseId?: string) => {
        const stips = await db.getAll<StipulationRequest>(STORES.STIPULATIONS);
        return caseId ? stips.filter(s => s.caseId === caseId) : stips;
    }
    addStipulation = async (stip: StipulationRequest) => db.put(STORES.STIPULATIONS, stip);

    
    // Common
    getLegalHolds = async () => db.getAll<LegalHold>(STORES.LEGAL_HOLDS);
    getPrivilegeLog = async () => db.getAll<PrivilegeLogEntry>(STORES.PRIVILEGE_LOG);

    syncDeadlines = async () => { await delay(1000); };
    startCollection = async (id: string) => { await delay(500); return "job-123"; };
}
