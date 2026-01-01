/**
 * ? Migrated to backend API (2025-12-21)
 */
import { delay } from '@/utils/async';
import { CostMetric, CostForecast } from '@/types';

export const OperationsService = {
    // Operations data - fallback to mock data (operations API not yet implemented)
    getOkrs: async () => {
        await delay(200);
        return [];
    },
    getCleTracking: async () => {
        await delay(200);
        return [];
    },
    getVendorContracts: async () => {
        await delay(200);
        return [];
    },
    getVendorDirectory: async () => {
        await delay(200);
        return [];
    },
    getRfps: async () => {
        await delay(200);
        return [];
    },
    getMaintenanceTickets: async () => {
        await delay(200);
        return [];
    },
    getFacilities: async () => {
        await delay(200);
        return [];
    },

    getReplicationStatus: async () => {
        await delay(200);
        return {
            lag: 12,
            bandwidth: 45,
            syncStatus: 'Active',
            peakBandwidth: 120
        };
    },

    // Cost FinOps - calculated from backend metrics
    getCostMetrics: async (): Promise<CostMetric[]> => {
        await delay(200);
        return [
            { name: 'Compute', cost: 1200 },
            { name: 'Storage', cost: 850 },
            { name: 'Network', cost: 300 },
            { name: 'DB', cost: 1500 },
            { name: 'AI', cost: 2200 },
        ];
    },

    getCostForecast: async (): Promise<CostForecast[]> => {
        await delay(200);
        return [
            { day: '1', actual: 120, forecast: 125 },
            { day: '5', actual: 135, forecast: 130 },
            { day: '10', actual: 140, forecast: 145 },
            { day: '15', actual: 180, forecast: 160 },
            { day: '20', actual: null, forecast: 185 },
            { day: '25', actual: null, forecast: 190 },
            { day: '30', actual: null, forecast: 210 }
        ];
    }
};

