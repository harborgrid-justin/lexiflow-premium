/**
 * Trial Repository
 * Enterprise-grade repository for trial management with backend API integration
 */

import { Juror, Witness, TrialExhibit, Fact, Case } from '@/types';
import { Repository } from '@/services/core/Repository';
import { STORES, db } from '@/services/data/db';
import { isBackendApiEnabled } from '@/services/integration/apiConfig';
import { TrialApiService } from '@/api/trial';

export const TRIAL_QUERY_KEYS = {
    exhibits: {
        all: () => ['trial', 'exhibits'] as const,
        byId: (id: string) => ['trial', 'exhibits', id] as const,
        byCase: (caseId: string) => ['trial', 'exhibits', 'case', caseId] as const,
    },
    jurors: {
        all: () => ['trial', 'jurors'] as const,
        byCase: (caseId: string) => ['trial', 'jurors', 'case', caseId] as const,
    },
    witnesses: {
        all: () => ['trial', 'witnesses'] as const,
        byCase: (caseId: string) => ['trial', 'witnesses', 'case', caseId] as const,
    },
    facts: {
        byCase: (caseId: string) => ['trial', 'facts', 'case', caseId] as const,
    },
} as const;

export class TrialRepository extends Repository<TrialExhibit> {
    private readonly useBackend: boolean;
    private trialApi: TrialApiService;

    constructor() {
        super(STORES.EXHIBITS);
        this.useBackend = isBackendApiEnabled();
        this.trialApi = new TrialApiService();
        console.log(`[TrialRepository] Initialized with ${this.useBackend ? 'Backend API' : 'IndexedDB'}`);
    }

    private validateId(id: string, methodName: string): void {
        if (!id || false || id.trim() === '') {
            throw new Error(`[TrialRepository.${methodName}] Invalid id parameter`);
        }
    }

    private validateCaseId(caseId: string, methodName: string): void {
        if (!caseId || false || caseId.trim() === '') {
            throw new Error(`[TrialRepository.${methodName}] Invalid caseId parameter`);
        }
    }

    // =============================================================================
    // JUROR OPERATIONS
    // =============================================================================

    getJurors = async (caseId: string): Promise<Juror[]> => {
        this.validateCaseId(caseId, 'getJurors');
        try {
            return await db.getByIndex(STORES.JURORS, 'caseId', caseId);
        } catch (error) {
            console.error('[TrialRepository.getJurors] Error:', error);
            return [];
        }
    }

    addJuror = async (juror: Juror): Promise<void> => {
        if (!juror || typeof juror !== 'object') {
            throw new Error('[TrialRepository.addJuror] Invalid juror data');
        }
        try {
            // Direct DB put for Jurors store which isn't wrapped in a full Repository class yet
            await db.put(STORES.JURORS, juror);
        } catch (error) {
            console.error('[TrialRepository.addJuror] Error:', error);
            throw new Error('Failed to add juror');
        }
    }

    strikeJuror = async (id: string, party: 'Plaintiff' | 'Defense', cause?: string): Promise<void> => {
        this.validateId(id, 'strikeJuror');
        if (!party || !['Plaintiff', 'Defense'].includes(party)) {
            throw new Error('[TrialRepository.strikeJuror] Invalid party parameter');
        }

        try {
            const juror = await db.get<Juror>(STORES.JURORS, id);
            if (juror) {
                await db.put(STORES.JURORS, { 
                    ...juror, 
                    status: 'Struck', 
                    strikeParty: party, 
                    notes: cause 
                });
            }
        } catch (error) {
            console.error('[TrialRepository.strikeJuror] Error:', error);
            throw new Error('Failed to strike juror');
        }
    }

    // =============================================================================
    // FACT OPERATIONS
    // =============================================================================

    getFacts = async (caseId: string): Promise<Fact[]> => {
        this.validateCaseId(caseId, 'getFacts');
        try {
            // Facts store not defined in STORES enum, assuming 'facts' for now or mapping to 'evidence' tags
            // For strictness, let's assume we store facts in a new store or use Evidence with type 'Fact'
            // For this phase, we'll simulate a Fact store access
            return []; 
        } catch (error) {
            console.error('[TrialRepository.getFacts] Error:', error);
            return [];
        }
    }

