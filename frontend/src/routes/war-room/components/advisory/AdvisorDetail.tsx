/**
 * @module components/war-room/advisory/AdvisorDetail
 * @category WarRoom
 * @description Detailed view of a selected advisor, showing profile, deliverables,
 * financials, and conflict check status.
 *
 * THEME SYSTEM USAGE:
 * This component uses the `useTheme` hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { X, FileText, Download, Clock, CheckCircle } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/theme';

// Components
import { Button } from '@/components/atoms/Button';

// Utils & Constants
import { cn } from '@/lib/cn';

// Types
import type { Advisor } from './AdvisorList';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface AdvisorDetailProps {
  /** The advisor object to display details for. */
  advisor: Advisor;
  /** Callback when the detail panel is closed. */
  onClose: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const AdvisorDetail: React.FC<AdvisorDetailProps> = ({ advisor, onClose }) => {
  const { theme } = useTheme();

  return (
    <div className={cn("w-96 border-l flex flex-col shadow-xl animate-in slide-in-from-right duration-300 z-10", theme.surface.default, theme.border.default)}>
        <div className={cn("p-4 border-b flex justify-between items-center", theme.surface.highlight, theme.border.default)}>
            <h3 className={cn("font-bold text-lg mb-0", theme.text.primary)}>Advisor Profile</h3>
            <button onClick={onClose} className={cn("p-1 rounded transition-colors", theme.text.tertiary, `hover:${theme.surface.default}`)}><X className="h-4 w-4"/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="text-center">
                <div className={cn("w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-bold border-2 border-white shadow-md", theme.primary.light, theme.primary.text)}>
                    {advisor.name.charAt(0)}
                </div>
                <h3 className={cn("text-xl font-bold", theme.text.primary)}>{advisor.name}</h3>
                <p className={cn("text-sm", theme.text.secondary)}>{advisor.specialty}</p>
                <div className="flex justify-center gap-2 mt-3">
                    <span className={cn("text-xs px-2 py-1 rounded font-medium border", theme.primary.light, theme.primary.text, theme.border.default)}>{advisor.status}</span>
                    <span className={cn("text-xs px-2 py-1 rounded font-mono border", theme.surface.highlight, theme.text.secondary, theme.border.default)}>${advisor.rate}/hr</span>
                </div>
            </div>

            <div className="space-y-4">
                <h4 className={cn("font-bold text-base border-b pb-2", theme.text.primary)}>Deliverables</h4>
                <div className="space-y-3">
                    <div className={cn("p-3 rounded border flex items-start gap-3 transition-colors cursor-pointer", theme.surface.default, theme.border.default, `hover:${theme.primary.border}`)}>
                        <FileText className="h-5 w-5 text-rose-500 shrink-0"/>
                        <div className="flex-1 min-w-0">
                            <p className={cn("text-sm font-bold truncate", theme.text.primary)}>Initial Expert Report</p>
                            <p className={cn("text-xs", theme.text.secondary)}>PDF • 4.2 MB • Oct 15</p>
                        </div>
                        <Download className={cn("h-4 w-4 transition-colors", theme.text.tertiary, `hover:${theme.primary.text}`)}/>
                    </div>
                    <div className={cn("p-3 rounded border flex items-start gap-3 transition-colors cursor-pointer", theme.surface.default, theme.border.default, theme.primary.border)}>
                        <FileText className={cn("h-5 w-5 shrink-0", theme.primary.text)}/>
                        <div className="flex-1 min-w-0">
                            <p className={cn("text-sm font-bold truncate", theme.text.primary)}>Rebuttal to Defense Expert</p>
                            <p className={cn("text-xs", theme.text.secondary)}>Draft • Due: Tomorrow</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h4 className={cn("font-bold text-base border-b pb-2", theme.text.primary)}>Financials</h4>
                <div className={cn("grid grid-cols-2 gap-3 text-sm", theme.text.secondary)}>
                    <div><strong className={theme.text.primary}>Hourly Rate:</strong> ${advisor.rate}</div>
                    <div><strong className={theme.text.primary}>Total Billed:</strong> $45,000</div>
                    <div><strong className={theme.text.primary}>Hours Logged:</strong> 120</div>
                    <div><strong className={theme.text.primary}>Reports Filed:</strong> {advisor.reports}</div>
                    <div><strong className={theme.text.primary}>Retainer:</strong> $10,000</div>
                    <div><strong className={theme.text.primary}>Incurred:</strong> $4,500</div>
                </div>
                <div className={cn("text-xs flex items-center justify-center pt-2", theme.text.tertiary)}>
                    <Clock className="h-3 w-3 mr-1"/> Last Invoice: 12 days ago
                </div>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
                <h5 className="text-sm font-bold text-emerald-800 mb-1 flex items-center"><CheckCircle className="h-4 w-4 mr-2"/> Conflict Check</h5>
                <p className="text-xs text-emerald-700">Cleared on Sep 01, 2023. No adverse relations found with opposing parties.</p>
            </div>
        </div>

        <div className={cn("p-4 border-t flex gap-2", theme.border.default)}>
            <Button variant="outline" className="flex-1">Message</Button>
            <Button variant="primary" className="flex-1">Assign Task</Button>
        </div>
    </div>
  );
};
