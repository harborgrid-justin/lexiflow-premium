
import React, { useState } from 'react';
import { Building2, Users, ChevronRight, Shield, Globe, MoreVertical, CheckCircle, Plus, Loader2 } from 'lucide-react';
import { DataService } from '../../services/dataService';
import { Organization, Group, User as UserType } from '../../types';
import { Button } from '../common/Button';
import { UserAvatar } from '../common/UserAvatar';
import { HierarchyColumn } from './hierarchy/HierarchyColumn';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { useQuery } from '../../services/queryClient';
import { STORES } from '../../services/db';

export const AdminHierarchy: React.FC = () => {
  const { theme } = useTheme();
  
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  // Enterprise Data Access
  const { data: orgs = [], isLoading: loadingOrgs } = useQuery<Organization[]>(
      [STORES.ORGS, 'all'],
      DataService.organization.getOrgs
  );

  const { data: groups = [], isLoading: loadingGroups } = useQuery<Group[]>(
      [STORES.GROUPS, 'all'],
      DataService.organization.getGroups
  );

  const { data: staff = [], isLoading: loadingStaff } = useQuery<any[]>(
      [STORES.STAFF, 'all'],
      DataService.hr.getStaff
  );

  // Transform Staff to User
  const users: UserType[] = React.useMemo(() => staff.map(s => ({
      id: s.id,
      name: s.name,
      email: s.email,
      role: s.role,
      office: 'Main',
      orgId: 'org-1',
      groupIds: ['g-1'],
      userType: 'Internal'
  })), [staff]);

  const isLoading = loadingOrgs || loadingGroups || loadingStaff;

  // Derived State
  const orgGroups = groups.filter(g => g.orgId === selectedOrgId);
  const displayedUsers = users.filter(u => 
    u.orgId === selectedOrgId || (u.orgId === 'org-1' && selectedOrgId === 'org-1')
  );

  // Auto-select first org on load
  React.useEffect(() => {
      if (orgs.length > 0 && !selectedOrgId) setSelectedOrgId(orgs[0].id);
  }, [orgs]);

  if (isLoading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-blue-600"/></div>;

  return (
    <div className={cn("flex flex-col h-full rounded-lg overflow-hidden border shadow-sm", theme.surface, theme.border.default)}>
      <div className={cn("p-4 border-b flex justify-between items-center shadow-sm z-10 shrink-0", theme.surface, theme.border.default)}>
        <div>
          <h3 className={cn("font-bold flex items-center gap-2", theme.text.primary)}>
            <Shield className="h-5 w-5 text-blue-600"/> Enterprise Hierarchy
          </h3>
          <p className={cn("text-xs hidden md:block", theme.text.secondary)}>Manage multi-tenant organizations, groups, and user access.</p>
        </div>
        <Button variant="primary" size="sm" icon={Plus}>Add Org</Button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Orgs */}
        <div className={cn("w-full md:w-1/4 md:min-w-[250px] border-b md:border-b-0 md:border-r flex flex-col h-auto md:h-full shrink-0", theme.border.default, theme.surface)}>
            <div className={cn("p-3 border-b font-bold text-xs uppercase tracking-wide shrink-0", theme.surfaceHighlight, theme.border.default, theme.text.tertiary)}>Organizations</div>
            <div className="flex-1 overflow-x-auto md:overflow-y-auto flex md:block">
                {orgs.map(org => (
                <div key={org.id} onClick={() => { setSelectedOrgId(org.id); setSelectedGroupId(null); }}
                    className={cn("p-4 border-b cursor-pointer transition-all group relative min-w-[280px] md:min-w-0 inline-block md:block", selectedOrgId === org.id ? cn("border-l-4 border-l-blue-600 md:border-b-0", theme.surfaceHighlight) : cn("border-l-4 border-l-transparent md:border-b", theme.border.light, `hover:${theme.surfaceHighlight}`))}
                >
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg shrink-0 ${org.type === 'LawFirm' ? 'bg-slate-900 text-white' : org.type === 'Corporate' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                            {org.type === 'LawFirm' ? <Shield className="h-5 w-5"/> : org.type === 'Corporate' ? <Building2 className="h-5 w-5"/> : <Globe className="h-5 w-5"/>}
                            </div>
                            <div><h4 className={cn("font-bold text-sm", theme.text.primary)}>{org.name}</h4><p className={cn("text-xs truncate max-w-[150px]", theme.text.secondary)}>{org.domain}</p></div>
                        </div>
                        {selectedOrgId === org.id && <ChevronRight className="h-4 w-4 text-blue-600 hidden md:block"/>}
                    </div>
                </div>
                ))}
            </div>
        </div>

        {/* Groups */}
        <HierarchyColumn title="Groups & Depts" widthClass="w-full md:w-1/4 md:min-w-[250px] border-b md:border-b-0 md:border-r" onAdd={() => {}}>
            {!selectedOrgId ? <div className={cn("text-center mt-10 text-sm w-full", theme.text.tertiary)}>Select an Organization</div> : (
                <>
                <div onClick={() => setSelectedGroupId(null)} className={cn("p-3 rounded-lg cursor-pointer flex items-center justify-between border min-w-[200px] md:min-w-0 transition-colors", !selectedGroupId ? cn(theme.surface, "border-blue-300 shadow-sm") : cn("bg-transparent border-transparent", `hover:${theme.surface}`))}>
                    <div className="flex items-center gap-2"><Users className={cn("h-4 w-4", theme.text.secondary)}/><span className={cn("text-sm font-medium", theme.text.primary)}>All Users</span></div>
                    {!selectedGroupId && <CheckCircle className="h-4 w-4 text-blue-500"/>}
                </div>
                {orgGroups.map(group => (
                    <div key={group.id} onClick={() => setSelectedGroupId(group.id)} className={cn("p-3 rounded-lg cursor-pointer border transition-all min-w-[200px] md:min-w-0", selectedGroupId === group.id ? cn(theme.surface, "border-blue-300 shadow-sm") : cn("bg-transparent border-transparent", `hover:${theme.surface}`))}>
                        <div className="flex justify-between items-center mb-1"><h5 className={cn("text-sm font-bold", selectedGroupId === group.id ? "text-blue-600" : theme.text.primary)}>{group.name}</h5><MoreVertical className={cn("h-3 w-3", theme.text.tertiary)}/></div>
                        <div className="mt-2 flex flex-wrap gap-1">{group.permissions.slice(0, 2).map(p => <span key={p} className={cn("text-[9px] px-1.5 py-0.5 rounded border", theme.surface, theme.border.default, theme.text.secondary)}>{p.replace('_', ' ')}</span>)}</div>
                    </div>
                ))}
                </>
            )}
        </HierarchyColumn>

        {/* Users */}
        <div className={cn("flex-1 flex flex-col min-w-[300px] h-full overflow-hidden", theme.surface)}>
            <div className={cn("p-3 border-b flex justify-between items-center shrink-0", theme.surfaceHighlight, theme.border.default)}>
                <span className={cn("font-bold text-xs uppercase tracking-wide truncate max-w-[200px]", theme.text.tertiary)}>{selectedGroupId ? `${orgGroups.find(g => g.id === selectedGroupId)?.name}` : 'All Users'}</span>
                <div className="flex gap-2"><span className={cn("text-xs border px-2 py-0.5 rounded", theme.surface, theme.border.default, theme.text.secondary)}>{displayedUsers.length}</span><button className={cn("hover:bg-blue-50 p-1 rounded", theme.text.primary)}><Plus className="h-4 w-4"/></button></div>
            </div>
            <div className="flex-1 overflow-y-auto">
                <table className={cn("hidden md:table min-w-full divide-y", theme.border.light)}>
                    <thead className={cn("sticky top-0", theme.surface)}>
                    <tr>
                        <th className={cn("px-4 py-2 text-left text-xs font-semibold", theme.text.secondary)}>Name</th>
                        <th className={cn("px-4 py-2 text-left text-xs font-semibold", theme.text.secondary)}>Role</th>
                        <th className={cn("px-4 py-2 text-left text-xs font-semibold", theme.text.secondary)}>Type</th>
                        <th className={cn("px-4 py-2 text-right text-xs font-semibold", theme.text.secondary)}>Status</th>
                    </tr>
                    </thead>
                    <tbody className={cn("divide-y", theme.border.light)}>
                    {displayedUsers.map(user => (
                        <tr key={user.id} className={cn("transition-colors", `hover:${theme.surfaceHighlight}`)}>
                        <td className="px-4 py-3"><div className="flex items-center"><UserAvatar name={user.name} size="sm" className="mr-3"/><div><div className={cn("text-sm font-medium", theme.text.primary)}>{user.name}</div><div className={cn("text-xs", theme.text.secondary)}>{user.email}</div></div></div></td>
                        <td className="px-4 py-3"><div className={cn("text-xs font-medium", theme.text.primary)}>{user.role}</div></td>
                        <td className="px-4 py-3"><span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${user.userType === 'Internal' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>{user.userType || 'Internal'}</span></td>
                        <td className="px-4 py-3 text-right"><span className="flex items-center justify-end text-xs text-green-600 font-medium"><span className="w-1.5 h-1.5 bg-green-50 rounded-full mr-1.5"></span> Active</span></td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                <div className={cn("md:hidden divide-y", theme.border.light)}>
                    {displayedUsers.map(user => (
                        <div key={user.id} className="p-4 flex items-center justify-between">
                            <div className="flex items-center"><UserAvatar name={user.name} size="sm" className="mr-3"/><div><div className={cn("text-sm font-medium", theme.text.primary)}>{user.name}</div><div className={cn("text-xs", theme.text.secondary)}>{user.role} • {user.userType || 'Internal'}</div></div></div>
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
