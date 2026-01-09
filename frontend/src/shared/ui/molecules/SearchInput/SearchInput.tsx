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
import { useId } from 'react';
import { Search } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Components
import { Input, InputProps } from '@/shared/ui/atoms/Input';

// Hooks & Context
import { useTheme } from '@/contexts/theme/ThemeContext';

// Utils & Constants
import { cn } from '@/shared/lib/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
export function SearchInput(props: InputProps) {
  const { theme } = useTheme();
  const generatedId = useId();
  const inputId = props.id || generatedId;

  return (
    <div className="relative">
      <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none", theme.text.tertiary)} />
      <Input {...props} id={inputId} className={cn("pl-10", props.className)} />
    </div>
  );
}
