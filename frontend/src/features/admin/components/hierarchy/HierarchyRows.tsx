
import React from 'react';
import { Building2, Globe, Shield, MoreVertical } from 'lucide-react';
import { Organization, Group, User as UserType } from '@/types';
import { useTheme } from '@/providers/ThemeContext';
import { cn } from '@/utils/cn';
import { UserAvatar } from '@/components/atoms/UserAvatar';

interface OrgListItemProps {
    org: Organization;
    isSelected: boolean;
    onSelect: (id: string) => void;
}

export const OrgListItem: React.FC<OrgListItemProps> = ({ org, isSelected, onSelect }) => {
    const { theme } = useTheme();
    return (
        <div 
            onClick={() => onSelect(org.id)}
            className={cn(
                "p-4 border-b cursor-pointer transition-all group relative min-w-[280px] md:min-w-0 inline-block md:block",
                isSelected 
                    ? cn("border-l-4 border-l-blue-600 md:border-b-0", theme.surface.highlight) 
                    : cn("border-l-4 border-l-transparent md:border-b", theme.border.subtle, `hover:${theme.surface.highlight}`)
            )}
        >
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg shrink-0 ${org.type === 'LawFirm' ? cn(theme.primary.DEFAULT, theme.text.inverse) : org.type === 'Corporate' ? cn(theme.primary.light, theme.primary.text) : 'bg-slate-100 text-slate-600'}`}>
                        {org.type === 'LawFirm' ? <Shield className="h-5 w-5"/> : org.type === 'Corporate' ? <Building2 className="h-5 w-5"/> : <Globe className="h-5 w-5"/>}
                    </div>
                    <div>
                        <h4 className={cn("font-bold text-sm", theme.text.primary)}>{org.name}</h4>
                        <p className={cn("text-xs truncate max-w-[150px]", theme.text.secondary)}>{org.domain}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface GroupListItemProps {
    group: Group;
    isSelected: boolean;
    onSelect: (id: string) => void;
}

export const GroupListItem: React.FC<GroupListItemProps> = ({ group, isSelected, onSelect }) => {
    const { theme } = useTheme();
    return (
        <div 
            onClick={() => onSelect(group.id)} 
            className={cn(
                "p-3 rounded-lg cursor-pointer border transition-all min-w-[200px] md:min-w-0",
                isSelected ? cn(theme.surface.default, "border-blue-300 shadow-sm") : cn("bg-transparent border-transparent", `hover:${theme.surface.default}`)
            )}
        >
            <div className="flex justify-between items-center mb-1">
                <h5 className={cn("text-sm font-bold", isSelected ? "text-blue-600" : theme.text.primary)}>{group.name}</h5>
                <MoreVertical className={cn("h-3 w-3", theme.text.tertiary)}/>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
                {group.permissions.slice(0, 2).map(p => (
                    <span key={p} className={cn("text-[9px] px-1.5 py-0.5 rounded border", theme.surface.default, theme.border.default, theme.text.secondary)}>
                        {p.replace('_', ' ')}
                    </span>
                ))}
            </div>
        </div>
    );
};

interface UserListItemProps {
    user: UserType;
    viewMode?: 'table' | 'card';
}

export const UserListItem: React.FC<UserListItemProps> = ({ user, viewMode = 'table' }) => {
    const { theme } = useTheme();

    if (viewMode === 'card') {
        return (
            <div className={cn("p-4 flex items-center justify-between border-b last:border-0", theme.border.subtle)}>
                <div className="flex items-center">
                    <UserAvatar name={user.name} size="sm" className="mr-3"/>
                    <div>
                        <div className={cn("text-sm font-medium", theme.text.primary)}>{user.name}</div>
                        <div className={cn("text-xs", theme.text.secondary)}>{user.role} • {user.userType || 'Internal'}</div>
                    </div>
                </div>
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            </div>
        );
    }

    return (
        <tr className={cn("transition-colors", `hover:${theme.surface.highlight}`)}>
            <td className="px-4 py-3">
                <div className="flex items-center">
                    <UserAvatar name={user.name} size="sm" className="mr-3"/>
                    <div>
                        <div className={cn("text-sm font-medium", theme.text.primary)}>{user.name}</div>
                        <div className={cn("text-xs", theme.text.secondary)}>{user.email}</div>
                    </div>
                </div>
            </td>
            <td className="px-4 py-3"><div className={cn("text-xs font-medium", theme.text.primary)}>{user.role}</div></td>
            <td className="px-4 py-3">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${user.userType === 'Internal' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                    {user.userType || 'Internal'}
                </span>
            </td>
            <td className="px-4 py-3 text-right">
                <span className="flex items-center justify-end text-xs text-green-600 font-medium">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span> Active
                </span>
            </td>
        </tr>
    );
};
