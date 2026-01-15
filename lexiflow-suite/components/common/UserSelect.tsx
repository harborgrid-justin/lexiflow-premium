
import { ChevronDown } from 'lucide-react';
import React from 'react';
import { UserAvatar } from './UserAvatar.tsx';

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
  const selectedUser = options.find(u => u.name === value || u.id === value);

  return (
    <div className={`relative ${className}`}>
      {label && <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">{label}</label>}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          className="w-full pl-10 pr-8 py-2.5 border rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
        >
          <option value="">Select User...</option>
          {options.map(user => (
            <option key={user.id} value={user.name}>{user.name} {user.role ? `(${user.role})` : ''}</option>
          ))}
        </select>
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {selectedUser ? <UserAvatar name={selectedUser.name} size="sm" /> : <div style={{ backgroundColor: 'var(--color-surfaceHover)' }} className="w-6 h-6 rounded-full" />}
        </div>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );
};
