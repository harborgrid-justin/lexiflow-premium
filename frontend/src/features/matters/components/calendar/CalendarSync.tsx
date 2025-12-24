/**
 * @module components/calendar/CalendarSync
 * @category Calendar - Integrations
 * @description Calendar sync dashboard for managing 2-way integration with external providers (Outlook, Google Calendar, etc.).
 *
 * THEME SYSTEM USAGE:
 * Uses theme.surface, theme.text, theme.border for consistent theming. Hardcoded green/red for connection status.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React from 'react';
import { RefreshCw, CheckCircle, XCircle, Loader2 } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services/Data
import { DataService } from '@/services/data/dataService';
import { useQuery } from '@/hooks/useQueryHooks';

// Hooks & Context
import { useTheme } from '@/providers/ThemeContext';

// Components
import { Button } from '@/components/atoms/Button';

// Utils & Constants
import { cn } from '@/utils/cn';

// ============================================================================
// COMPONENT
// ============================================================================

export const CalendarSync: React.FC = () => {
  const { theme } = useTheme();
  
  // Enterprise Data Access
  const { data: integrations = [], isLoading } = useQuery<any[]>(
      ['admin', 'integrations'],
      DataService.admin.getIntegrations
  );

  const calendarIntegrations = integrations.filter((i: unknown) => {
    if (typeof i === 'object' && i !== null && 'type' in i && typeof i.type === 'string') {
      return i.type.includes('Calendar') || i.type.includes('Email');
    }
    return false;
  });

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-600"/></div>;

  return (
    <div className={cn("rounded-lg border overflow-hidden shadow-sm animate-fade-in", theme.surface.default, theme.border.default)}>
      <div className={cn("p-6 border-b flex justify-between items-center", theme.surface.highlight, theme.border.default)}>
        <div>
          <h3 className={cn("font-bold text-lg", theme.text.primary)}>Calendar Integrations</h3>
          <p className={cn("text-sm", theme.text.secondary)}>Manage 2-way sync with external providers.</p>
        </div>
        <Button variant="outline" size="sm" icon={RefreshCw} className="hidden md:flex">Force Sync All</Button>
        <Button variant="outline" size="sm" className="md:hidden"><RefreshCw className="h-4 w-4"/></Button>
      </div>
      <div className={cn("divide-y", theme.border.default)}>
        {calendarIntegrations.map((acc, i) => (
          <div key={i} className={cn("p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0 transition-colors", `hover:${theme.surface.highlight}`)}>
            <div className="flex items-center gap-4">
              <div className={cn("h-10 w-10 rounded-full flex items-center justify-center font-bold text-white shrink-0", acc.color)}>
                {acc.icon}
              </div>
              <div>
                <h4 className={cn("font-bold", theme.text.primary)}>{acc.name}</h4>
                <p className={cn("text-sm", theme.text.secondary)}>{acc.type}</p>
              </div>
            </div>
            <div className="flex justify-between md:block md:text-right items-center">
              <div className={`flex items-center md:justify-end text-sm font-medium ${acc.status === 'Connected' ? 'text-green-600' : 'text-red-600'}`}>
                {acc.status === 'Connected' ? <CheckCircle className="h-4 w-4 mr-1"/> : <XCircle className="h-4 w-4 mr-1"/>}
                {acc.status}
              </div>
              <p className={cn("text-xs mt-1", theme.text.tertiary)}>Last Sync: 2 mins ago</p>
            </div>
          </div>
        ))}
        {calendarIntegrations.length === 0 && (
             <div className="p-8 text-center text-slate-400">No calendar integrations configured.</div>
        )}
      </div>
      <div className={cn("p-6 border-t", theme.surface.highlight, theme.border.default)}>
        <Button variant="primary" className="w-full md:w-auto">Add New Account</Button>
      </div>
    </div>
  );
};