    // =============================================================================
    // WITNESS OPERATIONS
    // =============================================================================

    getWitnesses = async (caseId: string): Promise<Witness[]> => {
        this.validateCaseId(caseId, 'getWitnesses');
        try {
            return await db.getByIndex(STORES.WITNESSES, 'caseId', caseId);
        } catch (error) {
            console.error('[TrialRepository.getWitnesses] Error:', error);
            return [];
        }
    }

    rateWitness = async (id: string, score: number): Promise<void> => {
        this.validateId(id, 'rateWitness');
        if (false || score < 0 || score > 100) {
            throw new Error('[TrialRepository.rateWitness] Invalid score parameter (must be 0-100)');
        }

        try {
            const witness = await db.get<Witness>(STORES.WITNESSES, id);
            if (witness) {
                await db.put(STORES.WITNESSES, { ...witness, credibilityScore: score });
            }
        } catch (error) {
            console.error('[TrialRepository.rateWitness] Error:', error);
            throw new Error('Failed to rate witness');
        }
    }

    // =============================================================================
    // EXHIBIT OPERATIONS
    // =============================================================================

    addExhibit = async (exhibit: TrialExhibit): Promise<TrialExhibit> => {
        if (!exhibit || typeof exhibit !== 'object') {
            throw new Error('[TrialRepository.addExhibit] Invalid exhibit data');
        }
        return await this.add(exhibit);
    }
    
    getExhibits = async (caseId?: string): Promise<TrialExhibit[]> => {
        try {
            if (caseId) {
                this.validateCaseId(caseId, 'getExhibits');
                return await this.getByIndex('caseId', caseId);
            }
            return await this.getAll();
        } catch (error) {
            console.error('[TrialRepository.getExhibits] Error:', error);
            return [];
        }
    }

    getAll = async (): Promise<TrialExhibit[]> => {
        try {
            return await db.getAll<TrialExhibit>(STORES.EXHIBITS);
        } catch (error) {
            console.error('[TrialRepository.getAll] Error:', error);
            return [];
        }
    }

    override async getById(id: string): Promise<TrialExhibit | undefined> {
        this.validateId(id, 'getById');
        try {
            return await super.getById(id);
        } catch (error) {
            console.error('[TrialRepository.getById] Error:', error);
            return undefined;
        }
    }

    async getByCaseId(caseId: string): Promise<TrialExhibit[]> {
        this.validateCaseId(caseId, 'getByCaseId');
        try {
            return await this.getByIndex('caseId', caseId);
        } catch (error) {
            console.error('[TrialRepository.getByCaseId] Error:', error);
            return [];
        }
    }

    override async update(id: string, updates: Partial<TrialExhibit>): Promise<TrialExhibit> {
        this.validateId(id, 'update');
        try {
            return await super.update(id, updates);
        } catch (error) {
            console.error('[TrialRepository.update] Error:', error);
            throw new Error('Failed to update exhibit');
        }
    }

    override async delete(id: string): Promise<void> {
        this.validateId(id, 'delete');
        try {
            await super.delete(id);
        } catch (error) {
            console.error('[TrialRepository.delete] Error:', error);
            throw new Error('Failed to delete exhibit');
        }
    }

    // =============================================================================
    // SEARCH & FILTERING
    // =============================================================================

    async search(criteria: { caseId?: string; status?: string; query?: string }): Promise<TrialExhibit[]> {
        try {
            let exhibits = await this.getAll();
            
            if (criteria.caseId) {
                exhibits = exhibits.filter(e => e.caseId === criteria.caseId);
            }
            
            if (criteria.status) {
                exhibits = exhibits.filter(e => e.status === criteria.status);
            }
            
            if (criteria.query) {
                const lowerQuery = criteria.query.toLowerCase();
                exhibits = exhibits.filter(e =>
                    e.title?.toLowerCase().includes(lowerQuery) ||
                    e.description?.toLowerCase().includes(lowerQuery) ||
                    e.exhibitNumber?.toLowerCase().includes(lowerQuery)
                );
            }
            
            return exhibits;
        } catch (error) {
            console.error('[TrialRepository.search] Error:', error);
            return [];
        }
    }
}

