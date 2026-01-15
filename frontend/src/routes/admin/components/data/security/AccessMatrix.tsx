import React from 'react';
import { useTheme } from "@/hooks/useTheme";
import { queryClient, useMutation, useQuery } from '@/hooks/backend';
import { useNotify } from '@/hooks/core';
import { DataService } from '@/services/data/data-service.service';
import { cn } from '@/lib/cn';
import { RLSPermissionLevel as PermissionLevel, RolePermission } from '@/types/data-quality';
import { queryKeys } from '@/utils/queryKeys';
import { CheckCircle, Info, Lock, Shield, XCircle } from 'lucide-react';

/**
 * AccessMatrix - React 18 optimized with React.memo
 */
export const AccessMatrix = React.memo(function AccessMatrix() {
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
            onSuccess: (data: { role: string; resource: string }) => {
                queryClient.invalidate(queryKeys.admin.permissions());
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
            default: return cn(theme.surface.highlight, theme.text.secondary, theme.border.default, "opacity-60");
        }
    };

    const getIcon = (level: PermissionLevel) => {
        switch (level) {
            case 'Full': return <CheckCircle className="h-3 w-3" />;
            case 'Write': return <CheckCircle className="h-3 w-3" />;
            case 'Read': return <Info className="h-3 w-3" />;
            case 'Own': return <Lock className="h-3 w-3" />;
            default: return <XCircle className="h-3 w-3" />;
        }
    };

    if (isLoading) return <div className={cn("p-8 text-center", theme.text.secondary)}>Loading Access Matrix...</div>;

    return (
        <div className={cn("h-full w-full rounded-lg border shadow-sm overflow-auto relative", theme.surface.default, theme.border.default)}>
            <table className="w-full text-sm text-left border-collapse">
                <thead className={cn("text-xs uppercase font-bold", theme.text.secondary)}>
                    <tr>
                        <th className={cn("px-6 py-4 sticky top-0 left-0 z-20 border-b border-r min-w-[200px]", theme.surface.highlight, theme.border.default)}>Resource Scope</th>
                        {roles.map(r => (
                            <th key={r} className={cn("px-6 py-4 text-center sticky top-0 z-10 border-b", theme.surface.highlight, theme.border.default)}>{r}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className={cn("divide-y", theme.border.default)}>
                    {resources.map(res => (
                        <tr key={res} className={cn("transition-colors", `hover:${theme.surface.highlight}`)}>
                            <td className={cn("px-6 py-4 font-medium flex items-center gap-2 sticky left-0 z-10 border-r", theme.surface.default, theme.text.primary, theme.border.default)}>
                                <Shield className="h-4 w-4 text-blue-500 shrink-0" /> {res}
                            </td>
                            {roles.map(role => {
                                const access = getPermission(role, res);
                                return (
                                    <td
                                        key={role}
                                        onClick={() => cyclePermission(role, res)}
                                        className={cn("px-6 py-4 text-center cursor-pointer transition-colors border-r last:border-r-0 border-dashed", theme.border.default, `hover:${theme.surface.highlight}`)}
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
            <div className={cn("p-4 text-xs text-center border-t", theme.text.tertiary, theme.surface.highlight, theme.border.default)}>
                Click any cell to cycle permission levels: None → Read → Write → Full → Own
            </div>
        </div>
    );
});
