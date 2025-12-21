import React, { useState, useEffect } from 'react';
import { Shield, Plus, Loader2, Users, CheckCircle } from 'lucide-react';
import { Organization, Group, User as UserType, Case } from '../../../types';
import { Button } from '../../common/Button';
import { HierarchyColumn } from './HierarchyColumn';
import { OrgListItem, GroupListItem, UserListItem } from './HierarchyRows';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { useQuery } from '../../../hooks/useQueryHooks';
import { DataService } from '../../../services/data/dataService';
// TODO: Migrate to backend API - IndexedDB deprecated
import { STORES } from '../../../services/data/db';
import { queryKeys } from '../../../utils/queryKeys';

// Directly import from models
import { MOCK_ORGS } from '../../../data/models/organization';
import { MOCK_GROUPS } from '../../../data/models/group';
import { MOCK_USERS } from '../../../data/models/user';

export const AdminHierarchy: React.FC = () => {
  const { theme } = useTheme();
  
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  // Enterprise Data Access - Using MOCK_ORGS, MOCK_GROUPS, MOCK_USERS directly for demo
  const { data: orgs = MOCK_ORGS, isLoading: loadingOrgs } = useQuery<Organization[]>(
      [STORES.ORGS, 'all'],
      DataService.organization.getOrgs // This service will likely use the same mock data or actual DB in prod
  );

  const { data: groups = MOCK_GROUPS, isLoading: loadingGroups } = useQuery<Group[]>(
      [STORES.GROUPS, 'all'],
      DataService.organization.getGroups // Same here
  );

  // The staff list is currently mocked via HR.getStaff, which itself uses MOCK_STAFF
  // We explicitly use MOCK_USERS here to simplify the demo and directly link to hierarchical users
  const staff = MOCK_USERS; 

  // Transform Staff to User
  const users: UserType[] = React.useMemo(() => staff.map(s => ({
      id: s.id,
      name: s.name,
      email: s.email,
      role: s.role,
      office: 'Main',
      orgId: 'org-1', // Assuming default org for internal users in mock
      groupIds: ['g-1'],
      userType: 'Internal'
  })), [staff]);

  const isLoading = loadingOrgs || loadingGroups; // Adjusted to not include staffLoading since it's direct mock_users

  // Derived State
  const orgGroups = groups.filter(g => g.orgId === selectedOrgId);
  
  const displayedUsers = users.filter(user => {
    if (!selectedOrgId) return false;
    if (user.orgId !== selectedOrgId) return false;
    if (selectedGroupId) return user.groupIds?.includes(selectedGroupId);
    return true; // Show all users in org if no group selected
  });

  // Auto-select first org on load
  React.useEffect(() => {
      if (orgs.length > 0 && !selectedOrgId) setSelectedOrgId(orgs[0].id);
  }, [orgs, selectedOrgId]);

  if (isLoading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-blue-600"/></div>;

  return (
    <div className={cn("flex flex-col h-full rounded-lg overflow-hidden border shadow-sm", theme.surface.default, theme.border.default)}>
      <div className={cn("p-4 border-b flex justify-between items-center shadow-sm z-10 shrink-0", theme.surface.default, theme.border.default)}>
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
        <div className={cn("w-full md:w-1/4 md:min-w-[250px] border-b md:border-b-0 md:border-r flex flex-col h-auto md:h-full shrink-0", theme.border.default, theme.surface.default)}>
            <div className={cn("p-3 border-b font-bold text-xs uppercase tracking-wide shrink-0", theme.surface.highlight, theme.border.default, theme.text.tertiary)}>Organizations</div>
            <div className="flex-1 overflow-x-auto md:overflow-y-auto flex md:block">
                {orgs.map(org => (
                    <OrgListItem 
                        key={org.id} 
                        org={org} 
                        isSelected={selectedOrgId === org.id} 
                        onSelect={(id) => { setSelectedOrgId(id); setSelectedGroupId(null); }} 
                    />
                ))}
            </div>
        </div>

        {/* Groups */}
        <HierarchyColumn title="Groups & Depts" widthClass="w-full md:w-1/4 md:min-w-[250px] border-b md:border-b-0 md:border-r" onAdd={() => {}}>
            {!selectedOrgId ? <div className={cn("text-center mt-10 text-sm w-full", theme.text.tertiary)}>Select an Organization</div> : (
                <>
                <div onClick={() => setSelectedGroupId(null)} className={cn("p-3 rounded-lg cursor-pointer flex items-center justify-between border min-w-[200px] md:min-w-0 transition-colors", !selectedGroupId ? cn(theme.surface.default, "border-blue-300 shadow-sm") : cn("bg-transparent border-transparent", `hover:${theme.surface.default}`))}>
                    <div className="flex items-center gap-2"><Users className={cn("h-4 w-4", theme.text.secondary)}/><span className={cn("text-sm font-medium", theme.text.primary)}>All Users</span></div>
                    {!selectedGroupId && <CheckCircle className="h-4 w-4 text-blue-500"/>}
                </div>
                {orgGroups.map(group => (
                    <GroupListItem 
                        key={group.id} 
                        group={group} 
                        isSelected={selectedGroupId === group.id} 
                        onSelect={setSelectedGroupId}
                    />
                ))}
                </>
            )}
        </HierarchyColumn>

        {/* Users */}
        <div className={cn("flex-1 flex flex-col min-w-[300px] h-full overflow-hidden", theme.surface.default)}>
            <div className={cn("p-3 border-b flex justify-between items-center shrink-0", theme.surface.highlight, theme.border.default)}>
                <span className={cn("font-bold text-xs uppercase tracking-wide truncate max-w-[200px]", theme.text.tertiary)}>{selectedGroupId ? `${orgGroups.find(g => g.id === selectedGroupId)?.name}` : 'All Users'}</span>
                <div className="flex gap-2"><span className={cn("text-xs border px-2 py-0.5 rounded", theme.surface.default, theme.border.default, theme.text.secondary)}>{displayedUsers.length}</span><button className={cn("hover:bg-blue-50 p-1 rounded", theme.text.primary)} aria-label="Add user"><Plus className="h-4 w-4"/></button></div>
            </div>
            <div className="flex-1 overflow-y-auto">
                <table className={cn("hidden md:table min-w-full divide-y", theme.border.subtle)}>
                    <thead className={cn("sticky top-0", theme.surface.default)}>
                    <tr>
                        <th className={cn("px-4 py-2 text-left text-xs font-semibold", theme.text.secondary)}>Name</th>
                        <th className={cn("px-4 py-2 text-left text-xs font-semibold", theme.text.secondary)}>Role</th>
                        <th className={cn("px-4 py-2 text-left text-xs font-semibold", theme.text.secondary)}>Type</th>
                        <th className={cn("px-4 py-2 text-right text-xs font-semibold", theme.text.secondary)}>Status</th>
                    </tr>
                    </thead>
                    <tbody className={cn("divide-y", theme.border.subtle)}>
                        {displayedUsers.map(user => (
                            <UserListItem key={user.id} user={user} />
                        ))}
                    </tbody>
                </table>
                <div className={cn("md:hidden divide-y", theme.border.subtle)}>
                    {displayedUsers.map(user => (
                        <UserListItem key={user.id} user={user} viewMode="card" />
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHierarchy;

