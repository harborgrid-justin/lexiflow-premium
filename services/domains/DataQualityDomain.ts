
import { DataAnomaly, DedupeCluster, CleansingRule, QualityMetricHistory, DataProfile } from '../../types';
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export class DataQualityService {
    async getAnomalies(): Promise<DataAnomaly[]> { await delay(100); return []; }
    async getDedupeClusters(): Promise<DedupeCluster[]> { await delay(100); return []; }
    async getHistory(): Promise<QualityMetricHistory[]> { await delay(100); return []; }
    async runCleansingJob(rules: CleansingRule[]): Promise<{ processed: number, fixed: number }> { await delay(100); return { processed: 0, fixed: 0 }; }
    async mergeCluster(clusterId: string, masterId: string): Promise<void> { await delay(100); }
    async ignoreCluster(clusterId: string): Promise<void> { await delay(100); }
    async applyFix(anomalyId: number): Promise<void> { await delay(100); }
    async getProfiles(): Promise<DataProfile[]> {
        await delay(200);
        return [
            {
                column: 'status',
                type: 'string',
                nulls: 0.5,
                unique: 8,
                distribution: [
                  { name: 'Active', value: 4500 },
                  { name: 'Closed', value: 3200 },
                  { name: 'Pending', value: 800 },
                  { name: 'Archived', value: 200 },
                ]
            },
            {
                column: 'value',
                type: 'numeric',
                nulls: 0,
                unique: 1420,
                distribution: [
                  { name: '0-10k', value: 1200 },
                  { name: '10k-50k', value: 3500 },
                  { name: '50k-100k', value: 2100 },
                  { name: '100k+', value: 800 },
                ]
            },
            {
                column: 'created_at',
                type: 'datetime',
                nulls: 0,
                unique: 8500,
                distribution: [
                  { name: '2021', value: 1500 },
                  { name: '2022', value: 2800 },
                  { name: '2023', value: 3200 },
                  { name: '2024', value: 1100 },
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
            { id: 'rule-state', name: 'Standardize State Codes', targetField: 'state', operation: 'CustomRegex', isActive: false, parameters: { dictionary: 'US_States' } },
        ];
    }
}
