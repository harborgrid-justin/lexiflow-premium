
import { DataDictionaryItem } from '../../types';
import { MOCK_DATA_DICTIONARY } from '../../data/models/dataDictionary';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Simple in-memory storage for the session
let dictionaryStore = [...MOCK_DATA_DICTIONARY];

export const DataCatalogService = {
    getDictionary: async (): Promise<DataDictionaryItem[]> => {
        await delay(300);
        return [...dictionaryStore];
    },

    updateItem: async (id: string, updates: Partial<DataDictionaryItem>): Promise<DataDictionaryItem> => {
        await delay(500);
        const index = dictionaryStore.findIndex(i => i.id === id);
        if (index === -1) throw new Error("Item not found");
        
        const updatedItem = { ...dictionaryStore[index], ...updates, updatedAt: new Date().toISOString() };
        dictionaryStore[index] = updatedItem;
        return updatedItem;
    },

    getDataDomains: async () => {
        await delay(200);
        // Calculate dynamic stats
        const domainCounts = dictionaryStore.reduce((acc, item) => {
            acc[item.domain] = (acc[item.domain] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(domainCounts).map(([name, count]) => ({
            name,
            count,
            desc: `Data assets related to ${name} operations.`
        }));
    }
};
