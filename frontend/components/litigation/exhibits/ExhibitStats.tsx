/**
 * @module components/exhibits/ExhibitStats
 * @category Exhibits
 * @description Analytics dashboard with admissibility rates and party distribution.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { CheckCircle, XCircle, FileText, PieChart as PieIcon } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '../../../context/ThemeContext';

// Components
import { MetricCard } from '../../common/Primitives';
import { Card } from '../../common/Card';

// Types
import { TrialExhibit } from '../../../types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface ExhibitStatsProps {
  /** List of trial exhibits. */
  exhibits: TrialExhibit[];
}

// ============================================================================
// COMPONENT
// ============================================================================

export const ExhibitStats: React.FC<ExhibitStatsProps> = ({ exhibits }) => {
  const { theme } = useTheme();

  const statusData = [
    { name: 'Admitted', value: exhibits.filter(e => e.status === 'Admitted').length, color: '#22c55e' },
    { name: 'Marked (Pending)', value: exhibits.filter(e => e.status === 'Marked').length, color: '#f59e0b' },
    { name: 'Excluded', value: exhibits.filter(e => e.status === 'Excluded').length, color: '#ef4444' },
  ];

  const partyData = [
    { name: 'Plaintiff', count: exhibits.filter(e => e.party === 'Plaintiff').length },
    { name: 'Defense', count: exhibits.filter(e => e.party === 'Defense').length },
    { name: 'Joint', count: exhibits.filter(e => e.party === 'Joint').length },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard label="Total Marked" value={exhibits.length} icon={FileText} className="border-l-4 border-l-blue-500"/>
            <MetricCard label="Admitted" value={statusData[0].value} icon={CheckCircle} className="border-l-4 border-l-green-500"/>
            <MetricCard label="Excluded" value={statusData[2].value} icon={XCircle} className="border-l-4 border-l-red-500"/>
            <MetricCard label="Admission Rate" value={`${Math.round((statusData[0].value / exhibits.length) * 100)}%`} icon={PieIcon} className="border-l-4 border-l-purple-500"/>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Admissibility Status">
                <ResponsiveContainer width="100%" height={256}>
                    <PieChart>
                        <Pie 
                            data={statusData} 
                            innerRadius={60} 
                            outerRadius={80} 
                            paddingAngle={5} 
                            dataKey="value"
                        >
                            {statusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                </ResponsiveContainer>
            </Card>

            <Card title="Exhibits by Party">
                <ResponsiveContainer width="100%" height={256}>
                    <BarChart data={partyData} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12}} />
                        <Tooltip cursor={{fill: 'transparent'}} />
                        <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={30} />
                    </BarChart>
                </ResponsiveContainer>
            </Card>
        </div>
    </div>
  );
};
