import { Clause } from '../../types';

export const getRiskData = (clauses: Clause[]) => [
  { name: 'Low Risk', value: clauses.filter(c => c.riskRating === 'Low').length, color: '#10b981' },
  { name: 'Medium Risk', value: clauses.filter(c => c.riskRating === 'Medium').length, color: '#f59e0b' },
  { name: 'High Risk', value: clauses.filter(c => c.riskRating === 'High').length, color: '#ef4444' },
];

export const getUsageData = (clauses: Clause[]) => [...clauses]
  .sort((a, b) => b.usageCount - a.usageCount)
  .slice(0, 5)
  .map(c => ({
    name: c.name.length > 20 ? c.name.substring(0, 20) + '...' : c.name,
    usage: c.usageCount
  }));
