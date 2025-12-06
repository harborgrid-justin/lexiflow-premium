
import { DataAnomaly, DedupeCluster, CleansingRule, QualityMetricHistory } from '../../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class DataQualityService {
    
    // --- MOCK STATE (In-Memory for Demo) ---
    private anomalies: DataAnomaly[] = [
        { id: 1, table: 'Parties', field: 'phone', issue: 'Invalid Format', count: 142, sample: '123-456', status: 'Detected', severity: 'Medium' },
        { id: 2, table: 'Cases', field: 'status', issue: 'Unknown Enum', count: 5, sample: 'Pending Review (Legacy)', status: 'Detected', severity: 'High' },
        { id: 3, table: 'Documents', field: 'size', issue: 'Missing Value', count: 450, sample: 'null', status: 'Detected', severity: 'Low' },
        { id: 4, table: 'Clients', field: 'email', issue: 'Invalid Domain', count: 23, sample: 'user@gmial.com', status: 'Detected', severity: 'High' },
    ];

    private dedupeClusters: DedupeCluster[] = [
        {
            id: 'c1',
            masterId: 'ent-101',
            status: 'Pending',
            duplicates: [
                { id: 'ent-101', name: 'TechCorp Industries Inc.', similarityScore: 100, fieldMatch: 'Master' },
                { id: 'ent-892', name: 'TechCorp Industries', similarityScore: 92, fieldMatch: 'Name' },
                { id: 'ent-993', name: 'Tech Corp Ind.', similarityScore: 85, fieldMatch: 'Name, Address' }
            ]
        },
        {
            id: 'c2',
            masterId: 'per-552',
            status: 'Pending',
            duplicates: [
                { id: 'per-552', name: 'Johnathan Doe', similarityScore: 100, fieldMatch: 'Master' },
                { id: 'per-555', name: 'John Doe', similarityScore: 88, fieldMatch: 'Email' }
            ]
        }
    ];

    private history: QualityMetricHistory[] = [
        { date: '2024-01-01', score: 82, issuesFound: 400, issuesFixed: 50 },
        { date: '2024-02-01', score: 85, issuesFound: 320, issuesFixed: 350 },
        { date: '2024-03-01', score: 94, issuesFound: 150, issuesFixed: 300 },
    ];

    // --- API METHODS ---

    async getAnomalies(): Promise<DataAnomaly[]> {
        await delay(300);
        return [...this.anomalies];
    }

    async getDedupeClusters(): Promise<DedupeCluster[]> {
        await delay(300);
        return [...this.dedupeClusters];
    }

    async getHistory(): Promise<QualityMetricHistory[]> {
        await delay(200);
        return [...this.history];
    }

    // --- ACTIONS ---

    async runCleansingJob(rules: CleansingRule[]): Promise<{ processed: number, fixed: number }> {
        await delay(1500); // Simulate processing time
        
        // Mock logic: Mark related anomalies as fixed
        this.anomalies = this.anomalies.map(a => {
            // Simple heuristics for demo
            if (rules.some(r => r.targetField === a.field && r.isActive)) {
                return { ...a, status: 'Fixed' };
            }
            return a;
        });

        return { processed: 5000, fixed: 145 };
    }

    async mergeCluster(clusterId: string, masterId: string): Promise<void> {
        await delay(800);
        this.dedupeClusters = this.dedupeClusters.map(c => 
            c.id === clusterId ? { ...c, status: 'Merged', masterId } : c
        );
    }

    async ignoreCluster(clusterId: string): Promise<void> {
        await delay(500);
        this.dedupeClusters = this.dedupeClusters.map(c => 
            c.id === clusterId ? { ...c, status: 'Ignored' } : c
        );
    }

    async applyFix(anomalyId: number): Promise<void> {
        await delay(600);
        this.anomalies = this.anomalies.map(a => 
            a.id === anomalyId ? { ...a, status: 'Fixed' } : a
        );
    }
}
