
import React, { useState } from 'react';
import { useTheme } from '../../../../context/ThemeContext';
import { cn } from '../../../../utils/cn';
import { Shield, CheckCircle, XCircle, Info, Lock } from 'lucide-react';
import { RolePermission, PermissionLevel } from '../../../../types';
import { useQuery, useMutation, queryClient } from '../../../../services/queryClient';
import { DataService } from '../../../../services/dataService';
import { useNotify } from '../../../../hooks/useNotify';

export const AccessMatrix: React.FC = () => {
  const { theme } = useTheme();
  const notify = useNotify();

  // Roles and Resources definition
  const roles = ['Administrator', 'Partner', 'Associate', 'Paralegal', 'Client'];
  const resources = ['Cases', 'Financials', 'Audit Logs', 'Security Settings', 'Personnel', 'Integrations', 'API Keys'];

  const { data: permissions = [], isLoading } = useQuery<RolePermission[]>(
      ['admin', 'permissions'],
      DataService.admin.getPermissions
  );

  const { mutate: updatePermission } = useMutation(
      DataService.admin.updatePermission,
      {
          onSuccess: (data) => {
              queryClient.invalidate(['admin', 'permissions']);
              notify.info(`Permission updated: ${data.role} -> ${data.resource}`);
          }
      }
  );

  const getPermission = (role: string, resource: string): PermissionLevel => {
      const perm = permissions.find(p => p.role === role && p.resource === resource);
      return perm ? perm.access : 'None';
  };

  const cyclePermission = (role: string, resource: string) => {
      const current = getPermission(role, resource);
      const levels: PermissionLevel[] = ['None', 'Read', 'Write', 'Full', 'Own'];
      const nextIndex = (levels.indexOf(current) + 1) % levels.length;
      const nextLevel = levels[nextIndex];
      
      updatePermission({ role, resource, level: nextLevel });
  };

  const getPermissionStyle = (level: PermissionLevel) => {
      switch (level) {
          case 'Full': return "bg-green-50 text-green-700 border-green-200";
          case 'Write': return "bg-blue-50 text-blue-700 border-blue-200";
          case 'Read': return "bg-sky-50 text-sky-700 border-sky-200";
          case 'Own': return "bg-purple-50 text-purple-700 border-purple-200";
          default: return cn(theme.surfaceHighlight, theme.text.secondary, theme.border.default, "opacity-60");
      }
  };

  const getIcon = (level: PermissionLevel) => {
      switch (level) {
          case 'Full': return <CheckCircle className="h-3 w-3"/>;
          case 'Write': return <CheckCircle className="h-3 w-3"/>;
          case 'Read': return <Info className="h-3 w-3"/>;
          case 'Own': return <Lock className="h-3 w-3"/>;
          default: return <XCircle className="h-3 w-3"/>;
      }
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading Access Matrix...</div>;

  return (
    <div className={cn("h-full w-full rounded-lg border shadow-sm overflow-auto bg-white dark:bg-slate-900 relative", theme.border.default)}>
        <table className="w-full text-sm text-left border-collapse">
            <thead className={cn("text-xs uppercase font-bold", theme.text.secondary)}>
                <tr>
                    <th className={cn("px-6 py-4 sticky top-0 left-0 z-20 border-b border-r bg-gray-50 dark:bg-slate-800 min-w-[200px]", theme.border.default)}>Resource Scope</th>
                    {roles.map(r => (
                        <th key={r} className={cn("px-6 py-4 text-center sticky top-0 z-10 border-b bg-gray-50 dark:bg-slate-800", theme.border.default)}>{r}</th>
                    ))}
                </tr>
            </thead>
            <tbody className={cn("divide-y", theme.border.light)}>
                {resources.map(res => (
                    <tr key={res} className={cn("transition-colors", `hover:${theme.surfaceHighlight}`)}>
                        <td className={cn("px-6 py-4 font-medium flex items-center gap-2 sticky left-0 z-10 border-r bg-white dark:bg-slate-900", theme.text.primary, theme.border.default)}>
                            <Shield className="h-4 w-4 text-blue-500 shrink-0"/> {res}
                        </td>
                        {roles.map(role => {
                            const access = getPermission(role, res);
                            return (
                                <td 
                                    key={role} 
                                    onClick={() => cyclePermission(role, res)}
                                    className={cn("px-6 py-4 text-center cursor-pointer transition-colors border-r last:border-r-0 border-dashed border-slate-100 dark:border-slate-800", `hover:${theme.surfaceHighlight}`)}
                                >
                                    <div className="flex justify-center">
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 w-20 justify-center select-none transition-all",
                                            getPermissionStyle(access)
                                        )}>
                                            {getIcon(access)}
                                            {access}
                                        </span>
                                    </div>
                                </td>
                            )
                        })}
                    </tr>
                ))}
            </tbody>
        </table>
        <div className="p-4 text-xs text-center text-slate-400 border-t bg-slate-50/50">
            Click any cell to cycle permission levels: None → Read → Write → Full → Own
        </div>
    </div>
  );
};
