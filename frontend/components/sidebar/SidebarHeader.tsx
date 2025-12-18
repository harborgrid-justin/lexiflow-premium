/**
 * @module components/sidebar/SidebarHeader
 * @category Layout
 * @description Header section of the sidebar displaying tenant branding.
 *
 * THEME SYSTEM USAGE:
 * This component uses the `useTheme` hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React from 'react';
import { Scale, X } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { useQuery } from '../../services/queryClient';
import { DataService } from '../../services/data/dataService'';

// Hooks & Context
import { useTheme } from '../../context/ThemeContext';

// Utils & Constants
import { cn } from '../../utils/cn';

// Types
import type { TenantConfig } from '../../types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface SidebarHeaderProps {
  /** Callback when close button is clicked. */
  onClose: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({ onClose }) => {
  const { theme } = useTheme();
  
  const { data: tenantConfig } = useQuery<TenantConfig>(
      ['admin', 'tenant'],
      DataService.admin.getTenantConfig,
      { initialData: { name: 'LexiFlow', tier: 'Enterprise Suite', version: '2.5', region: 'US-East-1' } }
  );

  return (
    <div className={cn("h-16 flex items-center justify-between px-6 border-b shrink-0", theme.surface.default, theme.border.default)}>
      <div className="flex items-center space-x-3">
        <div className={cn("p-1.5 rounded-lg shadow-sm border", theme.primary.DEFAULT, theme.primary.border)}>
            <Scale className={cn("h-5 w-5 text-white")} />
        </div>
        <div>
          <h1 className={cn("text-lg font-bold tracking-tight leading-none", theme.text.primary)}>{tenantConfig?.name}</h1>
          <p className={cn("text-[10px] uppercase tracking-widest font-bold mt-0.5 opacity-60", theme.text.primary)}>{tenantConfig?.tier}</p>
        </div>
      </div>
      <button 
        onClick={onClose} 
        className={cn("md:hidden p-1.5 rounded-md transition-colors", theme.text.tertiary, `hover:${theme.surface.highlight}`, `hover:${theme.text.primary}`)}
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
};

