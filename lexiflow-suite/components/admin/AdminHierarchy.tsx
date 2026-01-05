
import React, { useState, useTransition } from 'react';
import { 
  Building2, Users, User, ChevronRight, Shield, Globe, Briefcase, 
  MoreVertical, Plus, CheckCircle
} from 'lucide-react';
import { MOCK_ORGS, MOCK_GROUPS, HIERARCHY_USERS } from '../../data/mockHierarchy.ts';
import { Button } from '../common/Button.tsx';
import { UserAvatar } from '../common/UserAvatar.tsx';

export const AdminHierarchy: React.FC = () => {
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(MOCK_ORGS[0]?.id || null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleOrgSelect = (id: string) => {
      startTransition(() => {
          setSelectedOrgId(id);
          setSelectedGroupId(null);
      });
  };

  const handleGroupSelect = (id: string | null) => {
      startTransition(() => {
          setSelectedGroupId(id);
      });
  };

  const orgGroups = MOCK_GROUPS.filter(g => g.orgId === selectedOrgId);
  const displayedUsers = HIERARCHY_USERS.filter(u => 
    u.orgId === selectedOrgId && 
    (!selectedGroupId || u.groupIds?.includes(selectedGroupId))
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 border border-slate-200 rounded-lg overflow-hidden animate-fade-in">
      <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center shadow-sm z-10 shrink-0">
        <div>
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600"/> Enterprise Hierarchy
          </h3>
          <p className="text-xs text-slate-500 hidden md:block">Manage multi-tenant organizations, groups, and user access.</p>
        </div>
        <Button variant="primary" size="sm" icon={Plus}>Add Org</Button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="w-full md:w-1/4 md:min-w-[250px] border-b md:border-b-0 md:border-r border-slate-200 bg-white flex flex-col h-auto md:h-full shrink-0">
          <div className="p-3 bg-slate-50 border-b border-slate-100 font-bold text-xs text-slate-500 uppercase tracking-wide shrink-0">
            Organizations
          </div>
          <div className="flex-1 overflow-x-auto md:overflow-y-auto flex md:block whitespace-nowrap md:whitespace-normal">
            {MOCK_ORGS.map(org => (
              <div 
                key={org.id}
                onClick={() => handleOrgSelect(org.id)}
                className={`p-4 border-b border-slate-50 cursor-pointer transition-all hover:bg-slate-50 group relative min-w-[280px] md:min-w-0 inline-block md:block ${selectedOrgId === org.id ? 'bg-blue-50/50 border-b-4 md:border-b-0 md:border-r-4 border-blue-600' : 'border-b-4 md:border-b-0 md:border-r-4 border-transparent'}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg shrink-0 ${org.type === 'LawFirm' ? 'bg-slate-900 text-white' : org.type === 'Corporate' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                      {org.type === 'LawFirm' ? <Shield className="h-5 w-5"/> : org.type === 'Corporate' ? <Building2 className="h-5 w-5"/> : <Globe className="h-5 w-5"/>}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{org.name}</h4>
                      <p className="text-xs text-slate-500 truncate max-w-[150px]">{org.domain}</p>
                    </div>
                  </div>
                  {selectedOrgId === org.id && <ChevronRight className="h-4 w-4 text-blue-600 hidden md:block"/>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full md:w-1/4 md:min-w-[250px] border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50/30 flex flex-col h-auto md:h-full shrink-0">
          <div className="p-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0">
            <span className="font-bold text-xs text-slate-500 uppercase tracking-wide">
              Groups & Depts
            </span>
            {selectedOrgId && <button className="text-blue-600 hover:bg-blue-50 p-1 rounded"><Plus className="h-4 w-4"/></button>}
          </div>
          <div className={`flex-1 overflow-x-auto md:overflow-y-auto p-2 space-x-2 md:space-x-0 md:space-y-2 flex md:block transition-opacity duration-200 ${isPending ? 'opacity-60' : 'opacity-100'}`}>
            {!selectedOrgId ? (
              <div className="text-center text-slate-400 mt-10 text-sm w-full">Select an Organization</div>
            ) : (
              <>
                <div 
                  onClick={() => handleGroupSelect(null)}
                  className={`p-3 rounded-lg cursor-pointer flex items-center justify-between border min-w-[200px] md:min-w-0 ${!selectedGroupId ? 'bg-white border-blue-300 shadow-sm' : 'bg-slate-100 border-transparent hover:bg-white hover:shadow-sm'}`}
                >
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-400"/>
                    <span className="text-sm font-medium">All Users</span>
                  </div>
                  {!selectedGroupId && <CheckCircle className="h-4 w-4 text-blue-500"/>}
                </div>
                
                {orgGroups.map(group => (
                  <div 
                    key={group.id}
                    onClick={() => handleGroupSelect(group.id)}
                    className={`p-3 rounded-lg cursor-pointer border transition-all min-w-[200px] md:min-w-0 ${selectedGroupId === group.id ? 'bg-white border-blue-300 shadow-sm' : 'bg-slate-100 border-transparent hover:bg-white hover:shadow-sm'}`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <h5 className={`text-sm font-bold ${selectedGroupId === group.id ? 'text-blue-700' : 'text-slate-700'}`}>{group.name}</h5>
                      <MoreVertical className="h-3 w-3 text-slate-400"/>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {group.permissions.slice(0, 2).map(p => (
                        <span key={p} className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">{p.replace('_', ' ')}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        <div className="flex-1 bg-white flex flex-col min-w-[300px] h-full overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0">
            <span className="font-bold text-xs text-slate-500 uppercase tracking-wide truncate max-w-[200px]">
              {selectedGroupId ? `${orgGroups.find(g => g.id === selectedGroupId)?.name}` : 'All Users'}
            </span>
            <div className="flex gap-2">
               <span className="text-xs bg-white border px-2 py-0.5 rounded text-slate-500">{displayedUsers.length}</span>
               <button className="text-blue-600 hover:bg-blue-50 p-1 rounded"><Plus className="h-4 w-4"/></button>
            </div>
          </div>
          
          <div className={`flex-1 overflow-y-auto transition-opacity duration-200 ${isPending ? 'opacity-60' : 'opacity-100'}`}>
            {displayedUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 py-10">
                <User className="h-12 w-12 mb-2 opacity-20"/>
                <p className="text-sm">No users found.</p>
              </div>
            ) : (
                <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-white sticky top-0">
                    <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500">Name</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500">Role</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500">Type</th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-slate-500">Status</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                    {displayedUsers.map(user => (
                        <tr key={user.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                            <div className="flex items-center">
                            <UserAvatar name={user.name} size="sm" className="mr-3"/>
                            <div>
                                <div className="text-sm font-medium text-slate-900">{user.name}</div>
                                <div className="text-xs text-slate-500">{user.email}</div>
                            </div>
                            </div>
                        </td>
                        <td className="px-4 py-3">
                            <div className="text-xs font-medium text-slate-700">{user.role}</div>
                        </td>
                        <td className="px-4 py-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            user.userType === 'Internal' 
                                ? 'bg-purple-50 text-purple-700 border-purple-100' 
                                : 'bg-amber-50 text-amber-700 border-amber-100'
                            }`}>
                            {user.userType}
                            </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                            <span className="flex items-center justify-end text-xs text-green-600 font-medium">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span> Active
                            </span>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
