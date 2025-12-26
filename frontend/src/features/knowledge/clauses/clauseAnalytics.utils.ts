import { Clause } from '@/types';
import { ChartColorService } from '@/services/theme/chartColorService';
import { ThemeMode } from '@/components/theme/tokens';

export const getRiskData = (clauses: Clause[], mode: ThemeMode = 'light') => {
  const colors = ChartColorService.getRiskColors(mode);
  return [
    { name: 'Low Risk', value: clauses.filter(c => c.riskRating === 'Low').length, color: colors.low },
    { name: 'Medium Risk', value: clauses.filter(c => c.riskRating === 'Medium').length, color: colors.medium },
    { name: 'High Risk', value: clauses.filter(c => c.riskRating === 'High').length, color: colors.high },
  ];
};

export const getUsageData = (clauses: Clause[]) => [...clauses]
  .sort((a, b) => b.usageCount - a.usageCount)
  .slice(0, 5)
  .map(c => ({
    name: c.name && c.name.length > 20 ? c.name.substring(0, 20) + '...' : (c.name || ''),
    usage: c.usageCount
  }));
