/**
 * @module components/molecules/SearchInput
 * @category Molecules
 * @description Search input component with icon.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React from 'react';
import { Search } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Components
import { Input, InputProps } from '@/components/atoms/Input';

// Hooks & Context
import { useTheme } from '@/providers/ThemeContext';

// Utils & Constants
import { cn } from '@/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
export const SearchInput: React.FC<InputProps> = (props) => {
  const { theme } = useTheme();
  
  return (
    <div className="relative">
      <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none", theme.text.tertiary)} />
      <Input {...props} className={cn("pl-10", props.className)} />
    </div>
  );
};
