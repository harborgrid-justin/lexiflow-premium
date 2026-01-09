/**
 * @module components/common/UserSelect
 * @category Common
 * @description User dropdown with avatar display.
 */

'use client';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================

import { UserAvatar } from '@/components/ui/atoms/UserAvatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/shadcn/select';
import { Label } from '@/components/ui/shadcn/label';

import { cn } from '@/lib/utils';

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

/**
 * UserSelect - Shadcn optimized user dropdown
 */
export function UserSelect({ label, value, onChange, options, className = '' }: UserSelectProps) {
  const selectedUser = options.find(u => u.name === value || u.id === value);

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && <Label className="text-xs font-semibold uppercase text-muted-foreground">{label}</Label>}
      <div className="relative">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="pl-10">
            <SelectValue placeholder="Select User..." />
          </SelectTrigger>
          <SelectContent>
            {options.map(user => (
              <SelectItem key={user.id} value={user.name}>
                {user.name} {user.role && <span className="text-muted-foreground text-xs ml-1">({user.role})</span>}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {selectedUser ? (
            <UserAvatar name={selectedUser.name} size="sm" className="h-5 w-5 text-[10px]" />
          ) : (
            <div className="w-5 h-5 rounded-full border bg-muted" />
          )}
        </div>
      </div>
    </div>
  );
}
