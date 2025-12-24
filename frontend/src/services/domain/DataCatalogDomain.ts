import { DataDictionaryItem, SchemaTable, DataLakeItem, LineageNode, LineageLink } from '@/types';
/**
 * ? Migrated to backend API (2025-12-21)
 */
import { dataPlatformApi } from "@/api/domains/data-platform.api";
import { MOCK_DATA_DICTIONARY } from '@/api/data/dataDictionary';
import { delay } from '@/utils/async';

export const DataCatalogService = {
    getDictionary: async (): Promise<DataDictionaryItem[]> => { 
        await delay(100); 
        return MOCK_DATA_DICTIONARY; 
    },
    
    updateItem: async (id: string, updates: Partial<DataDictionaryItem>): Promise<DataDictionaryItem> => { 
        await delay(300);
        const item = MOCK_DATA_DICTIONARY.find(d => d.id === id);
        if (!item) throw new Error("Item not found");
        return { ...item, ...updates };
    },
    
    getDataDomains: async () => { 
        await delay(200); 
        return [
            { name: 'Legal', count: 12, desc: 'Core case and litigation data.'},
            { name: 'Finance', count: 8, desc: 'Billing, invoices, and trust accounts.' },
            { name: 'HR', count: 4, desc: 'Staff, roles, and performance data.' },
            { name: 'IT', count: 15, desc: 'System logs, security, and infrastructure.' },
        ]; 
    },
    
    getSchemaTables: async (): Promise<SchemaTable[]> => {
        const tables = Object.values(STORES).map((name, i) => ({
            name,
            x: (i % 6) * 300 + 50,
            y: Math.floor(i / 6) * 350 + 50,
            columns: [
                { name: 'id', type: 'UUID', pk: true, notNull: true },
                { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', notNull: true },
                { name: 'updated_at', type: 'TIMESTAMP WITH TIME ZONE' },
                { name: 'version', type: 'INTEGER', default: '1' },
            ]
        }));
        return tables;
    },

    getRegistryInfo: async (): Promise<any[]> => {
        const stores = Object.values(STORES);
        const info = [];
        for (const store of stores) {
            try {
                const count = await db.count(store);
                info.push({
                    name: store,
                    type: 'System Table',
                    records: count,
                    size: `${(count * 1.5 + 24).toFixed(1)} KB`
                });
            } catch (error) {
                // Store doesn't exist in IndexedDB yet - skip it
                console.debug(`[DataCatalog] Store "${store}" not found in IndexedDB, skipping`);
            }
        }
        return info;
    },

    getDataLakeItems: async (folderId: string = 'root'): Promise<DataLakeItem[]> => {
        await delay(150);
        // This remains mocked as we don't have a real S3 backend in browser
        const MOCK_FILES: Record<string, DataLakeItem[]> = {
            'root': [
                { id: 'f1', name: 'raw_ingest', type: 'folder', modified: '2024-03-10', tier: 'Hot', parentId: 'root' },
                { id: 'f2', name: 'processed_parquet', type: 'folder', modified: '2024-03-11', tier: 'Hot', parentId: 'root' },
                { id: 'f3', name: 'archive_logs', type: 'folder', modified: '2023-12-01', tier: 'Cool', parentId: 'root' },
            ],
            'raw_ingest': [
                { id: 'raw1', name: 'client_dump_2024.csv', type: 'file', size: '450 MB', modified: '2024-03-10', format: 'CSV', tier: 'Hot', parentId: 'raw_ingest' },
            ],
            'processed_parquet': [
                { id: 'pq1', name: 'fact_sales_q1.parquet', type: 'file', size: '1.2 GB', modified: '2024-03-11', format: 'Parquet', tier: 'Hot', parentId: 'processed_parquet' },
            ]
        };
        return MOCK_FILES[folderId] || [];
    },

    // Dynamically build lineage based on current Entity Relationships in backend
    getLineageGraph: async (): Promise<{ nodes: LineageNode[], links: LineageLink[] }> => {
        const [entities, relationships] = await Promise.all([
            dataPlatformApi.dataPlatform?.getEntities?.() || [],
            dataPlatformApi.dataPlatform?.getRelationships?.() || []
        ]);

        const nodes: LineageNode[] = entities.map((e: unknown) => ({
            id: e.id,
            label: e.name,
            type: e.type === 'Corporation' ? 'org' : 'party'
        }));

        const links: LineageLink[] = relationships.map((r: unknown) => ({
            source: r.sourceId,
            target: r.targetId,
            strength: r.weight || 0.5
        }));

        // Add System Nodes if empty to show structure
        if (nodes.length === 0) {
             return {
                nodes: [
                    { id: 'src1', label: 'Salesforce CRM', type: 'root' },
                    { id: 'stg1', label: 'Raw Zone (S3)', type: 'org' },
                    { id: 'wh1', label: 'Data Warehouse', type: 'org' },
                    { id: 'rpt1', label: 'Revenue Dashboard', type: 'evidence' },
                ],
                links: [
                    { source: 'src1', target: 'stg1', strength: 0.8 },
                    { source: 'stg1', target: 'wh1', strength: 0.8 },
                    { source: 'wh1', target: 'rpt1', strength: 0.8 },
                ]
            };
        }

        return { nodes, links };
    }
};
