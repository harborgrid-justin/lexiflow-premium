
import React, { useState } from 'react';
import { Card } from '@/components/molecules/Card';
import { UserAvatar } from '@/components/atoms/UserAvatar';
import { Button } from '@/components/atoms/Button';
import { SearchInputBar, MetricTile } from '@/components/organisms/_legacy/RefactoredCommon';
import { Briefcase, Building, Mail, Linkedin, GraduationCap, Network } from 'lucide-react';
import { LegalEntity } from '@/types';
import { useTheme } from '@/providers/ThemeContext';
import { useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/dataService';
import { queryKeys } from '@/utils/queryKeys';
import { cn } from '@/utils/cn';

interface AlumniDirectoryProps {
  entities: LegalEntity[];
}

export const AlumniDirectory: React.FC<AlumniDirectoryProps> = ({ entities }) => {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch entities with type 'Individual' and role 'Alumni'
  const { data: allAlumni } = useQuery<LegalEntity[]>(
    queryKeys.adminExtended.judgeProfiles(), // Reusing existing key pattern
    () => DataService.entities.getAll()
  );

  // Safety check: ensure allAlumni is always an array
  const safeAlumni = Array.isArray(allAlumni) ? allAlumni : [];

  // Filter for alumni (individuals with specific metadata or roles)
  const alumni = safeAlumni.filter(entity => 
    entity.type === 'Individual' && 
    (entity.roles?.includes('Alumni') || entity.tags?.includes('alumni'))
  ).filter(person => 
    searchTerm === '' || 
    person.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats from actual data
  const stats = {
    total: alumni.length,
    clientPlacements: alumni.filter(a => a.metadata?.clientPlacements).length,
    referralRevenue: alumni.reduce((sum, a) => sum + (a.metadata?.referralRevenue || 0), 0),
  };

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricTile label="Total Alumni" value={stats.total} icon={GraduationCap} className="border-l-4 border-l-indigo-500" />
            <MetricTile label="Client Placements" value={stats.clientPlacements} icon={Building} className="border-l-4 border-l-blue-500" />
            <MetricTile label="Referral Revenue" value={`$${(stats.referralRevenue / 1000).toFixed(0)}k`} icon={Network} trend="YTD" trendUp={true} className="border-l-4 border-l-emerald-500" />
        </div>

        <div className="flex justify-between items-center">
            <SearchInputBar 
              placeholder="Search alumni by name, firm, or year..." 
              className="max-w-md"
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            />
            <Button variant="outline">Invite to Network</Button>
        </div>

        {alumni.length === 0 ? (
          <div className={cn("text-center py-12", theme.text.secondary)}>
            <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No alumni found. {searchTerm && 'Try adjusting your search.'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {alumni.map(person => (
                  <div key={person.id} className={cn("p-5 rounded-xl border shadow-sm transition-all hover:shadow-md group", theme.surface.default, theme.border.default)}>
                      <div className="flex justify-between items-start mb-4">
                          <UserAvatar name={person.name} size="lg" className="border-2 border-white shadow-sm"/>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {person.metadata?.linkedin && (
                                <a href={person.metadata.linkedin} target="_blank" rel="noopener noreferrer" className={cn("p-1.5 rounded hover:bg-blue-50 text-blue-600")}>
                                  <Linkedin className="h-4 w-4"/>
                                </a>
                              )}
                              {person.email && (
                                <a href={`mailto:${person.email}`} className={cn("p-1.5 rounded hover:bg-slate-100 text-slate-600")}>
                                  <Mail className="h-4 w-4"/>
                                </a>
                              )}
                          </div>
                      </div>
                      
                      <h4 className={cn("font-bold text-lg mb-0.5", theme.text.primary)}>{person.name}</h4>
                      <p className={cn("text-xs uppercase font-bold tracking-wide mb-3", theme.text.tertiary)}>
                        {person.metadata?.previousRole || 'Former Employee'} ({person.metadata?.yearLeft || 'N/A'})
                      </p>
                      
                      <div className={cn("p-3 rounded-lg border bg-slate-50/50 flex items-center gap-3", theme.border.default)}>
                          <div className="p-2 bg-white rounded shadow-sm border border-slate-100">
                              <Briefcase className="h-4 w-4 text-slate-600"/>
                          </div>
                          <div>
                              <p className={cn("text-xs font-bold", theme.text.primary)}>
                                {person.metadata?.currentRole || 'Current Role Unknown'}
                              </p>
                              <p className={cn("text-xs", theme.text.secondary)}>
                                {person.metadata?.currentOrganization || 'Organization Unknown'}
                              </p>
                          </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-dashed flex justify-between items-center text-xs">
                          <span className={theme.text.tertiary}>
                            Referrals: <strong>{person.metadata?.activeReferrals || 0} Active</strong>
                          </span>
                          <button className="text-blue-600 hover:underline">View History</button>
                      </div>
                  </div>
              ))}
          </div>
        )}
    </div>
  );
};

