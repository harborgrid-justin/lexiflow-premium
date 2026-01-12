/**
 * @module components/common/TimeEntryModal
 * @category Common Components - Billing
 * @description Modal for logging billable time with AI refinement of descriptions.
 *
 * THEME SYSTEM USAGE:
 * Uses theme.text, theme.primary, theme.surface, theme.border for consistent theming.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useState } from 'react';
import { Clock, Wand2, DollarSign } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services/Data
import { refineTimeEntry } from '@/app/actions/ai/gemini';

// Hooks & Context
import { useTheme } from '@/providers';

// Components
import { Modal } from '@/components/ui/molecules/Modal/Modal';
import { Button } from '@/components/ui/atoms/Button';
import { Input } from '@/components/ui/atoms/Input';
import { TextArea } from '@/components/ui/atoms/TextArea';

// Utils & Constants
import { cn } from '@/utils/cn';

// Types
import { TimeEntryPayload, CaseId } from '@/types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface TimeEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId?: CaseId;
  onSave: (entry: TimeEntryPayload) => void;
}

/**
 * TimeEntryModal - React 18 optimized with useId
 */
export const TimeEntryModal: React.FC<TimeEntryModalProps> = ({ isOpen, onClose, caseId, onSave }) => {
  const [desc, setDesc] = useState('');
  const [duration, setDuration] = useState('0.5');
  const [isRefining, setIsRefining] = useState(false);
  const { theme } = useTheme();

  const handleRefine = async () => {
    if (!desc) return;
    setIsRefining(true);
    const polished = await GeminiService.refineTimeEntry(desc);
    setDesc(polished);
    setIsRefining(false);
  };

  const handleSave = () => {
    onSave({
      caseId: caseId || 'General',
      date: new Date().toISOString().split('T')[0],
      duration: parseFloat(duration) * 60,
      description: desc,
      rate: 450,
      total: parseFloat(duration) * 450,
      status: 'Unbilled'
    });
    setDesc('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={<span className={cn("flex items-center gap-2", theme.text.primary)}><Clock className={cn("h-5 w-5", theme.primary.text)}/> Log Billable Time</span>}
      size="sm"
    >
      <div className="p-6 space-y-5">
        <Input
          label="Matter / Case"
          value={caseId || 'General / Non-Billable'}
          disabled
          className={cn(theme.surface.input, theme.border.default, theme.text.primary)}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Duration (Hours)"
            type="number"
            step="0.1"
            value={duration}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDuration(e.target.value)}
            className={cn(theme.surface.input, theme.border.default, theme.text.primary)}
          />
          <div>
            <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Value Est.</label>
            <div className={cn("w-full px-3 py-2 border rounded-md text-sm font-mono flex items-center", theme.surface.input, theme.border.default, theme.text.primary)}>
              <DollarSign className={cn("h-3 w-3 mr-1", theme.text.tertiary)}/>
              {(parseFloat(duration || '0') * 450).toFixed(2)}
            </div>
          </div>
        </div>

        <div>
          <TextArea
            label="Description"
            placeholder="e.g. Call with client re: settlement strategy..."
            value={desc}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDesc(e.target.value)}
            rows={4}
            className={cn("resize-none", theme.surface.input, theme.border.default, theme.text.primary)}
          />
          <div className="mt-2 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefine}
              disabled={isRefining || !desc}
              icon={Wand2}
              isLoading={isRefining}
              className={cn("text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/50")}
            >
              AI Refine & Expand
            </Button>
          </div>
        </div>

        <div className="pt-2">
          <Button variant="primary" className="w-full" onClick={handleSave}>
            Save Time Entry
          </Button>
        </div>
      </div>
    </Modal>
  );
};

