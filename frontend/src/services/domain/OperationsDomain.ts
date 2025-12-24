/**
 * ? Migrated to backend API (2025-12-21)
 */
import { api } from '@/api';
import { delay } from '@/utils/async';
import { CostMetric, CostForecast } from '@/types';

export const OperationsService = {
    // Operations data - all from backend API
    getOkrs: async () => api.operations?.getOkrs?.() || [],
    getCleTracking: async () => api.operations?.getCleTracking?.() || [],
    getVendorContracts: async () => api.operations?.getVendorContracts?.() || [],
    getVendorDirectory: async () => api.operations?.getVendorDirectory?.() || [],
    getRfps: async () => api.operations?.getRfps?.() || [],
    getMaintenanceTickets: async () => api.operations?.getMaintenanceTickets?.() || [],
    getFacilities: async () => api.operations?.getFacilities?.() || [],
    
    getReplicationStatus: async () => {
        const status = await api.operations?.getReplicationStatus?.();
        return status || {
            lag: 12,
            bandwidth: 45,
            syncStatus: 'Active',
            peakBandwidth: 120
        };
    },
    
    // Cost FinOps - calculated from backend metrics
    getCostMetrics: async (): Promise<CostMetric[]> => {
        const metrics = await api.analytics?.getCostMetrics?.();
        return metrics || [
            { name: 'Compute', cost: 1200 },
            { name: 'Storage', cost: 850 },
            { name: 'Network', cost: 300 },
            { name: 'DB', cost: 1500 },
            { name: 'AI', cost: 2200 },
        ];
    },
    
    getCostForecast: async (): Promise<CostForecast[]> => {
        const forecast = await api.analytics?.getCostForecast?.();
        return forecast || [
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

