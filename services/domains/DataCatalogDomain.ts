import { DataDictionaryItem } from '../../types';
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export const DataCatalogService = {
    getDictionary: async (): Promise<DataDictionaryItem[]> => { await delay(100); return []; },
    updateItem: async (id: string, updates: Partial<DataDictionaryItem>): Promise<DataDictionaryItem> => { await delay(100); return {id, ...updates} as any; },
    getDataDomains: async () => { await delay(100); return []; }
};