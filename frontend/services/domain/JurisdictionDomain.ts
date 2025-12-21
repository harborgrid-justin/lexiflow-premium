
// TODO: Migrate to backend API - IndexedDB deprecated
import { db, STORES } from '../data/db';
import { delay } from '../../utils/async';
import { JurisdictionAPI } from '../api/jurisdiction-api';

export const JurisdictionService = {
    getAll: async () => {
        try {
            return await JurisdictionAPI.getAll();
        } catch (error) {
            console.warn('Backend API unavailable, using IndexedDB fallback');
            return db.getAll(STORES.JURISDICTIONS);
        }
    },
    
    getFederal: async () => {
        try {
            return await JurisdictionAPI.getFederal();
        } catch (error) {
            console.warn('Backend API unavailable, using IndexedDB fallback');
            const all = await db.getAll<any>(STORES.JURISDICTIONS);
            return all.filter((j: any) => j.system === 'Federal');
        }
    },
    
    getState: async () => {
        try {
            return await JurisdictionAPI.getState();
        } catch (error) {
            console.warn('Backend API unavailable, using IndexedDB fallback');
            const all = await db.getAll<any>(STORES.JURISDICTIONS);
            return all.filter((j: any) => j.system === 'State');
        }
    },
    getRegulatoryBodies: async () => {
        try {
            return await JurisdictionAPI.getRegulatory();
        } catch (error) {
            console.warn('Backend API unavailable, using mock data');
            await delay(100);
            return [
                { id: 'reg1', name: 'FTC', desc: 'Federal Trade Commission', ref: '15 U.S.C. Â§ 41', iconColor: 'text-blue-600' },
                { id: 'reg2', name: 'SEC', desc: 'Securities & Exchange Commission', ref: '15 U.S.C. Â§ 78d', iconColor: 'text-green-600' },
                { id: 'reg3', name: 'EPA', desc: 'Environmental Protection Agency', ref: '42 U.S.C. Â§ 4321', iconColor: 'text-emerald-600' },
                { id: 'reg4', name: 'FCC', desc: 'Federal Communications Commission', ref: '47 U.S.C. Â§ 151', iconColor: 'text-purple-600' },
                { id: 'reg5', name: 'EEOC', desc: 'Equal Employment Opportunity Comm.', ref: '42 U.S.C. Â§ 2000e', iconColor: 'text-rose-600' },
            ];
        }
    },
    
    getTreaties: async () => {
        try {
            return await JurisdictionAPI.getInternational();
        } catch (error) {
            console.warn('Backend API unavailable, using mock data');
            await delay(100);
            return [
                { id: 't1', name: 'Hague Service Convention', type: 'Service of Process', status: 'Ratified', parties: 79 },
                { id: 't2', name: 'Hague Evidence Convention', type: 'Discovery', status: 'Ratified', parties: 63 },
                { id: 't3', name: 'New York Convention', type: 'Arbitration Enforcement', status: 'Ratified', parties: 172 },
                { id: 't4', name: 'CISG', type: 'Commercial Contracts', status: 'Ratified', parties: 95 }
            ];
        }
    },
    
    getArbitrationProviders: async () => {
        try {
            return await JurisdictionAPI.getArbitration();
        } catch (error) {
            console.warn('Backend API unavailable, using mock data');
            await delay(100);
            return [
                { id: 'aaa', name: 'AAA', fullName: 'American Arbitration Association', rules: ['Commercial', 'Consumer', 'Employment'] },
                { id: 'jams', name: 'JAMS', fullName: 'Judicial Arbitration and Mediation Services', rules: ['Comprehensive', 'Streamlined'] },
                { id: 'icc', name: 'ICC', fullName: 'International Chamber of Commerce', rules: ['ICC Rules of Arbitration'] }
            ];
        }
    },
    
    getMapNodes: async () => {
        try {
            return await JurisdictionAPI.getMapNodes();
        } catch (error) {
            console.warn('Backend API unavailable, using mock data');
            await delay(100);
            return [
                { id: 'n1', label: 'SCOTUS', type: 'federal', x: 400, y: 50, radius: 40 },
                { id: 'n2', label: '9th Cir.', type: 'federal', x: 200, y: 150, radius: 30 },
                { id: 'n3', label: '4th Cir.', type: 'federal', x: 600, y: 150, radius: 30 },
                { id: 'n4', label: 'N.D. Cal', type: 'federal', x: 150, y: 250, radius: 25 },
                { id: 'n5', label: 'E.D. Va', type: 'federal', x: 650, y: 250, radius: 25 },
                { id: 'n6', label: 'CA Supreme', type: 'state', x: 100, y: 350, radius: 30 },
                { id: 'n7', label: 'VA Supreme', type: 'state', x: 700, y: 350, radius: 30 },
                { id: 'n8', label: 'SF Superior', type: 'state', x: 100, y: 450, radius: 20 },
                { id: 'n9', label: 'Fairfax Cir.', type: 'state', x: 700, y: 450, radius: 20 }
            ];
        }
    }
};

