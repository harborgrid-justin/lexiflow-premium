/**
 * StrategyDomain - Litigation strategy and risk analysis service
 * Provides strategy creation, risk assessment, and tactical recommendations
 */

// TODO: Migrate to backend API - IndexedDB deprecated
import { db, STORES } from '../data/db';
import { delay } from '../../utils/async';

interface Strategy {
  id: string;
  caseId: string;
  name: string;
  description: string;
  objectives: string[];
  risks: Risk[];
  createdAt: string;
  updatedAt: string;
}

interface Risk {
  id: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  probability: number;
  mitigation?: string;
}

interface Recommendation {
  id: string;
  type: 'motion' | 'discovery' | 'settlement' | 'trial';
  title: string;
  description: string;
  priority: number;
  rationale: string;
}

export const StrategyService = {
  getAll: async () => db.getAll(STORES.STRATEGIES),
  getById: async (id: string) => db.get(STORES.STRATEGIES, id),
  add: async (item: any) => db.put(STORES.STRATEGIES, { ...item, createdAt: new Date().toISOString() }),
  update: async (id: string, updates: any) => {
    const existing = await db.get(STORES.STRATEGIES, id);
    return db.put(STORES.STRATEGIES, { ...existing, ...updates, updatedAt: new Date().toISOString() });
  },
  delete: async (id: string) => db.delete(STORES.STRATEGIES, id),
  
  // Strategy specific methods
  getStrategies: async (caseId?: string): Promise<Strategy[]> => {
    const all = await db.getAll(STORES.STRATEGIES);
    return caseId ? all.filter((s: Strategy) => s.caseId === caseId) : all;
  },
  
  createStrategy: async (strategy: Partial<Strategy>): Promise<Strategy> => {
    const newStrategy: Strategy = {
      id: `strat-${Date.now()}`,
      caseId: strategy.caseId || '',
      name: strategy.name || 'New Strategy',
      description: strategy.description || '',
      objectives: strategy.objectives || [],
      risks: strategy.risks || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.put(STORES.STRATEGIES, newStrategy);
    return newStrategy;
  },
  
  analyzeRisks: async (strategyId: string): Promise<Risk[]> => {
    await delay(200); // Simulate analysis
    const strategy = await db.get(STORES.STRATEGIES, strategyId);
    if (!strategy) return [];
    
    // Return existing risks plus generate some AI-suggested risks
    const existingRisks = strategy.risks || [];
    const suggestedRisks: Risk[] = [
      {
        id: `risk-${Date.now()}-1`,
        description: 'Adverse ruling on summary judgment motion',
        severity: 'High',
        probability: 0.35,
        mitigation: 'Strengthen factual record with additional depositions',
      },
      {
        id: `risk-${Date.now()}-2`,
        description: 'Key witness credibility issues',
        severity: 'Medium',
        probability: 0.45,
        mitigation: 'Corroborate testimony with documentary evidence',
      },
    ];
    
    return [...existingRisks, ...suggestedRisks];
  },
  
  getRecommendations: async (caseId: string): Promise<Recommendation[]> => {
    await delay(150);
    const caseData = await db.get(STORES.CASES, caseId);
    if (!caseData) return [];
    
    // Generate tactical recommendations based on case stage and facts
    const recommendations: Recommendation[] = [
      {
        id: `rec-${Date.now()}-1`,
        type: 'discovery',
        title: 'Issue targeted document requests',
        description: 'Focus on email communications between key decision-makers',
        priority: 0.9,
        rationale: 'Early case assessment suggests document-heavy evidence trail',
      },
      {
        id: `rec-${Date.now()}-2`,
        type: 'motion',
        title: 'File motion for protective order',
        description: 'Limit scope of overly broad interrogatories',
        priority: 0.75,
        rationale: 'Opposing counsel requests exceed Rule 26 proportionality limits',
      },
      {
        id: `rec-${Date.now()}-3`,
        type: 'settlement',
        title: 'Explore mediation',
        description: 'Consider early settlement conference before costly depositions',
        priority: 0.65,
        rationale: 'Cost-benefit analysis favors resolution at this stage',
      },
    ];
    
    return recommendations.sort((a, b) => b.priority - a.priority);
  },
};
