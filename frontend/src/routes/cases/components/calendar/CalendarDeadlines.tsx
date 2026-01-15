/**
 * @module components/calendar/CalendarDeadlines
 * @category Calendar
 * @description Deadline tracker with automated FRCP calculations.
 *
 * THEME SYSTEM USAGE:
 * Uses theme indirectly through child components.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { AlertCircle } from 'lucide-react';
// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/data-service.service';
// ✅ Migrated to backend API (2025-12-21)

// Components
import { TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '@/components/organisms/Table/Table';
import { Badge } from '@/components/atoms/Badge/Badge';
import { DateText } from '@/components/atoms/DateText/DateText';

// Types
import { CalendarEventItem } from '@/types';

// ============================================================================
// COMPONENT
// ============================================================================

export const CalendarDeadlines: React.FC = () => {

  // Enterprise Data Access
  const { data: eventsData = [] } = useQuery<CalendarEventItem[]>(
    ['calendar', 'all'],
    async () => {
      const result = await DataService.calendar.getEvents();
      return Array.isArray(result) ? result : [];
    }
  );

  // Ensure events is always an array
  const events = Array.isArray(eventsData) ? eventsData : [];

  const deadlines = events.filter(e => e.type === 'deadline' || e.type === 'compliance').map(e => ({
    id: e.id,
    date: e.date,
    matter: e.title,
    event: e.description || e.title,
    type: e.type === 'deadline' ? 'Filing' : 'Compliance',
    status: e.priority === 'Critical' ? 'Critical' : 'Pending'
  }));

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
        <div>
          <h4 className="font-bold text-amber-800 text-sm">Automated Deadline Calculation Active</h4>
          <p className="text-xs text-amber-700 mt-1">Dates are calculated based on FRCP and Local Rules (CA Superior). Weekends and Holidays are excluded where applicable.</p>
        </div>
      </div>

      <TableContainer>
        <TableHeader>
          <TableHead>Due Date</TableHead>
          <TableHead>Matter / Event</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
        </TableHeader>
        <TableBody>
          {deadlines.map(d => (
            <TableRow key={d.id}>
              <TableCell>
                <DateText date={d.date} icon={true} className="font-semibold text-slate-900" />
              </TableCell>
              <TableCell className="text-blue-600 font-medium">
                <div>{d.matter}</div>
                <div className="text-xs text-slate-500 font-normal">{d.event}</div>
              </TableCell>
              <TableCell><Badge variant="neutral">{d.type}</Badge></TableCell>
              <TableCell>
                <Badge variant={d.status === 'Critical' ? 'error' : 'warning'}>
                  {d.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
          {deadlines.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-slate-400">No upcoming deadlines found.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </TableContainer>
    </div>
  );
};
