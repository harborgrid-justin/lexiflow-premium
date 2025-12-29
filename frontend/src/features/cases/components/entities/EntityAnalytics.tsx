/**
 * @module components/entities/EntityAnalytics
 * @category Entities
 * @description Entity analytics with type distribution and risk scoring.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Users, Building2, ShieldAlert, Globe } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/providers/ThemeContext';
import { ChartColorService } from '@/services/theme/chartColorService';

// Components
import { MetricCard } from '@/components/molecules';
import { Card } from '@/components/molecules';

// Types
import { LegalEntity } from '@/types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface EntityAnalyticsProps {
  /** List of entities for analytics. */
  entities: LegalEntity[];
}

// ============================================================================
// COMPONENT
// ============================================================================

export const EntityAnalytics: React.FC<EntityAnalyticsProps> = ({ entities }) => {
  const { theme, mode } = useTheme();
  const colors = ChartColorService.getCategoryColors(mode);

  // Memoize Stats Calculation
  const { typeStats, riskStats, jurisdictionCount, topHighRisk } = useMemo(() => {
      const tStats = [
        { name: 'Individual', value: entities.filter(e => e.type === 'Individual').length, color: colors[0] },
        { name: 'Corporation', value: entities.filter(e => e.type === 'Corporation').length, color: colors[1] },
        { name: 'Court/Gov', value: entities.filter(e => e.type === 'Court' || e.type === 'Government').length, color: colors[2] },
        { name: 'Vendor', value: entities.filter(e => e.type === 'Vendor').length, color: colors[3] },
      ];

      const rStats = entities.reduce((acc: any, e) => {
          if (e.riskScore > 75) acc.high++;
          else if (e.riskScore > 40) acc.medium++;
          else acc.low++;
          return acc;
      }, { high: 0, medium: 0, low: 0 });

      const jCount = new Set(entities.map(e => e.jurisdiction || e.state)).size;
      const highRiskEntities = entities.sort((a: any, b: any) => b.riskScore - a.riskScore).slice(0, 10).map(e => ({ name: e.name.substring(0, 10), score: e.riskScore }));

      return { typeStats: tStats, riskStats: rStats, jurisdictionCount: jCount, topHighRisk: highRiskEntities };
  }, [entities, colors]);

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard 
                label="Total Entities" 
                value={entities.length} 
                icon={Users} 
                className="border-l-4 border-l-blue-600"
            />
            <MetricCard 
                label="High Risk" 
                value={riskStats.high} 
                icon={ShieldAlert} 
                className="border-l-4 border-l-red-500"
                trend="Action Required"
                trendUp={false}
            />
            <MetricCard 
                label="Corporations" 
                value={typeStats.find(t => t.name === 'Corporation')?.value || 0} 
                icon={Building2} 
                className="border-l-4 border-l-purple-600"
            />
            <MetricCard 
                label="Jurisdictions" 
                value={jurisdictionCount} 
                icon={Globe} 
                className="border-l-4 border-l-emerald-500"
            />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Entity Type Distribution">
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={typeStats} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                {typeStats.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-4 mt-4 flex-wrap">
                        {typeStats.map(t => (
                            <div key={t.name} className="flex items-center text-xs">
                                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: t.color }}></div>
                                <span className={theme.text.secondary}>{t.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>

            <Card title="Highest Risk Entities">
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                            data={topHighRisk} 
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" fontSize={10} />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="score" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
    </div>
  );
};
