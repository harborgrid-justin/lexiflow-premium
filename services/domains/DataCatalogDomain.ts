
import { DataDictionaryItem, SchemaTable, DataLakeItem, LineageNode, LineageLink } from '../../types';
import { db, STORES } from '../db';
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const DataCatalogService = {
    getDictionary: async (): Promise<DataDictionaryItem[]> => { await delay(100); return []; },
    updateItem: async (id: string, updates: Partial<DataDictionaryItem>): Promise<DataDictionaryItem> => { await delay(100); return {id, ...updates} as any; },
    getDataDomains: async () => { await delay(100); return []; },
    
    getSchemaTables: async (): Promise<SchemaTable[]> => {
        // Dynamically create table list from STORES enum
        const tables = Object.values(STORES).map((name, i) => ({
            name,
            x: (i % 8) * 300 + 50,
            y: Math.floor(i / 8) * 400 + 50,
            columns: [
                { name: 'id', type: 'UUID', pk: true },
                { name: 'created_at', type: 'TIMESTAMP' },
            ]
        }));
        return tables;
    },

    getRegistryInfo: async (): Promise<any[]> => {
        const stores = Object.values(STORES);
        const info = [];
        for (const store of stores) {
            const count = await db.count(store);
            info.push({
                name: store,
                type: 'System Table',
                records: count,
                size: `${(count * 0.5).toFixed(1)} KB` // Mock size calculation
            });
        }
        return info;
    },

    getDataLakeItems: async (folderId: string = 'root'): Promise<DataLakeItem[]> => {
        await delay(150);
        const MOCK_FILES: Record<string, DataLakeItem[]> = {
            'root': [
                { id: 'f1', name: 'raw_ingest', type: 'folder', modified: '2024-03-10', tier: 'Hot', parentId: 'root' },
                { id: 'f2', name: 'processed_parquet', type: 'folder', modified: '2024-03-11', tier: 'Hot', parentId: 'root' },
                { id: 'f3', name: 'archive_logs', type: 'folder', modified: '2023-12-01', tier: 'Cool', parentId: 'root' },
                { id: 'doc1', name: 'manifest.json', type: 'file', size: '12 KB', modified: '2024-03-12', format: 'JSON', tier: 'Hot', parentId: 'root' },
            ],
            'raw_ingest': [
                { id: 'raw1', name: 'client_dump_2024.csv', type: 'file', size: '450 MB', modified: '2024-03-10', format: 'CSV', tier: 'Hot', parentId: 'raw_ingest' },
                { id: 'raw2', name: 'images_batch_01', type: 'folder', modified: '2024-03-10', tier: 'Hot', parentId: 'raw_ingest' },
            ],
            'processed_parquet': [
                { id: 'pq1', name: 'fact_sales_q1.parquet', type: 'file', size: '1.2 GB', modified: '2024-03-11', format: 'Parquet', tier: 'Hot', parentId: 'processed_parquet' },
            ]
        };
        return MOCK_FILES[folderId] || [];
    },
    getLineageGraph: async (): Promise<{ nodes: LineageNode[], links: LineageLink[] }> => {
        await delay(200);
        return {
            nodes: [
                { id: 'src1', label: 'Salesforce CRM', type: 'root' },
                { id: 'src2', label: 'Website Logs', type: 'root' },
                { id: 'stg1', label: 'Raw Zone (S3)', type: 'org' },
                { id: 'etl1', label: 'Cleaning Job', type: 'party' },
                { id: 'wh1', label: 'Data Warehouse', type: 'org' },
                { id: 'rpt1', label: 'Revenue Dashboard', type: 'evidence' },
                { id: 'rpt2', label: 'User Activity Report', type: 'evidence' }
            ],
            links: [
                { source: 'src1', target: 'stg1', strength: 0.5 },
                { source: 'src2', target: 'stg1', strength: 0.5 },
                { source: 'stg1', target: 'etl1', strength: 0.5 },
                { source: 'etl1', target: 'wh1', strength: 0.5 },
                { source: 'wh1', target: 'rpt1', strength: 0.5 },
                { source: 'wh1', target: 'rpt2', strength: 0.5 }
            ]
        };
    }
};
