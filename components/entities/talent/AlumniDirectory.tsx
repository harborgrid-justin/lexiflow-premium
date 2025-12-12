
import React from 'react';
import { Card } from '../../common/Card';
import { UserAvatar } from '../../common/UserAvatar';
import { Button } from '../../common/Button';
import { SearchInputBar, MetricTile } from '../../common/RefactoredCommon';
import { Briefcase, Building, Mail, Linkedin, GraduationCap, Network } from 'lucide-react';
import { LegalEntity } from '../../../types';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';

interface AlumniDirectoryProps {
  entities: LegalEntity[];
}

export const AlumniDirectory: React.FC<AlumniDirectoryProps> = ({ entities }) => {
  const { theme } = useTheme();

  // Mock Alumni Data (in real app, this would be a filtered query)
  const alumni = [
      { id: 1, name: 'Sarah Jenkins', prevRole: 'Senior Associate', currentRole: 'General Counsel', currentOrg: 'TechCorp Industries', yearLeft: '2022' },
      { id: 2, name: 'Michael Ross', prevRole: 'Partner', currentRole: 'Judge', currentOrg: 'Superior Court of CA', yearLeft: '2021' },
      { id: 3, name: 'Rachel Zane', prevRole: 'Paralegal', currentRole: 'VP of Legal Ops', currentOrg: 'OmniGlobal', yearLeft: '2023' },
  ];

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricTile label="Total Alumni" value={145} icon={GraduationCap} className="border-l-4 border-l-indigo-500" />
            <MetricTile label="Client Placements" value={22} icon={Building} className="border-l-4 border-l-blue-500" />
            <MetricTile label="Referral Revenue" value="$450k" icon={Network} trend="YTD" trendUp={true} className="border-l-4 border-l-emerald-500" />
        </div>

        <div className="flex justify-between items-center">
            <SearchInputBar placeholder="Search alumni by name, firm, or year..." className="max-w-md" />
            <Button variant="outline">Invite to Network</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {alumni.map(person => (
                <div key={person.id} className={cn("p-5 rounded-xl border shadow-sm transition-all hover:shadow-md group", theme.surface.default, theme.border.default)}>
                    <div className="flex justify-between items-start mb-4">
                        <UserAvatar name={person.name} size="lg" className="border-2 border-white shadow-sm"/>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className={cn("p-1.5 rounded hover:bg-blue-50 text-blue-600")}><Linkedin className="h-4 w-4"/></button>
                            <button className={cn("p-1.5 rounded hover:bg-slate-100 text-slate-600")}><Mail className="h-4 w-4"/></button>
                        </div>
                    </div>
                    
                    <h4 className={cn("font-bold text-lg mb-0.5", theme.text.primary)}>{person.name}</h4>
                    <p className={cn("text-xs uppercase font-bold tracking-wide mb-3", theme.text.tertiary)}>{person.prevRole} ({person.yearLeft})</p>
                    
                    <div className={cn("p-3 rounded-lg border bg-slate-50/50 flex items-center gap-3", theme.border.default)}>
                        <div className="p-2 bg-white rounded shadow-sm border border-slate-100">
                            <Briefcase className="h-4 w-4 text-slate-600"/>
                        </div>
                        <div>
                            <p className={cn("text-xs font-bold", theme.text.primary)}>{person.currentRole}</p>
                            <p className={cn("text-xs", theme.text.secondary)}>{person.currentOrg}</p>
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-dashed flex justify-between items-center text-xs">
                        <span className={theme.text.tertiary}>Referrals: <strong>3 Active</strong></span>
                        <button className="text-blue-600 hover:underline">View History</button>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};
