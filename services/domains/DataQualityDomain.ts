
import { DataAnomaly, DedupeCluster, CleansingRule, QualityMetricHistory, DataProfile } from '../../types';
import { db, STORES } from '../db';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class DataQualityService {
    async getAnomalies(): Promise<DataAnomaly[]> { 
        // In real app, scan DB. Here we return seeded anomalies.
        const anomalies = await db.getAll<DataAnomaly>('anomalies'); // Assuming store exists or using mock
        if (anomalies.length === 0) {
             return [
                { id: 1, table: 'clients', field: 'email', issue: 'Invalid Format', count: 12, sample: 'john-doe@', status: 'Detected', severity: 'High'},
                { id: 2, table: 'cases', field: 'status', issue: 'Inconsistent Casing', count: 5, sample: 'closed', status: 'Fixed', severity: 'Low'},
            ];
        }
        return anomalies;
    }

    async getDedupeClusters(): Promise<DedupeCluster[]> { await delay(100); return []; }
    async getHistory(): Promise<QualityMetricHistory[]> { await delay(100); return []; }
    async runCleansingJob(rules: CleansingRule[]): Promise<{ processed: number, fixed: number }> { await delay(800); return { processed: 1500, fixed: 42 }; }
    async mergeCluster(clusterId: string, masterId: string): Promise<void> { await delay(100); }
    async ignoreCluster(clusterId: string): Promise<void> { await delay(100); }
    async applyFix(anomalyId: number): Promise<void> { await delay(100); }
    
    // Dynamic Profiler that actually reads the 'cases' store
    async getProfiles(): Promise<DataProfile[]> {
        const cases = await db.getAll<any>(STORES.CASES);
        const total = cases.length;

        // Profile 'status'
        const statusCounts = cases.reduce((acc: any, c) => {
            acc[c.status] = (acc[c.status] || 0) + 1;
            return acc;
        }, {});
        const statusDist = Object.keys(statusCounts).map(k => ({ name: k, value: statusCounts[k] }));

        // Profile 'value'
        const valueNulls = cases.filter(c => c.value === undefined || c.value === null).length;
        const valueDist = [
            { name: '0-10k', value: cases.filter(c => (c.value || 0) < 10000).length },
            { name: '10k-100k', value: cases.filter(c => (c.value || 0) >= 10000 && (c.value || 0) < 100000).length },
            { name: '100k+', value: cases.filter(c => (c.value || 0) >= 100000).length }
        ];

        await delay(500); // Simulate processing time

        return [
            {
                column: 'status',
                type: 'string',
                nulls: 0,
                unique: Object.keys(statusCounts).length,
                distribution: statusDist
            },
            {
                column: 'value',
                type: 'numeric',
                nulls: parseFloat(((valueNulls / total) * 100).toFixed(1)),
                unique: new Set(cases.map(c => c.value)).size,
                distribution: valueDist
            },
            {
                column: 'filing_date',
                type: 'datetime',
                nulls: 0,
                unique: new Set(cases.map(c => c.filingDate)).size,
                distribution: [
                  { name: '2023', value: cases.filter(c => c.filingDate.startsWith('2023')).length },
                  { name: '2024', value: cases.filter(c => c.filingDate.startsWith('2024')).length },
                  { name: '2025', value: cases.filter(c => c.filingDate.startsWith('2025')).length },
                ]
            }
        ];
    }
    
    async getStandardizationRules(): Promise<CleansingRule[]> {
        await delay(100);
        return [
            { id: 'rule-phone', name: 'Normalize Phone Numbers', targetField: 'phone', operation: 'FormatPhone', isActive: true, parameters: { format: 'E.164' } },
            { id: 'rule-email', name: 'Lowercase Emails', targetField: 'email', operation: 'Lowercase', isActive: true },
            { id: 'rule-trim', name: 'Trim Whitespace', targetField: '*', operation: 'Trim', isActive: true },
        ];
    }
}
