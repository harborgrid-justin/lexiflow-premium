/**
 * @module components/common/UserSelect
 * @category Common
 * @description User dropdown with avatar display.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React from 'react';
import { ChevronDown } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '../../context/ThemeContext';

// Components
import { UserAvatar } from './UserAvatar';

// Utils & Constants
import { cn } from '../../utils/cn';
import { MOCK_USERS } from '../../data/models/user';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
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
            theme.surface.default,
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
          {selectedUser ? <UserAvatar name={selectedUser.name} size="sm" /> : <div className={cn("w-6 h-6 rounded-full border", theme.surface.highlight, theme.border.default)}/>}
        </div>
        <ChevronDown className={cn("absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none", theme.text.tertiary)} />
      </div>
    </div>
  );
};