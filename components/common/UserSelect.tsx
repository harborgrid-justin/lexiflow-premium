
import React from 'react';
import { UserAvatar } from './UserAvatar';
import { ChevronDown } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

interface UserOption {
  id: string;
  name: string;
  role?: string;
}

interface UserSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: UserOption[];
  className?: string;
}

export const UserSelect: React.FC<UserSelectProps> = ({ label, value, onChange, options, className = '' }) => {
  const { theme } = useTheme();
  const selectedUser = options.find(u => u.name === value || u.id === value);

  return (
    <div className={`relative ${className}`}>
      {label && <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>{label}</label>}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full pl-10 pr-8 py-2.5 border rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer",
            theme.surface,
            theme.border.default,
            theme.text.primary
          )}
        >
          <option value="">Select User...</option>
          {options.map(user => (
            <option key={user.id} value={user.name}>{user.name} {user.role ? `(${user.role})` : ''}</option>
          ))}
        </select>
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {selectedUser ? <UserAvatar name={selectedUser.name} size="sm" /> : <div className={cn("w-6 h-6 rounded-full border", theme.surfaceHighlight, theme.border.default)}/>}
        </div>
        <ChevronDown className={cn("absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none", theme.text.tertiary)} />
      </div>
    </div>
  );
};
