/**
 * @module components/calendar/CalendarTeam
 * @category Calendar - Team Management
 * @description Team availability grid showing weekly schedule for all team members.
 *
 * THEME SYSTEM USAGE:
 * Uses theme.surface, theme.text, theme.border for consistent theming. Hardcoded green for availability indicators.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services/Data
import { useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/dataService';

// Hooks & Context
import { useTheme } from '@/features/theme';

// Components
import { UserAvatar } from '@/shared/ui/atoms/UserAvatar/UserAvatar';

// Utils & Constants
import { cn } from '@/shared/lib/cn';

// ============================================================================
// COMPONENT
// ============================================================================

interface TeamMember {
  id: string;
  name: string;
  role: string;
  availability?: Record<string, unknown>;
  schedule?: number[];
}

export const CalendarTeam: React.FC = () => {
  const { theme } = useTheme();

  const { data: team = [] } = useQuery<TeamMember[]>(
    ['calendar', 'team'],
    DataService.calendar.getTeamAvailability
  );

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className={cn("rounded-lg border overflow-hidden shadow-sm animate-fade-in", theme.surface.default, theme.border.default)}>
      <div className={cn("p-4 border-b", theme.surface.highlight, theme.border.default)}>
        <h3 className={cn("font-bold", theme.text.primary)}>Team Availability (This Week)</h3>
      </div>
      <div className="p-6">
        <div className={cn("hidden md:grid grid-cols-8 gap-4 mb-4 border-b pb-2", theme.border.default)}>
          <div className={cn("col-span-1 font-semibold text-xs uppercase", theme.text.tertiary)}>Team Member</div>
          {days.map(d => <div key={d} className={cn("col-span-1 font-semibold text-xs uppercase text-center", theme.text.tertiary)}>{d}</div>)}
        </div>

        <div className="space-y-6 md:space-y-6">
          {team.map((member, idx) => (
            <div key={idx} className={cn("grid grid-cols-1 md:grid-cols-8 gap-4 items-center border-b md:border-b-0 pb-4 md:pb-0 last:border-0", theme.border.default)}>
              <div className="col-span-1 flex items-center gap-2 mb-2 md:mb-0">
                <UserAvatar name={member.name} size="sm" />
                <div className="overflow-hidden">
                  <p className={cn("text-sm font-bold truncate", theme.text.primary)}>{member.name}</p>
                  <p className={cn("text-xs truncate", theme.text.secondary)}>{member.role}</p>
                </div>
              </div>

              <div className="col-span-1 md:col-span-7 grid grid-cols-7 gap-2">
                {member.schedule?.map((status: number, i: number) => (
                  <div key={`schedule-${member.name}-day-${i}`} className="flex flex-col items-center gap-1">
                    <span className={cn("md:hidden text-[10px] uppercase font-bold", theme.text.tertiary)}>{days[i]!.charAt(0)}</span>
                    <div className={cn(
                      "h-8 w-full rounded-md flex items-center justify-center border transition-colors",
                      status
                        ? "bg-green-100 border-green-200"
                        : cn(theme.surface.highlight, theme.border.default)
                    )}>
                      <span className={cn("text-[10px] md:text-xs font-medium", status ? "text-green-700" : theme.text.tertiary)}>
                        {status ? 'OK' : '-'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
