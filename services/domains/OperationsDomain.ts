
import { db, STORES } from '../db';
import { CostMetric, CostForecast } from '../../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const OperationsService = {
    // Existing
    getOkrs: async () => db.getAll(STORES.OKRS),
    
    // New
    getCleTracking: async () => db.getAll(STORES.CLE_TRACKING),
    getVendorContracts: async () => db.getAll(STORES.VENDOR_CONTRACTS),
    getVendorDirectory: async () => db.getAll(STORES.VENDOR_DIRECTORY),
    getRfps: async () => db.getAll(STORES.RFPS),
    getMaintenanceTickets: async () => db.getAll(STORES.MAINTENANCE_TICKETS),
    getFacilities: async () => db.getAll(STORES.FACILITIES),
    
    // Cost FinOps
    getCostMetrics: async (): Promise<CostMetric[]> => {
        await delay(100);
        return [
            { name: 'Compute', cost: 1200 },
            { name: 'Storage', cost: 850 },
            { name: 'Network', cost: 300 },
            { name: 'DB', cost: 1500 },
            { name: 'AI', cost: 2200 },
        ];
    },
    getCostForecast: async (): Promise<CostForecast[]> => {
        await delay(100);
        return [
            { day: '1', actual: 120, forecast: 125 },
            { day: '5', actual: 135, forecast: 130 },
            { day: '10', actual: 140, forecast: 145 },
            { day: '15', actual: 180, forecast: 160 },
            { day: '20', actual: null, forecast: 185 },
            { day: '25', actual: null, forecast: 190 },
            { day: '30', actual: null, forecast: 210 },
        ];
    }
};
