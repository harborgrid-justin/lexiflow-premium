/**
 * MotionList.tsx
 *
 * Tabular list of motions with status badges, conferral indicators,
 * and deadline tracking.
 *
 * @module components/case-detail/motions/MotionList
 * @category Case Management - Motions
 */

// External Dependencies
import { Calendar, FileText, Gavel, GitBranch, MessageSquare, Users } from 'lucide-react';
// Internal Dependencies - Components
import { TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '@/shared/ui/organisms/Table/Table';
import { Badge, BadgeProps } from '@/shared/ui/atoms/Badge';
import { Button } from '@/shared/ui/atoms/Button';

// Internal Dependencies - Hooks & Context
import { useTheme } from '@/theme';

// Internal Dependencies - Services & Utils
import { cn } from '@/shared/lib/cn';

// Types & Interfaces
import { Motion } from '@/types';

interface MotionListProps {
  motions: Motion[];
  onTaskClick: (motion: Motion) => void;
}

export const MotionList: React.FC<MotionListProps> = ({ motions, onTaskClick }) => {
  const { theme } = useTheme();

  // Safety check: ensure motions is always an array
  const safeMotions = Array.isArray(motions) ? motions : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft': return 'neutral';
      case 'Filed': return 'info';
      case 'Hearing Set': return 'warning';
      case 'Decided': return 'success';
      default: return 'neutral';
    }
  };

  const getConferralBadge = (status?: string) => {
    switch (status) {
      case 'Agreed': return <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold border border-green-200">Agreed</span>;
      case 'Impasse': return <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold border border-red-200">Impasse</span>;
      case 'Scheduled': return <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold border border-blue-200">Scheduled</span>;
      default: return <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-bold border border-amber-200">Required</span>;
    }
  };

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <TableContainer>
          <TableHeader>
            <TableHead>Motion Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Hearing</TableHead>
            <TableHead>Rules</TableHead>
            <TableHead>Meet & Confer</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableHeader>
          <TableBody>
            {safeMotions.map(motion => (
              <TableRow key={motion.id}>
                <TableCell className={cn("font-medium flex items-center", theme.text.primary)}>
                  <Gavel className={cn("h-4 w-4 mr-2", theme.text.tertiary)} />
                  <div>
                    {motion.title}
                    {motion.documents && motion.documents.length > 0 && (
                      <div className={cn("text-[10px] flex items-center mt-0.5", theme.text.link)}>
                        <FileText className="h-3 w-3 mr-1" /> {motion.documents.length} Exhibits Linked
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{motion.type}</TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(motion.status) as BadgeProps['variant']}>{motion.status}</Badge>
                </TableCell>
                <TableCell>
                  {motion.hearingDate ? (
                    <span className="flex items-center text-red-600 font-medium text-xs">
                      <Calendar className="h-3 w-3 mr-1" /> {motion.hearingDate}
                    </span>
                  ) : '-'}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1 max-w-[150px]">
                    {motion.linkedRules && motion.linkedRules.length > 0 ? motion.linkedRules.map(r => (
                      <span key={r} className={cn("text-[9px] border px-1 rounded", theme.surface.highlight, theme.text.secondary, theme.border.default)}>{r}</span>
                    )) : '-'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {getConferralBadge(motion.conferralStatus)}
                    <button className={cn("text-[10px] hover:underline flex items-center", theme.text.link)}>
                      <MessageSquare className="h-3 w-3 mr-1" /> Log Session
                    </button>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost" className="text-indigo-600" onClick={() => onTaskClick(motion)} icon={GitBranch}>To Workflow</Button>
                    <Button size="sm" variant="ghost" className={theme.text.link}>Details</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {motions.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className={cn("text-center py-8 italic", theme.text.tertiary)}>No motions found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </TableContainer>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {safeMotions.map(motion => (
          <div key={motion.id} className={cn("p-4 rounded-lg shadow-sm border", theme.surface.default, theme.border.default)}>
            <div className="flex justify-between items-start mb-2">
              <h4 className={cn("font-bold text-sm flex items-center gap-2", theme.text.primary)}>
                <Gavel className={cn("h-4 w-4", theme.text.link)} />
                {motion.title}
              </h4>
              <Badge variant={getStatusColor(motion.status) as BadgeProps['variant']}>{motion.status}</Badge>
            </div>
            <div className={cn("text-xs mb-3", theme.text.secondary)}>{motion.type} • Filed: {motion.filingDate || 'Draft'}</div>

            <div className={cn("flex justify-between items-center mb-3 p-2 rounded", theme.surface.highlight)}>
              <div className="flex items-center text-xs">
                <Users className={cn("h-3 w-3 mr-1", theme.text.tertiary)} />
                <span className={cn("mr-2", theme.text.secondary)}>Conferral:</span>
                {getConferralBadge(motion.conferralStatus)}
              </div>
            </div>

            {motion.hearingDate && (
              <div className={cn("p-3 rounded border space-y-2 mb-3", theme.surface.highlight, theme.border.subtle)}>
                <div className="flex items-center justify-between text-xs">
                  <span className={cn("font-medium flex items-center", theme.text.secondary)}><Calendar className="h-3 w-3 mr-1" /> Hearing</span>
                  <span className={cn("font-bold", theme.text.primary)}>{motion.hearingDate}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className={theme.text.secondary}>Opposition Due</span>
                  <span className={cn("font-mono", theme.text.primary)}>{motion.oppositionDueDate}</span>
                </div>
              </div>
            )}

            <div className={cn("flex justify-end gap-2 pt-2 border-t", theme.border.subtle)}>
              <Button size="sm" variant="outline" className="flex-1" icon={GitBranch} onClick={() => onTaskClick(motion)}>To Workflow</Button>
              <Button size="sm" variant="outline" className="flex-1">Details</Button>
            </div>
          </div>
        ))}
        {safeMotions.length === 0 && (
          <div className={cn("text-center py-8 italic rounded-lg", theme.surface.highlight, theme.text.tertiary)}>No motions found.</div>
        )}
      </div>
    </>
  );
};
