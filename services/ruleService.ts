
import { MOCK_RULES } from '../data/models/legalRule';
import { LegalRule } from '../types';
import { StorageUtils, STORAGE_KEYS } from '../utils/storage';

// Initialize from Storage
let dbRules: LegalRule[] = StorageUtils.get(STORAGE_KEYS.RULES, [...MOCK_RULES]);

export const RuleService = {
  getAll: async (): Promise<LegalRule[]> => {
    return [...dbRules];
  },

  search: async (query: string): Promise<LegalRule[]> => {
    const lower = query.toLowerCase();
    return dbRules.filter(r => 
      r.code.toLowerCase().includes(lower) || 
      r.name.toLowerCase().includes(lower) ||
      r.type.toLowerCase().includes(lower)
    );
  },

  add: async (rule: Omit<LegalRule, 'id'>): Promise<LegalRule> => {
    const newRule = { ...rule, id: `rule-${Date.now()}` };
    dbRules = [newRule, ...dbRules];
    StorageUtils.set(STORAGE_KEYS.RULES, dbRules);
    return newRule;
  },

  update: async (id: string, updates: Partial<LegalRule>): Promise<LegalRule> => {
    dbRules = dbRules.map(r => r.id === id ? { ...r, ...updates } as LegalRule : r);
    StorageUtils.set(STORAGE_KEYS.RULES, dbRules);
    const updated = dbRules.find(r => r.id === id);
    if (!updated) throw new Error('Rule not found');
    return updated;
  },

  delete: async (id: string): Promise<void> => {
    dbRules = dbRules.filter(r => r.id !== id);
    StorageUtils.set(STORAGE_KEYS.RULES, dbRules);
  }
};