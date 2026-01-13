import { Button } from '@/shared/ui/atoms/Button/Button';
import { useTheme } from '@/features/theme';
import { useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/dataService';
import { Group, GroupId, Organization, User as UserType } from '@/types';
import { cn } from '@/shared/lib/cn';
import { queryKeys } from '@/utils/queryKeys';
import { CheckCircle, Loader2, Plus, Shield, Users } from 'lucide-react';
import { useState } from 'react';
import { HierarchyColumn } from './HierarchyColumn';
import { GroupListItem, OrgListItem, UserListItem } from './HierarchyRows';

export const AdminHierarchy: React.FC = () => {
  const { theme } = useTheme();

  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  // Fetch organizations from backend API
  const { data: orgs = [], isLoading: loadingOrgs } = useQuery<Organization[]>(
    queryKeys.organizations.all(),
    () => DataService.organizations.getAll()
  );

  // Fetch groups from backend API
  const { data: groups = [], isLoading: loadingGroups } = useQuery<Group[]>(
    queryKeys.groups.all(),
    () => DataService.groups.getAll()
  );

  // Fetch users from backend API
  const { data: users = [], isLoading: loadingUsers } = useQuery<UserType[]>(
    queryKeys.users.all(),
    () => DataService.users.getAll()
  );

  const isLoading = loadingOrgs || loadingGroups || loadingUsers;

  // Derived State
  const orgGroups = groups.filter(g => g.orgId === selectedOrgId);

  const displayedUsers = users.filter(user => {
    if (!selectedOrgId) return false;
    if (user.orgId !== selectedOrgId) return false;
    if (selectedGroupId) return user.groupIds?.includes(selectedGroupId as GroupId);
    return true; // Show all users in org if no group selected
  });

  // Auto-select first org on load
  React.useEffect(() => {
    if (orgs.length > 0 && !selectedOrgId) setSelectedOrgId(orgs[0]!.id);
  }, [orgs, selectedOrgId]);

  if (isLoading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>;

  return (
    <div className={cn("flex flex-col h-full rounded-lg overflow-hidden border shadow-sm", theme.surface.default, theme.border.default)}>
      <div className={cn("p-4 border-b flex justify-between items-center shadow-sm z-10 shrink-0", theme.surface.default, theme.border.default)}>
        <div>
          <h3 className={cn("font-bold flex items-center gap-2", theme.text.primary)}>
            <Shield className="h-5 w-5 text-blue-600" /> Enterprise Hierarchy
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
        <HierarchyColumn title="Groups & Depts" widthClass="w-full md:w-1/4 md:min-w-[250px] border-b md:border-b-0 md:border-r" onAdd={() => { }}>
          {!selectedOrgId ? <div className={cn("text-center mt-10 text-sm w-full", theme.text.tertiary)}>Select an Organization</div> : (
            <>
              <div onClick={() => setSelectedGroupId(null)} className={cn("p-3 rounded-lg cursor-pointer flex items-center justify-between border min-w-[200px] md:min-w-0 transition-colors", !selectedGroupId ? cn(theme.surface.default, "border-blue-300 shadow-sm") : cn("bg-transparent border-transparent", `hover:${theme.surface.default}`))}>
                <div className="flex items-center gap-2"><Users className={cn("h-4 w-4", theme.text.secondary)} /><span className={cn("text-sm font-medium", theme.text.primary)}>All Users</span></div>
                {!selectedGroupId && <CheckCircle className="h-4 w-4 text-blue-500" />}
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
            <div className="flex gap-2"><span className={cn("text-xs border px-2 py-0.5 rounded", theme.surface.default, theme.border.default, theme.text.secondary)}>{displayedUsers.length}</span><button className={cn("hover:bg-blue-50 p-1 rounded", theme.text.primary)} aria-label="Add user"><Plus className="h-4 w-4" /></button></div>
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
